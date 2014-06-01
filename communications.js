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
        setSession: function (data) {

            for (key in data) {
                req.session[key] = data[key]
            }
        },
        getSession: function (callback) {
            callback(req.session);
        },
        req: req,
        url: req.url,
        res: res
    }

    // handle POST request
    if (req.method === 'POST') {

        // build link
        link.data = req.body;

        //call opperation
        cached_modules[module][operation](link);
    }
}
