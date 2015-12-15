/*
 * Copyright (c) 2015, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package org.wso2.carbon.la.core.utils;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class LogPatternExtractor {

    private File file;

    private static final Log log = LogFactory.getLog(LogPatternExtractor.class);
    public static final Pattern apacheLogRegex = Pattern.compile("^([\\d.]+) (\\S+) (\\S+) \\[([\\w\\d:/]+\\s[+\\-]\\d{4})\\] \"(.+?)\" (\\d{3}) ([\\d\\-]+) \"([^\"]+)\" \"([^\"]+)\".*");
    public static final Pattern LogRegex = Pattern.compile("");

    public int processPart(long start, long end) throws IOException {
        FileInputStream fis = null;
        BufferedReader reader = null;
        int count=0;

        try {
            fis = new FileInputStream(file);
            reader = new BufferedReader(new InputStreamReader(fis));
            reader.skip(start);
            System.out.println("Reading File line by line using BufferedReader");

            String line = reader.readLine();
            while (line != null) {
                System.out.println(line);
                Matcher m =apacheLogRegex.matcher(line);
                if(m.find()){
                    count++;
                }
                line = reader.readLine();
            }
            return count;
        } finally {
            try {
                if (reader != null) {
                    reader.close();
                }
                if (fis != null) {
                    fis.close();
                }
            } catch (IOException ignored) {
            }
        }
    }



    // Creates a task that will process the given portion of the file,
    // when executed.
    public Callable<Integer> processPartTask(final long start, final long end) {
        return new Callable<Integer>() {
            public Integer call()
                    throws Exception
            {
                return processPart(start, end);
            }
        };
    }

    // Splits the computation into chunks of the given size,
    // creates appropriate tasks and runs them using a
    // given number of threads.
    public void processAll(int noOfThreads, int chunkSize)
            throws Exception
    {
        int count = (int)((file.length() + chunkSize - 1) / chunkSize);
        java.util.List<Callable<Integer>> tasks = new ArrayList<>(count);
        for(int i = 0; i < count; i++)
            tasks.add(processPartTask(i * chunkSize, Math.min(file.length(), (i+1) * chunkSize)));
        ExecutorService es = Executors.newFixedThreadPool(noOfThreads);

        java.util.List<Future<Integer>> results = es.invokeAll(tasks);
        es.shutdown();

        for(Future<Integer> result : results)
            System.out.println(result.get());
    }
}
