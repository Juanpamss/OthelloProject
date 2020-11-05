/*Require express module*/
const express = require('express');

/* Including static file webserver libraries*/
var static = require('node-static');

/*Include HTTP server library*/
var https = require('https');

/*System modules*/
const path = require('path');
const fs = require('fs')
const app = express();

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

//Tell the server to serve static files from the public folder
app.use('/', express.static(directory))

const httpsOptions = {
    cert: fs.readFileSync(path.join(__dirname,'ssl','cert.pem')),
    key: fs.readFileSync(path.join(__dirname,'ssl', 'key.pem'))
}

https.createServer(httpsOptions,app).listen(port);

console.log('Server running at: ' + port);

/*Construct http server to get file from the file server*/
/*const server = https.createServer(
    function (request,response) {
        request.addListener('end', function () {
            file.serve(request,response);
        }).resume();
    }
)
    //.listen(process.env.PORT, '0.0.0.0');
.listen(port)
console.log('Server running at: ' + port);*/
