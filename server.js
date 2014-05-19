var http = require('http');
var path = require('path');
var fs = require('fs');
var url = require('url');
var config = require('../app.json');
var comm = require('./communications.js');

http.createServer(function (req, res) {

    var uri = url.parse(req.url).pathname;
    var contentType = req.headers.accept.split(',')[0];    
    var method = req.method;

    if (uri.substring(0, 3) !== '/@/' && method === 'GET') {
        var filename;

        // handle routes
        if (contentType === 'text/html') {

            if (config.routes[uri]) {
                var page = config.routes[uri];
                filename = config.pages[page].html;
            } else {
                filename = config.pages['not_found'].html;
            }

            fs.readFile(filename, "binary", function(err, file) {
                if(err) {        
                    res.writeHead(500, {"Content-Type": "text/plain"});
                    res.write(err + "\n");
                    res.end();
                    return;
                }

                res.writeHead(200, {"Content-Type": "text/html"});
                res.write(file, "binary");
                res.end();
            });
        // handle rest
        } else {
            filename = 'public/' + uri;

            fs.readFile(filename, "binary", function(err, file) {
                if(err) {        
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
    } else if (uri.substring(0, 3) === '/@/') {

        var module = uri.split('/')[2];
        var operation = uri.split('/')[3];

        // send the req to the right module
        comm.handleReq(req, module, operation, res);
    }

}).listen(9016);
