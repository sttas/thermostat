var net = require('net');


var xControlValue = function (data) {
    this.data = data;
};

xControlValue.parse = function(value) {
    return new xControlValue(value);
};

xControlValue.prototype.getTemperatureSensorValue = function(i){
    var me = this;
    if (typeof me.data['t' + i] == 'undefined') {
        console.error('unknown sensor: ' + i);
        return null;
    } else if (me.data['t' + i]['t'] == 'NC') {
        return false;
    } else {
        return me.data['t' + i]['t'];
    }
};

xControlValue.prototype.getAnalogValue = function(i){
    var me = this;
    if (typeof me.data['ai' + i] == 'undefined') {
        console.error('unknown analog input: ' + i);
        return null;
    } else {
        return me.data['ai' + i]['v'];
    }
};

xControlValue.prototype.getDiscreteOutputStatus = function(i){
    var me = this;
    if (typeof me.data['do'+i] == 'undefined') {
        console.error('unknown output: ' + i);
        return null;
    } else {
        return me.data['do'+i]['a']['v'];
    }
};

xControlValue.prototype.getDiscreteInputStatus = function(i){
    //var me = this, key = i - 1;
    //if (typeof me.di[i] == 'undefined') {
    //    console.error('unknown input: ' + key);
    //    return null;
    //} else {
    //    return (me.di[key] == '0');
    //}
};

var xControlDispatcher = function (ip, port, pool) {
    this.ip = ip;
    this.port = port;
    this.pool = pool;

    this.latestValue = xControlValue.parse(false);

    // socket
    this.connected = false;
    this.client = false;

    this.pollingTimeout = false;
};

xControlDispatcher.prototype.reconfigure = function (ip, port, pool) {
    this.ip = ip;
    this.port = port;
    this.pool = pool;

    // socket
    if (this.client) {
        this.client.destroy();
    }
    this.connected = false;
    this.client = false;
};

xControlDispatcher.prototype.on = function(type, method, scope, context) {
    var listeners, handlers;
    if (!(listeners = this.listeners)) {
        listeners = this.listeners = {};
    }
    if (!(handlers = listeners[type])) {
        handlers = listeners[type] = [];
    }
    scope = (scope ? scope : this);
    handlers.push({
        method: method,
        scope: scope,
        context: (context ? context : scope)
    });
};

xControlDispatcher.prototype.fireEvent = function(type, data, context) {
    var listeners, handlers, i, n, handler, scope;
    if (!(listeners = this.listeners)) {
        return;
    }
    if (!(handlers = listeners[type])) {
        return;
    }

    for (i = 0, n = handlers.length; i < n; i++) {
        handler = handlers[i];
        if (typeof(context)!=="undefined" && context !== handler.context) continue;
        if (handler.method.call(
                handler.scope, this, type, data
            )===false) {

            return false;
        }
    }
    return true;
};

xControlDispatcher.prototype.handleClientError = function(){
    var me = this;
    if (me.client) {
        me.client.destroy();
        me.client = false;
    }
    me.connected = false;


    var value = xControlValue.parse(false);
    me.fireEvent('change', value);
    me.latestValue = value;

    me.schedule(2000);
};

xControlDispatcher.prototype.write = function(request, cb) {

    var me = this;

    me.unschedule();

    window.console.log('tcp:write');

    if (!me.client) {

        me.client = new net.Socket();

        window.console.log('creating client');

        me.client.setTimeout(1000 * (me.pool + 2));

        me.client.on('data', function(data, o) {

            me.connected = true;

            window.console.log(data.toString());

            var stingData = data.toString();

            while (true) {

                if (stingData.substring(0, 6) === '{"t1":') {
                    window.console.log('clearing buffer');
                    me.client.responseBuffer = '';
                }

                var pos = stingData.indexOf('}}}');
                if (pos !== -1) {
                    me.client.responseBuffer += stingData.substr(0, pos+3);
                    stingData = stingData.substr(3 + pos);

                    try {
                        window.console.log('try parse');
                        var response = JSON.parse(me.client.responseBuffer);
                        if (response) {

                            me.client.responseBuffer = '';
                            var value = xControlValue.parse(response);
                            window.console.log('succesfully parsed');

                            me.fireEvent('change', value);
                            me.latestValue = value;

                            window.console.log(value);
                            //me.client.destroy();
                            //me.client = false;
                        }
                    } catch (e) {
                        window.console.log('failed parsing', me.client.responseBuffer);
                        window.console.log(e);
                    }

                } else {
                    window.console.log('put to buffer:', stingData);
                    me.client.responseBuffer += stingData;
                    stingData = '';
                }

                if (!stingData.length) {
                    break;
                }

            }

            me.schedule();
        });

        // Add a 'close' event handler for the client socket
        me.client.on('close', function() {
            window.console.log('tcp:connection closed');
            if (me.client) {
                me.client.destroy();
                me.client = false;
            }
            me.connected = false;

            //me.schedule(2000);
        });

        me.client.on('error', function(exception){
            window.console.log('tcp:exception:', exception);
            me.handleClientError();
        });

        me.client.on('drain', function() {
            window.console.log("tcp:drain!");
            me.handleClientError();
        });

        me.client.on('timeout', function() {
            window.console.log("tcp:timeout!");
            me.handleClientError();
        });


        me.client.connect(this.port, this.ip, function() {
            window.console.log('connected...');

            me.connected = true;
            window.console.log('write...', request);

            me.client.responseBuffer = '';
            me.client.write('@' + JSON.stringify(request));
        });
    }



    if (me.connected) {
        window.console.log('already connected.', me.client.writable);
        window.console.log('write...', request);
        me.client.write('@' + JSON.stringify(request));
    } else {
        window.console.log('cant write... no connection');
        me.schedule(10000);
    }


};


xControlDispatcher.prototype.getLatestResponse = function() {
    return this.latestValue;
};

xControlDispatcher.prototype.getStatus = function(cb){
    var request = {
        "__ss__": {"timeout_tcp": 2 * this.pool}
    };
    this.write(request, cb);
};


xControlDispatcher.prototype.check = function(cb){

    try {

        var client = new net.Socket();
        client.connect(this.port, this.ip, function() {
            cb(true);
        });
        client.setTimeout(3000);
        // Add a 'close' event handler for the client socket
        client.on('close', function() {
            window.console.log('tcp:connection closed');
        });

        client.on('error', function(exception){
            window.console.log('tcp:exception:');
            window.console.log(exception);
            cb(false);
        });

        client.on('drain', function() {
            window.console.log("tcp:drain");
            cb(false);
        });

        client.on('timeout', function() {
            window.console.log("tcp:timeout!");
            cb(false);
        });

    } catch(err) {
        cb(false);
    }
};

xControlDispatcher.prototype.setDiscreteOutputStatus = function(options) {

    window.console.log('setDiscreteOutputStatus');

    var request = {
        "__ss__": {"timeout_tcp": 2 * this.pool}
    };

    if (Object.prototype.toString.call(options) !== '[object Array]') {
        options = [options];
    }

    for (var i = 0; i < options.length; i++) {
        request['do' + options[i].c] = { a: options[i].st == 1 ? true : false};
    }

    this.write(request);
};


xControlDispatcher.prototype.unschedule = function(sec) {
    var me = this;
    if (me.pollingTimeout) {
        clearTimeout(me.pollingTimeout);
    }
};

xControlDispatcher.prototype.schedule = function(sec) {
    var me = this;
    var timeout = sec ? sec : ((me.pool ? me.pool : 10 ) * 1000);
    if (me.pollingTimeout) {
        clearTimeout(me.pollingTimeout);
    }
    window.console.log('schedule', timeout);
    me.pollingTimeout = setTimeout(function () {
        me.getStatus();
    }, timeout);
};

module.exports = xControlDispatcher;
