/* Including static file webserver libraries*/
var static = require('node-static');

/*Include HTTP server library*/
var http = require('http');

/*Assume this is running on a web server (Heroku)*/
var port = process.env.PORT;
var directory = __dirname + '/public';

/*If this is not a web server, the readjust the port to localhost*/
if(typeof port == 'undefined' || port){
    directory = './public';
    port = 8080;
}

/*Set up static web server*/
var file = new static.Server(directory);

/*Construct http server to get file from the file server*/
var app = http.createServer(
    function (request,response) {
        request.addListener('end', function () {
            file.serve(request,response);
        }).resume();
    }
).listen(process.env.PORT, '0.0.0.0');
//.listen(port)
console.log('Server running at: ' + port);
