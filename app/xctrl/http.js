var http = require('http');

var xControlValue = function (datas) {
    var me = this, data = datas.split('@');
    if (data.length == 4) {
        me.tt = data[0].length ? data[0].split('|') : [];
        me.do = data[1].length ? data[1].split('|') : [];
        me.di = data[2].length ? data[2].split('|') : [];
        me.ai = data[3].length ? data[3].split('|') : [];
    } else {
        me.tt = [];
        me.do = [];
        me.di = [];
        me.ai = [];
    }
};

xControlValue.parse = function(value) {
    return new xControlValue(value);
};

xControlValue.prototype.getTemperatureSensorValue = function(i){
    var me = this, key = i - 1;
    if (typeof me.tt[key] == 'undefined') {
        console.error('unknown sensor: ' + key);
        return null;
    } else if (me.tt[key] == 'NC') {
        return false;
    } else {
        var str = '', value = me.tt[key].split('&');
        //if (value[0] != '0') str += '(!)';
        str += value[1];
        return parseFloat(str);
    }
};

xControlValue.prototype.getAnalogValue = function(i){
    var me = this, key = i - 1;
    if (typeof me.ai[key] == 'undefined') {
        console.error('unknown input: ' + key);
        return null;
    } else {
        return me.ai[key];
    }
};

xControlValue.prototype.getDiscreteOutputStatus = function(i){
    var me = this, key = i - 1;

    //console.error(' output: ', me.do[key]);


    if (typeof me.do[key] == 'undefined') {
        console.error('unknown output: ' + key);
        return null;
    } else if (me.do[key].charAt(1) != '0') {
        return (me.do[key].charAt(0) != '0');
    } else {
        return !(me.do[key].charAt(0) == '0');
    }
};

xControlValue.prototype.getDiscreteInputStatus = function(i){
    var me = this, key = i - 1;
    if (typeof me.di[key] == 'undefined') {
        console.error('unknown input: ' + key);
        return null;
    } else {
        return (me.di[key] == '0');
    }
};

var xControlDispatcherQueue = function (temperature, gis, dispatcher, succesCb, errorCb) {

    var me = this, changeSettingsQueue = [];
    for (var i = 1; i <= 6; i++) {
        changeSettingsQueue.push({
            // reley number
            c: i,
            // source number
            sn: i,
            // enabled disabled
            st: 1,
            // termo - 0 analog - 1
            stype: 0,
            //value
            val: temperature,
            // activate in range
            con: 0,
            // range
            gis: gis,
            success: function (data) {
                console.log('success callback executed for device pair: ' + me.current.c, data);
                if (me.queue.length) {
                    me.current = me.queue.shift();
                    setTimeout(function(){
                        me.next();
                    }, 100);
                } else {
                    me.current = false;
                }
            },
            failure: function (message) {
                console.log('error callback executed for device pair: ' + me.current.c);

                if (errorCb) errorCb(message);

                me.errors++;
                if (me.errors > 42) {
                    console.log('errors limit. stop.');
                }  else {
                    setTimeout(function(){
                        me.next();
                    }, 2000);
                }
            }
        });
    }

    this.queue = changeSettingsQueue;
    this.dispatcher = dispatcher;
    this.errors = 0;

    this.current = this.queue.shift();
};

xControlDispatcherQueue.prototype.next = function(){
    if (this.current) {
        this.dispatcher.thermostat(this.current);
    }
};

xControlDispatcherQueue.prototype.reset = function(){
    this.queue = [];
    this.current = false;
};



var xControlDispatcher = function (ip, port, pool) {
    this.ip = ip;
    this.port = port;
    this.pool = pool;
};

xControlDispatcher.prototype.reconfigure = function (ip, port, pool) {
    this.ip = ip;
    this.port = port;
    this.pool = pool;
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

xControlDispatcher.prototype.getStatus = function(cb){
    var url = 'http://' + this.ip + ':' + this.port + '/all';

    console.log('status', url);
    try {
        var request = http.get(url, function(res){
            var body = '';

            res.on('data', function(chunk){
                body += chunk;
            });

            res.on('end', function(){
                console.log('end', body);

                cb(xControlValue.parse(body));
            });


        }).on('error', function(e){
            console.log("Got an error: ", e);
            cb(xControlValue.parse(''));
        });

        request.setTimeout(5000, function() {
            console.log("Timeout error");
            request.connection.destroy();
        });

    } catch(err) {
        cb(xControlValue.parse(''));
    }
};


xControlDispatcher.prototype.check = function(cb){
    var url = 'http://' + this.ip + ':' + this.port + '/all';

    console.log('check', url);

    try {
        var request = http.get(url, function(res){
            var body = '';

            res.on('data', function(chunk){
                body += chunk;
            });

            res.on('end', function(){

                var value = xControlValue.parse(body);

                cb(value.getTemperatureSensorValue(1) !== null);
            });

        }).on('error', function(e){
            cb(false);
        });

        request.setTimeout(3000, function(e) {
            cb(false);
            request.connection.destroy();
        });
    }
    catch(err) {
        cb(xControlValue.parse(''));
    }
};

xControlDispatcher.prototype.setDiscreteOutputStatus = function(options){

    var url = 'http://' + this.ip + ':' + this.port + '/o?' + options.c + '/' + (options.st);

    console.log(url);

    var request = http.get(url, function(res){
        var body = '';

        res.on('data', function(chunk){
            body += chunk;
        });

        res.on('end', function(){
            if (options.success) options.success();
        });

    }).on('error', function(e){
        var error = 'Нет соединения с устройством. Проверте настройки соединения';
        console.log(error);
        if (options.failure) options.failure(error);
    });

    request.setTimeout(5000, function(e) {
        var error = 'Ошибка настройки do';
        console.log(error);
        if (options.failure) options.failure(error);
        request.connection.destroy();
    });
};

xControlDispatcher.prototype.thermostat = function(options){

    var params = {
        c:     options.c,
        st:    options.st,
        stype: options.stype,
        sn:    options.sn,
        val:   options.val,
        con:   options.con,
        gis:   options.gis
    };

    var str = "";
    for (var key in params) {
        if (str != "") {
            str += "&";
        }
        str += key + "=" + encodeURIComponent(params[key]);
    }

    var url = 'http://' + this.ip + ':' + this.port + '/ac?' + str;

    //192.168.1.170/cgi/a/1=1/1/3/36.8/1/2

    console.log('termostat', url);

    var request = http.get(url, function(res){
        var body = '';

        res.on('data', function(chunk){
            body += chunk;
        });

        res.on('end', function(){

            var matches = body.match(/(\{channel:(.*),st:(.*),stype:(.*),sn:(.*),val:(.*),con:(.*),gis:(.*)})/);

            if (matches && options.st == matches[3]) {

                if (options.success) options.success({
                    c:     parseInt(matches[2]),
                    st:    parseInt(matches[3]),
                    stype: parseInt(matches[4]),
                    sn:    parseInt(matches[5]),
                    val:   parseFloat(matches[6]),
                    con:   parseInt(matches[7]),
                    gis:   parseInt(matches[8])
                });
            } else {
                var error = 'Ошибка настройки автоматики';
                if (options.failure) options.failure(error);
            }

        });

    }).on('error', function(e){
        var error = 'Нет соединения с устройством. Проверте настройки соединения';
        console.log(error);
        if (options.failure) options.failure(error);
        //console.log("Got an error: ", e);
    });

    request.setTimeout(5000, function(e) {
        var error = 'Ошибка настройки автоматики';
        console.log(error);
        if (options.failure) options.failure(error);
        request.connection.destroy();
    });
};


xControlDispatcher.prototype.batchThermostat = function(temperature, gis) {

    if (this.batchQueue) {
        this.batchQueue.reset();
    }

    this.batchQueue = new xControlDispatcherQueue(temperature, gis, this);
    this.batchQueue.next();

};

xControlDispatcher.prototype.poll = function() {

    var me = this;
    if (me.polling) {
        return;
    }

    // to prevent 2 sym polling
    me.polling = true;
    me.data = false;
    me.errorsCount = 0;

    var poolingFunc = function() {
        me.getStatus(function(res) {

            //if (JSON.stringify(res) != JSON.stringify(me.data)) {
            me.fireEvent('change', res);
            //}

            me.data = res;
            if (res.getTemperatureSensorValue(1) === null) {
                me.errorsCount++;
            } else {
                me.errorsCount = 0;
            }

            var timeout = 1000;
            if (me.errorsCount > 10) {
                timeout = 30000;
            } else if (me.errorsCount > 6) {
                timeout = 10000;
            } else if (me.errorsCount > 3) {
                timeout = 5000;
            } else if (me.errorsCount > 1) {
                timeout = 3000;
            }

            setTimeout(poolingFunc, (me.pool?me.pool:3)*timeout);

        });
    };

    poolingFunc();
};

module.exports = xControlDispatcher;
