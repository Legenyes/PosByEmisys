var api_url = "https://api.byemisys.com/pi.php";
var api_test_url = "https://api-test.byemisys.com/pi.php";
var app_id = 6;
var event_id = 6;

var ajax_stack = new Array();
var ajax_timer = "";

function emisys_ajax(action, data, callback) {
    var $data = $.extend({}, data);

    clearTimeout(ajax_timer);
    var timeout = 10000;

    // DO NOT ALLOW TO CALL 2X WITH SAME DATA
    var $datak = $.extend({}, data);
    delete($datak.image);
    var akey = action + "-" + JSON.stringify($datak);
    if (ajax_stack[akey] == 1) {
        return true;
    }

    ajax_stack[akey] = 1;
    $data.action = action;
    $data.app_id = app_id;
    $data.event_id = event_id;
    //$data.test = 1;

    var xhr = $.ajax({
        dataType: "json",
        type: "POST",
        url: api_url,
        data: $data,
        timeout: timeout,
        crossDomain : true,
        async: true,
        success: function (msg) {
            clearTimeout(ajax_timer);
            delete(ajax_stack[akey]);
            callback(msg);
        },
        error: function (xhr, t, thrownError) {
            delete(ajax_stack[akey]);
            console.log(xhr);
        }
    });

}
