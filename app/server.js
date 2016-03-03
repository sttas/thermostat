(function startServer(){
    //
    var xControlDispatcher = require('./xctrl/tcp');
    //
    var low = require('lowdb');
    var storage = require('lowdb/file-sync');

    var gui = window.require('nw.gui');

    //
    try {
      var db = low(gui.App.dataPath + '/data.json', {storage});
    } catch (e) {
      var fs = require('fs');
      fs.unlinkSync(gui.App.dataPath + '/data.json');
      var db = low(gui.App.dataPath + '/data.json', {storage});
    }


    var settingsData = db('settings').first();
    if (!settingsData) {
        db('settings').push({
            name: 'settings',
            thermostat: 23,
            mode: 'off',
            eco: 14,
            comfort: 27,
            pool: 8,
            gis: 4,
            password: 'admin',
            cnt: 7,
            ip: '62.64.87.239',
            port: '5001',
            initialized:true
        });
        settingsData = db('settings').first();
    }

    var settings = {
        get: function(key) {

            if (!key) {
                return settingsData;
            }

            return settingsData[key];
        },
        set: function(key, value) {
            settingsData[key] = value;
            db.write();
        }
    };

    var dispatcher = new xControlDispatcher(settingsData.ip, settingsData.port, settingsData.pool);
    dispatcher.getStatus();


    var formatDeviceResponse = function(res) {

        if (res.getTemperatureSensorValue(1) === null) {
            return {
                temperature: ['-', '-', '-', '-', '-',],
                reley:       ['-', '-', '-', '-', '-',],
            };
        } else {
            return {
                temperature: [
                    res.getTemperatureSensorValue(1),
                    res.getTemperatureSensorValue(2),
                    res.getTemperatureSensorValue(3),
                    res.getTemperatureSensorValue(4),
                    res.getTemperatureSensorValue(5),
                    res.getTemperatureSensorValue(6),
                ],
                reley: [
                    res.getDiscreteOutputStatus(1),
                    res.getDiscreteOutputStatus(2),
                    res.getDiscreteOutputStatus(3),
                    res.getDiscreteOutputStatus(4),
                    res.getDiscreteOutputStatus(5),
                    res.getDiscreteOutputStatus(6),
                ]
            };
        }
    };



    var logicHandler = function(disp, type, res) {

        if (res) {
            if (res.getTemperatureSensorValue(1) !== null) {
                var temperature = 0, gis = settings.get('gis');
                if (settings.get('mode') == 'eco') {
                    temperature = settings.get('eco');
                } else if (settings.get('mode') == 'comfort') {
                    temperature = settings.get('comfort');
                } else if (settings.get('mode') == 'heating') {
                    temperature = 100;
                } else if (settings.get('mode') == 'thermostat') {
                    temperature = settings.get('thermostat');
                } else {
                    temperature = -100;
                }

                var update = [];
                for (var at = 1; at <= 6; at++) {
                    var dg = res.getTemperatureSensorValue(at);
                    var enabled = res.getDiscreteOutputStatus(at);

                    if ((dg > temperature && enabled)) {
                        update.push({c: at, st: 0});
                    } else if (dg < (temperature - gis) && !enabled) {
                        update.push({c: at, st: 1});
                    }
                }

                if (update.length) {
                    disp.setDiscreteOutputStatus(update);
                }

            }
        }
    };

    dispatcher.on('change', logicHandler);


    var express = require('express'), session = require('express-session');


    var server = express();

    server.use(session({
        secret: '2C44-4D44-WppQ38S',
        resave: true,
        saveUninitialized: true
    }));

    // Authentication and Authorization Middleware
    var auth = function(req, res, next) {
        if (req.session && req.session.user === "admin" && req.session.admin)
            return next();
        else
            return res.redirect('/login');
    };

    // Login endpoint
    server.get('/login', function (req, res) {
        if (!req.query.username || !req.query.password) {
            res.send('login failed'+req.query.username);
        } else if(req.query.username === "admin" || req.query.password === "admin") {
            req.session.user = "admin";
            req.session.admin = true;
            res.redirect('/index.html')
        }
    });

    // Logout endpoint
    server.get('/logout', function (req, res) {
        req.session.destroy();
        res.send("logout success!");
    });

    // Get content endpoint
    server.use(auth);

    var appServer = server.listen(3000);

    server.use(express.static(__dirname + '/public'));

    var io = require('socket.io').listen(appServer);
    io.on('connection', function (socket) {

        socket.emit('init', {
            settings: settings.get(),
            device: (dispatcher.getLatestResponse().getTemperatureSensorValue(1) === null) ? false : true,
            data: formatDeviceResponse(dispatcher.getLatestResponse())
        });

        socket.on('savesettings', function (data, fn) {

            var disp = new xControlDispatcher(data.ip, data.port);
            disp.check(function(success) {
                fn(success);
                if (success) {

                    settings.set('ip',      data.ip);
                    settings.set('port',    data.port);
                    settings.set('gis',     data.gis);
                    settings.set('eco',     data.eco);
                    settings.set('comfort', data.comfort);
                    settings.set('pool',    data.pool);

                    if (data.password) {
                        settings.set('password', data.password);
                    }

                    dispatcher.reconfigure(data.ip, data.port, data.pool);

                    io.sockets.emit('refresh', {
                        settings: settings.get()
                    });
                }
            });
        });

        socket.on('update', function (data) {

            window.console.log('server got update from ui');

            settings.set(data.key, data.value);

            logicHandler(dispatcher, null, dispatcher.getLatestResponse());

            io.sockets.emit('refresh', {
                settings: settings.get()
            });
        });

    });


    dispatcher.on('change', function(disp, type, res) {
        if (res) {
            io.sockets.emit('refresh', {
                device: (res.getTemperatureSensorValue(1) === null) ? false : true,
                settings: settings.get(),
                data: formatDeviceResponse(res)
            });
        }
    });

    window.location.assign('http://localhost:3000/login/?username=admin&password=' + settingsData.password);

})();