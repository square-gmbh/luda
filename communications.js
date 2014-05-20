var qs = require('querystring');
var cached_modules = {};
var link = {};

exports.handleReq = function (req, module, operation, res) {

    // cache module if it isn't already
    if (!cached_modules[module]) {
        cached_modules[module] = require('../modules/' + module + '/operations.js');
    }

    // build link
    link = {
        method: req.method,
        headers: req.headers,
        url: req.url,
        res: res
    }

    // handle POST request
    if (req.method === 'POST') {

        //process POST data
        processPost(req, function (err, data) {

            if (err) {
                res.writeHead(413, {'Content-Type': 'text/plain'}).end();
                req.connection.destroy();
                return;
            }

            // build link
            link.data = data;

            //call opperation
            cached_modules[module][operation](link);
        });
    }
}

function processPost (req, callback) {
    var queryData = '';

    req.on('data', function(data) {
        queryData += data;

        // kill request if too large
        if (queryData.length > 1e6) {
            queryData = '';
            return callback(new Error('Request data too large!'));
        }
    });

    req.on('end', function() {
        var body = qs.parse(queryData)
        callback(null, body);
    });
}