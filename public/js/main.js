/*Functions*/

/*Connect to the socket server*/
var socket = io.connect();

socket.on('log', function (array){
    console.log.apply(console,array);
})