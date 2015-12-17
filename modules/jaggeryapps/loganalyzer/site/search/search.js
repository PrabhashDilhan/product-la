var serverUrl = window.location.origin;
var resultTable =  $('#results-table').DataTable( {
    "ajax" : {
        "url": serverUrl + "/api/search",
        "type": "POST",
        "dataType": "json",
        "contentType": "application/json; charset=utf-8",
        "data": function (payload) {
            payload.query = $("#search-field").val();
            payload.start = 0;
            payload.count = 100;
            payload.timeFrom = parseInt($("#timestamp-from").val());
            payload.timeTo = parseInt($("#timestamp-to").val());
            return JSON.stringify(payload)
        },
        "dataSrc" : function(d){
            return d
        }
    },
    "columns": [
        {"data": "values._message"}
    ],
    "searching": false

});

/* Formatting a table to insert when a row is clicked */
function format ( d ) {
    return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">' +
        '<tr>' +
        '<td>Log Stream: </td>' +
        '<td>' + d.values._logstream + '</td>' +
        '</tr>' +
        '<tr>' +
        '<td>Client IP: </td>' +
        '<td>' + d.values._clientip + '</td>' +
        '</tr>' +
        '<tr>' +
        '<td>Timestamp: </td>' +
        '<td>' + d.values._timestamp + '</td>'+
        '</tr>'+
        '<tr>' +
        '<td>Host: </td>' +
        '<td>' + d.values._host + '</td>'+
        '</tr>'+
        '<tr>' +
        '<td>Message: </td>' +
        '<td>' + d.values._message + '</td>'+
        '</tr>'+
        '<tr>' +
        '<td>Path: </td>' +
        '<td>' + d.values._path + '</td>'+
        '</tr>'+
        '<tr>' +
        '<td>Method: </td>' +
        '<td>' + d.values._verb + '</td>'+
        '</tr>'+        '<tr>' +
        '<td>Request: </td>' +
        '<td>' + d.values._request + '</td>'+
        '</tr>'+        '<tr>' +
        '<td>Agent: </td>' +
        '<td>' + d.values._agent + '</td>'+
        '</tr>'+
        '</table>';
}


$(document).ready(function () {
    var showPopover = $.fn.popover.Constructor.prototype.show;
    $.fn.popover.Constructor.prototype.show = function () {
        showPopover.call(this);
        if (this.options.showCallback) {
            this.options.showCallback.call(this);
        }
    };

    $("#date-time-select").popover({
        html: true,
        content: function() {
            return $('#timeListContent').html();
        },
        showCallback: function () {
            $('.datepicker').datepicker();
            $('.timepicker').timepicker(
                {
                    'step': '20',
                    'minTime': '9:00am',
                    'maxTime': '12:00pm',
                    'timeFormat': 'H:i:s'
                }
            );
        }
    });

    $('#results-table tbody').on( 'click', 'tr', function () {
        var tr = $(this).closest('tr');
        var row = resultTable.row( tr );

        if ( row.child.isShown() ) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            // Open this row
            row.child( format(row.data()) ).show();
            tr.addClass('shown');
        }
    } );
});

function searchActivities2() {
    var payload = {};
    payload.query = $("#search-field").val()
    payload.start = 0
    payload.count = 100
    console.log(payload)
    jQuery.ajax({
        type: "POST",
        data : JSON.stringify(payload),
        dataType : "json",
        contentType : "application/json; charset=utf-8",
        url: serverUrl + "/api/search",
        success: function(res) {
            appendDataToTable(res);
        },
        error: function(res) {
            alert(res.responseText);
        }
    });
}

function changeTime(value, timestampFrom, timestampTo) {
    var buttonHeight = $("#date-time-select").outerHeight();
    var buttonWidth = $("#date-time-select").outerWidth();
    $("#date-time-select").css({ 'height': buttonHeight});
    $("#date-time-select").css({ 'width': buttonWidth});
    $("#timestamp-from").val(timestampFrom);
    $("#timestamp-to").val(timestampTo);
    $("#date-time-select").text(value);
}

function assignDateRange() {
    var dateFrom = $("#dateRangeDatePickerFrom").val();
    var dateTo = $("#dateRangeDatePickerTo").val();
    changeTime(dateFrom + "-" + dateTo, new Date(dateFrom).getTime(), new Date(dateTo).getTime());
}

function assignDateTimeRange() {
    var dateFrom = $("#dateTimeRangeDatePickerFrom").val();
    var timeFrom = $("#dateTimeRangeTimePickerFrom").val();
    var dateTo = $("#dateTimeRangeDatePickerTo").val();
    var timeTo = $("#dateTimeRangeTimePickerTo").val();
    changeTime(dateFrom + ":" + timeFrom + "-" + dateTo + ":" + timeTo, new Date(dateFrom + " " + timeFrom).getTime(),
        new Date(dateTo + " " + timeTo).getTime());
}

function getLastWeek(){
    var today = new Date();
    return lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
}

function getLastMonth(){
    var today = new Date();
    return lastWeek = new Date(today.getFullYear(), today.getMonth() -1, today.getDate());
}

function searchActivities(data){
  resultTable.ajax.reload();
}
