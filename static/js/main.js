function openTerminal(options) {
    var client = new WSSHClient();
    var term = new Terminal({cols: 80, rows: 24, screenKeys: true, useStyle: true});
    term.on('data', function (data) {
        client.sendClientData(data);
    });
    term.open();
    $('.terminal').detach().appendTo('#term');
    $("#term").show();
    term.write('Connecting...');
    client.connect({
        onError: function (error) {
            term.write('Error: ' + error + '\r\n');
            console.debug('error happened');
        },
        onConnect: function () {
            client.sendInitData(options);
            client.sendClientData('\r');
            client.workerSendBeatData(options);
            console.debug('connection established');
        },
        onClose: function () {
            term.write("\rconnection closed")
            console.debug('connection reset by peer');
            $('term').hide()
        },
        onData: function (data) {
            term.write(data);
            console.debug('get data:' + data);
        }
    })
}

var charWidth = 6.2;
var charHeight = 15.2;

/**
 * for full screen
 * @returns {{w: number, h: number}}
 */
function getTerminalSize() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    return {
        w: Math.floor(width / charWidth),
        h: Math.floor(height / charHeight)
    };
}


function store(options) {
    try{
        
        var const_hostArray = "hostarray";

        var hostString = window.localStorage.getItem(const_hostArray);

        var hostArray = []
        
        try {
            hostArray = JSON.parse(hostString) || [];
        } catch (e) {
            hostArray = []
        }

        var filterResult = hostArray.filter(function (obj) {
            return (obj.host + obj.port) === (options.host + options.port);
        });

        if(filterResult.length <= 0){
            hostArray.push(options);
        }

        window.localStorage.setItem(const_hostArray,JSON.stringify(hostArray));

    }catch(e){
        // ignore
    }
}

function check() {
    return validResult["port"] && validResult["username"];
}

function connect() {
    // var remember = $("#remember").is(":checked")
    var options = {
        host: $("#host").val(),
        port: $("#port").val(),
        username: $("#username").val(),
        ispwd: $("input[name=ispwd]:checked").val(),
        secret: $("#secret").val(),
    }
    // if (remember) {
    //     store(options)
    // }
    store(options);
    if (check()) {
        openTerminal(options)
    } else {
        for (var key in validResult) {
            if (!validResult[key]) {
                alert(errorMsg[key]);
                break;
            }
        }
    }
}