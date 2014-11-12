var path = require('path');
var fs = require('fs');
var express = require('express');
var app = express();
var url = require('url');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var config = require(path.join(__dirname, '../app.json'));
var comm = require('./lib/communications.js');
var router = require('./lib/router.js');
var port;

// handle custom code
if (config.socket) {
    var socket = require('../' + config.socket);
    socket(fs, io);
}

// configure app
app.configure(function () {
    app.use(express.static(path.join(__dirname, '../public')));
    app.use(express.bodyParser());
    app.use(express.logger("short"));
    port = process.argv[2] || config.port;
});
// session init
app.use(express.cookieParser('S3CRE7'));
app.use(express.cookieSession({
    key: 'app.sess',
    secret: 'SUPERsekret'
}));

// handle get requests
app.get("*", function (req, res) {

    // get the request url
    var uri = url.parse(req.url).pathname;

    // check if request is module or not
    if (uri.substring(0, 3) === '/@/') {
        // module request
        // TODO implement this

        res.writeHead(500);
        res.end('Not yet implemented');
    } else {
        // handle routes
        router.handleRoute(req, res);
    }
});

// handle post requests
app.post("*", function (req, res) {
    
    // get the request url
    var uri = url.parse(req.url).pathname;

    if (uri.substring(0, 3) === '/@/') {

        // forward request
        comm.handleReq(config.modules, uri, req, res);

    } else {
        // this application does not support this kind of request please make a module POSt req
        res.writeHead(400);
        res.end('this application does not support this kind of request please make a module POST request instead ("/@/.../...")');
    }
});

http.listen(port);
