/*Connect to the socket server*/
/*var socket = io({
    // option 1
    ca: fs.readFileSync(path.join(__dirname,'ssl','cert.crt'))
}).connect();*/
var socket = io.connect();

socket.on('log', function (array){
    console.log.apply(console,array);
})