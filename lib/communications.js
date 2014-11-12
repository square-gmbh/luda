var path = require('path');
var MODULES_DIR = path.join(__dirname, '../../modules/');

var cached_modules = {};
var link = {};

exports.handleReq = function (modulesConfig, uri, req, res) {

    // get module and opeation from request
    var module = uri.split('/')[2];
    var operation = uri.split('/')[3];

    // check if module exists
    if (!modulesConfig.hasOwnProperty(module)) {
        res.writeHead(404);
        res.end('module does not exist or not declared in the application descriptor file');
        return;
    }

    // get module config
    var moduleConfig = modulesConfig[module];

    // check if module has requested operation
    if (!moduleConfig.operations.hasOwnProperty(operation)) {
        res.writeHead(404);
        res.end('operation does not exist or not declared in the application descriptor file');
        return;
    }
    var operationConfig = moduleConfig.operations[operation];

    // check if user has rquired access rights
    if (operationConfig.roles) {

        var role = (req.session.login) ? req.session.login.role : null;
        if (!role) role = 'visitator';

        if (operationConfig.roles.indexOf(role) === -1) {
            res.writeHead(403);
            res.end("Access Denied");
            return;
        }
    }

    var operationFile = (operationConfig.file) ? operationConfig.file : 'operations.js';

    // cache module if it isn't already
    if (!cached_modules[module]) {
        cached_modules[module] = require(MODULES_DIR + module + '/' + operationFile);
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
