var http = require('http');
var path = require('path');
var fs = require('fs');
var url = require('url');

http.createServer(function (req, res) {

    var uri = url.parse(req.url).pathname;
    var contentType = req.headers.accept;    
    
    console.log(contentType);
    console.log(uri);
    fs.readFile('index.html', 'binary', function (err, file) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.write(file, "binary");
        res.end();
    });

}).listen(7777);



