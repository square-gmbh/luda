var path = require('path');
var fs = require('fs');
var express = require('express');
var app = express();
var url = require('url');
var config = require('../app.json');
var comm = require('./communications.js');

// configure app
app.configure(function () {
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.bodyParser());
    app.use(express.logger("short"));
});

// handle get requests
app.get("*", function (req, res) {

    // get the request url
    var uri = url.parse(req.url).pathname;
    var contentType = req.headers.accept.split(',')[0];

    // check if request is module or not
    if (uri.substring(0, 3) === '/@/') {
        // module request
        // TODO implement this

        res.writeHead(500);
        res.end('Not yet implemented');
    } else {

        var filename;

        // handle routes
        if (contentType === 'text/html') {

            if (config.routes[uri]) {
                var page = config.routes[uri];
                filename = config.pages[page].html;

                // send the file
                fs.readFile(filename, "binary", function(err, file) {

                    if (err) {        
                        res.writeHead(500, {"Content-Type": "text/plain"});
                        res.write(err + "\n");
                        res.end();
                        return;
                    }

                    res.writeHead(200, {"Content-Type": "text/html"});
                    res.write(file, "binary");
                    res.end();
                });
            } else {

                // check if the not found file exists
                if (!config.pages['not_found']) {
                    res.writeHead(404);
                    res.write('404 Page not found');
                    res.end();
                    return;
                }

                // get the file
                var filename = config.pages['not_found'].html;
                // send the file
                fs.readFile(filename, "binary", function(err, file) {

                    if (err) {        
                        res.writeHead(500, {"Content-Type": "text/plain"});
                        res.write(err + "\n");
                        res.end();
                        return;
                    }

                    res.writeHead(200, {"Content-Type": "text/html"});
                    res.write(file, "binary");
                    res.end();
                });
            }

        // handle rest
        } else {
            filename = 'public/' + uri;

            fs.readFile(filename, "binary", function(err, file) {
                if (err) {        
                    res.writeHead(500, {"Content-Type": "text/plain"});
                    res.write(err + "\n");
                    res.end();
                    return;
                }

                res.writeHead(200, {"Content-Type": contentType});
                res.write(file, "binary");
                res.end();
            });
        }
    }
});

// handle post requests
app.post("*", function (req, res) {
    
    // get the request url
    var uri = url.parse(req.url).pathname;

    if (uri.substring(0, 3) === '/@/') {

        var module = uri.split('/')[2];
        var operation = uri.split('/')[3];

        // handle the request
        if (config.modules.indexOf(module) != -1) {
            comm.handleReq(req, module, operation, res);
        } else {
            res.writeHead(400);
            res.end('module does not exist or not declared in the application descriptor file');
        }
    } else {
        // this application does not support this kind of request please make a module POSt req
        res.writeHead(400);
        res.end('this application does not support this kind of request please make a module POST request instead ("/@/.../...")');
    }
});

app.listen(9016);
