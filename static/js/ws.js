function WSSHClient() {
};

WSSHClient.prototype._generateEndpoint = function () {
    if (window.location.protocol == 'https:') {
        var protocol = 'wss://';
    } else {
        var protocol = 'ws://';
    }
    var endpoint = protocol + window.location.host + '/ws';
    return endpoint;
};

WSSHClient.prototype.connect = function (options) {
    var endpoint = this._generateEndpoint();
    var _this = this;
    if (window.WebSocket) {
        this._connection = new WebSocket(endpoint);
    }
    else if (window.MozWebSocket) {
        this._connection = MozWebSocket(endpoint);
    }
    else {
        options.onError('WebSocket Not Supported');
        return;
    }

    this._connection.onopen = function () {
        options.onConnect();
    };

    this._connection.onmessage = function (evt) {
        var data = evt.data.toString()
        options.onData(data);
    };


    this._connection.onclose = function (evt) {
        options.onClose();
        clearInterval(_this._workerOfBeat);
    };
};

WSSHClient.prototype.send = function (data) {
    this._connection.send(JSON.stringify(data));
};

WSSHClient.prototype.sendInitData = function (options) {
    var data = {
        hostname: options.host,
        port: options.port,
        username: options.username,
        ispwd: options.ispwd,
        secret: options.secret
    };
    this._connection.send(JSON.stringify({"tp": "init", "data": options}))
}

WSSHClient.prototype.workerSendBeatData = function(options){
    var _this = this;
    this._workerOfBeat = setInterval (function() {
        console.debug("beat -> " , options)
        _this._connection.send(JSON.stringify({"tp": "beat", "data": options}))
    },10000)
}

WSSHClient.prototype.sendClientData = function (data) {
    this._connection.send(JSON.stringify({"tp": "client", "data": data}))
}

var client = new WSSHClient();
