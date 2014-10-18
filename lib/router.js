var path = require('path');
var fs = require('fs');
var url = require('url');
var config = require(path.join(__dirname, '../../app.json'));
var PUBLIC_DIR = path.join(__dirname, '../../public');

exports.handleRoute = function (req, res) {

    // get the request url
    var uri = url.parse(req.url).pathname;

    checkRoute(uri, function (err, page) {

        // 404
        if (err) {
            // check if the not found file exists
            if (!config.errors['not_found']) {
                res.writeHead(404);
                res.write('404 Page not found');
                res.end();
                return;
            }

            // get the file
            filename = path.join(PUBLIC_DIR, config.errors['not_found'].html);

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
            // get page html
            filename = path.join(PUBLIC_DIR, config.pages[page].html);

            // handle roles (if exist) (user permisions)
            if (config.pages[page].roles) {

                // get role from session
                var roles = config.pages[page].roles;
                var role = (req.session.login) ? req.session.login.role : null;
                if (!role) role = 'visitator';

                // if the user doesn't have permission or role is missing run the fail action
                if (roles.indexOf(role) == -1) {

                    // if no roleFail action or action is reject , reject user
                    if (!config.pages[page].roleFail || config.pages[page].roleFail[0].reject) {
                        res.writeHead(403);
                        res.end("You don't have permission to view this page");
                        return;
                    }

                    // get the action
                    var action = config.pages[page].roleFail[0];

                    if (action.redirect) {
                        var location = 'http://' + req.headers.host + action.redirect;
                        res.writeHead(302, {"location": location});
                        res.end();
                        return;
                    }
                } else {
                    // user has permision so he gets the file
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

            } else {
                // if no roles specified for current page give it as is
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
        }
    });
}

function checkRoute (uri, callback) {

    // go through all page queries
    for (var page in config.pages) {
        if (!config.pages[page].re) continue;

        // get page regex
        var re = config.pages[page].re;

        if (uri.match(re)) {
            return callback(null, page);
        }
    }

    // 404
    callback('404');
}