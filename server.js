if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

/*Require Postgress module*/
const dbConnection = require('./db-connection');

/*Require express module*/
const express = require('express');

/* Including static file webserver libraries*/
const static = require('node-static');

/*Include HTTP server library*/
const https = require('https');

/*Include flash and session*/
const flash = require('express-flash');
const session = require('express-session');

/*Include password handler*/
const password = require('./lib/passwordHandler')

/*Include passport*/
const passport = require('passport')
require('./passport')

/*Include override*/
const methodOverride = require('method-override');

/*System modules*/
const path = require('path');
const fs = require('fs')
const app = express();

/*Connect to DB*/
dbConnection.connectToDB();

/*Assume this is running on a web server (Heroku)*/
var port = process.env.PORT;
var directory = __dirname + '/public';

/*If this is not a web server, the readjust the port to localhost*/
if(typeof port == 'undefined' || port){
    directory = './public';
    port = 8080;
}

/*Setting Login*/
//Tell the server to serve static files from the public folder
app.use('/', express.static(directory));

/*Define usages*/
app.use(express.urlencoded({ extended: false}));
app.use(flash());
app.use(session({
    secret : process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

/*Uer passport and session*/
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public'));

/*Set get methods*/
app.get('/', checkAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
})

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
})

app.get('/lobby', checkAuthenticated, (req, res) => {

    res.redirect('/lobby.html?username=' + req.user.username)
    //res.render('lobby?username=' + req.user.username);

})

/*Set post methods*/
app.post('/register', async (req, res) => {
    try{
        const saltedHashedPassword = password.generatePassword(req.body.password);
        dbConnection.insertNewUser(req.body.username, saltedHashedPassword.hash, saltedHashedPassword.salt)
        console.log("User created")
        res.redirect('/login')
    }catch{
        res.redirect('/register')
    }
})

app.post('/login', passport.authenticate('local', {
        successRedirect: '/lobby',
        failureRedirect: '/login',
        failureFlash: true
    })
)

/*Logout the user*/
app.delete('/logout', (req, res) => {
    req.logOut();
    res.redirect('/login');
})

/*Set up static web server*/
//var file = new static.Server(directory);

const httpsOptions = {
    cert: fs.readFileSync(path.join(__dirname,'ssl','cert.crt')),
    key: fs.readFileSync(path.join(__dirname,'ssl', 'key.key')),
    requestCert: false
}

let server = https.createServer(httpsOptions,app).listen(port);

console.log('Server running at: ' + port);

/*****Configure socket server*****/
let players = [];

const io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket){
    /*Log activity*/
    log('Client connection by: ' + socket.id)

    function log(){
        let array = ['Server log message'];
        for (let i = 0; i < arguments.length; i++){
            array.push(arguments[i]);
            console.log(arguments[i])
        }
        socket.emit('log', array);
        //Multicast to all clients connected
        socket.broadcast.emit('log', array);
    }

    log('Client connected to the server');

    socket.on('disconnect', function(){
        log('Client disconnected ' + JSON.stringify(players[socket.id]));

        if('undefined' !== typeof players[socket.id] && players[socket.id]){

            const username = players[socket.id].username;
            const room = players[socket.id].room;
            const payload = {
                username: username,
                socket_id: socket.id
            }

            delete players[socket.id]
            io.in(room).emit('player_disconnected', payload)
        }

    });

    /*Join room command*/
    /**/
    socket.on('join_room', function(payload){
        log('\'join_room command\' command' +JSON.stringify(payload))
        if(('undefined' === typeof payload) || !payload){
            var error_message = 'join_room had no payload'
            log(error_message)
            socket.emit('join_room_response',{
                result: 'fail',
                message: error_message
            });

            return;
        }

        /*Check that the payload has a room to join*/
        var room = payload.room
        if(('undefined' === typeof room) || !room){
            var error_message = 'join_room did not specified a room'
            log(error_message)
            socket.emit('join_room_response',{
                result: 'fail',
                message: error_message
            });

            return;
        }

        /*Check that a user has been provided*/
        var username = payload.username
        if(('undefined' === typeof username) || !username){
            var error_message = 'join_room did not specified a username'
            log(error_message)
            socket.emit('join_room_response',{
                result: 'fail',
                message: error_message
            });

            return;
        }

        /*Store info about new player*/

        players[socket.id] = {}
        players[socket.id].username = username;
        players[socket.id].room = room;

        /*Allow user to join the room*/
        socket.join(room);

        var roomObject = io.sockets.adapter.rooms[room]

        /*Announce that a player joined*/

        var numClients = roomObject.length
        var success_data = {
            result: 'success',
            room: roomObject,
            username: username,
            socket_id: socket.id,
            membership: numClients
        }

        io.sockets.in(room).emit('join_room_response', success_data)

        for(var socket_in_room in roomObject.sockets){
            var success_data = {
                result: 'success',
                room: room,
                username: players[socket_in_room].username,
                socket_id: socket_in_room,
                membership: numClients
            }

            socket.emit('join_room_response', success_data)
        }

        log('join_room_success')
        if(room !== 'lobby'){
            send_game_update(socket, room, 'initial update');
        }
    });

    /*Invite command*/

    socket.on('invite', function (payload){
        log('invite with ' + JSON.stringify(payload))

        /*Check that payload was sent*/
        if(('undefined' === typeof payload) || !payload){
            const error_message = 'invite had no payload'
            log(error_message)
            socket.emit('invite_response', {
                result: 'fail',
                message: error_message
            })
            return
        }

        /*Check that the message can be traced to a username*/
        const username = players[socket.id].username
        if(('undefined' === typeof username) || !username){
            const error_message = 'invite cannot identify who sent the message'
            log(error_message)
            socket.emit('invite_response', {
                result: 'fail',
                message: error_message
            })
            return
        }

        const requested_user = payload.requested_user
        if(('undefined' === typeof requested_user) || !requested_user){
            const error_message = 'invite did not specify a requested_user'
            log(error_message)
            socket.emit('invite_response', {
                result: 'fail',
                message: error_message
            })
            return
        }

        const room = players[socket.id].room
        const roomObject = io.sockets.adapter.rooms[room]

        /*Ensure that user invited is in the room*/
        if(!roomObject.sockets.hasOwnProperty(requested_user)){
            const error_message = 'invite requested a user that was not in the room'
            log(error_message)
            socket.emit('invite_response', {
                result: 'fail',
                message: error_message
            })
            return
        }

        /*If everything is OK, then respond to the inviter*/
        const success_data = {
            result: 'success',
            socket_id: requested_user
        }

        socket.emit('invite_response', success_data)

        /*Tell the invitee that they have been invited*/

        const success_data_invitee = {
            result: 'success',
            socket_id: socket.id
        }

        socket.to(requested_user).emit('invited', success_data_invitee)

        log('invite successful')
    })

    /*Uninvite command*/

    socket.on('uninvite', function (payload){
        log('uninvite with ' + JSON.stringify(payload))

        /*Check that payload was sent*/
        if(('undefined' === typeof payload) || !payload){
            const error_message = 'invite had no payload'
            log(error_message)
            socket.emit('uninvite_response', {
                result: 'fail',
                message: error_message
            })
            return
        }

        /*Check that the message can be traced to a username*/
        const username = players[socket.id].username
        if(('undefined' === typeof username) || !username){
            const error_message = 'uninvite cannot identify who sent the message'
            log(error_message)
            socket.emit('uninvite_response', {
                result: 'fail',
                message: error_message
            })
            return
        }

        const requested_user = payload.requested_user
        if(('undefined' === typeof requested_user) || !requested_user){
            const error_message = 'uninvite did not specify a requested_user'
            log(error_message)
            socket.emit('uninvite_response', {
                result: 'fail',
                message: error_message
            })
            return
        }

        const room = players[socket.id].room
        const roomObject = io.sockets.adapter.rooms[room]

        /*Ensure that user invited is in the room*/
        if(!roomObject.sockets.hasOwnProperty(requested_user)){
            const error_message = 'uninvite requested a user that was not in the room'
            log(error_message)
            socket.emit('uninvite_response', {
                result: 'fail',
                message: error_message
            })
            return
        }

        /*If everything is OK, then respond to the inviter*/
        const success_data = {
            result: 'success',
            socket_id: requested_user
        }

        socket.emit('uninvite_response', success_data)

        /*Tell the uninvitee that they have been invited*/

        const success_data_invitee = {
            result: 'success',
            socket_id: socket.id
        }

        socket.to(requested_user).emit('uninvited', success_data_invitee)

        log('uninvite successful')
    })



    /*game_start command*/

    socket.on('game_start', function (payload){
        log('game_start with ' + JSON.stringify(payload));

        /*Check that payload was sent*/
        if(('undefined' === typeof payload) || !payload){
            const error_message = 'game_start had no payload'
            log(error_message)
            socket.emit('game_start_response', {
                result: 'fail',
                message: error_message
            })
            return
        }

        /*Check that the message can be traced to a username*/
        const username = players[socket.id].username
        if(('undefined' === typeof username) || !username){
            const error_message = 'game_start cannot identify who sent the message'
            log(error_message)
            socket.emit('game_start_response', {
                result: 'fail',
                message: error_message
            })
            return
        }

        const requested_user = payload.requested_user
        if(('undefined' === typeof requested_user) || !requested_user){
            const error_message = 'game_start did not specify a requested_user'
            log(error_message)
            socket.emit('game_start_response', {
                result: 'fail',
                message: error_message
            })
            return
        }

        let room = players[socket.id].room
        let roomObject = io.sockets.adapter.rooms[room]

        /*Ensure that user invited is in the room*/
        if(!roomObject.sockets.hasOwnProperty(requested_user)){
            const error_message = 'game_start requested a user that was not in the room'
            log(error_message)
            socket.emit('game_start_response', {
                result: 'fail',
                message: error_message
            })
            return
        }

        /* If everything is OK, then respond to the game_starter that it was successful */
        let game_id = Math.floor((1+Math.random()) *0x10000).toString(16).substring(1);
        const success_data = {
            result: 'success',
            socket_id: requested_user,
            game_id: game_id
        };

        socket.emit('game_start_response', success_data)

        /*Tell the other player to play */

        const success_data_invitee = {
            result: 'success',
            socket_id: socket.id,
            game_id: game_id
        }

        socket.to(requested_user).emit('game_start_response', success_data_invitee)

        log('game_start successful')
    })

    /* play_token command */
    /* payload info for input validation */
    /* payload:
        {
            'row': 0-7
            'column: 0-7
            'color': 'black' or 'white'
        }
        if successful a success message will be followed by a game_update message
        play_token_response:
        {
            'result': 'success'
        }
        or
        {
            'result': 'fail',
            'message': failure message
        }
     */
    socket.on('play_token', function (payload){
        log('play_token with ' + JSON.stringify(payload));

        /*Check that payload was sent*/
        if(('undefined' === typeof payload) || !payload){
            const error_message = 'play_token had no payload'
            log(error_message)
            socket.emit('play_token_response', {
                result: 'fail',
                message: error_message
            })
            return
        }

        /*Check that a player has previously signed in*/
        const player = players[socket.id]
        if (('undefined' === typeof player) || !player) {
            const error_message = 'player not recognized'
            log(error_message)
            socket.emit('play_token_response', {
                result: 'fail',
                message: error_message
            })
            return
        }

        const username = players[socket.id].username;
        if(('undefined' === typeof username) || !username){
            const error_message = 'play_token cannot identify who sent the message'
            log(error_message)
            socket.emit('play_token_response', {
                result: 'fail',
                message: error_message
            })
            return
        }

        const game_id = players[socket.id].room;
        if(('undefined' === typeof game_id) || !game_id){
            const error_message = 'play_token cannot find your game board'
            log(error_message)
            socket.emit('play_token_response', {
                result: 'fail',
                message: error_message
            })
            return
        }

        const row = payload.row;
        if(('undefined' === typeof row) || row < 0 || row > 7){
            const error_message = 'play_token did not specify a valid row, command aborted';
            log(error_message)
            socket.emit('play_token_response', {
                result: 'fail',
                message: error_message
            })
            return
        }

        const column = payload.column;
        if(('undefined' === typeof column) || column < 0 || column > 7){
            const error_message = 'play_token did not specify a valid row, command aborted';
            log(error_message)
            socket.emit('play_token_response', {
                result: 'fail',
                message: error_message
            })
            return
        }

        const color = payload.color;
        if(('undefined' === typeof color) || !color || (color != 'white' && color != 'black')){
            const error_message = 'play_token did not specify a valid color, command aborted';
            log(error_message)
            socket.emit('play_token_response', {
                result: 'fail',
                message: error_message
            })
            return
        }

        /*Game state*/
        const game = games[game_id];
        if(('undefined' === typeof game) || !game){
            const error_message = 'play_token cannot find your game board';
            log(error_message)
            socket.emit('play_token_response', {
                result: 'fail',
                message: error_message
            })
            return
        }

        /*If current attempt at playing a token is out of turn then error*/
        if(color !== game.whose_turn){
            let error_message = 'play_token message played out of turn'
            log(error_message)
            socket.emit('play_token_response', {
                result: 'fail',
                message: error_message
            })
            return
        }
        /*If wrong socket is playing the color*/
        if((game.whose_turn === 'white') && (game.player_white.socket != socket.id) ||
            (game.whose_turn === 'black') && (game.player_black.socket != socket.id)){
            let error_message = 'play_token turn played by wrong player'
            log(error_message)
            socket.emit('play_token_response', {
                result: 'fail',
                message: error_message
            })
            return
        }
        /*Send response*/
        let success_data = {
            result: 'success'
        }
        socket.emit('play_token_response', success_data)
        /*Execute the move*/
        if(color == 'white'){
            game.board[row][column] = 'w'
            game.whose_turn = 'black'
        }else if(color == 'black'){
            game.board[row][column] = 'b'
            game.whose_turn = 'white'
        }
        let d = new Date()
        game.last_move_time = d.getTime()
        send_game_update(socket, game_id, 'played a token')
    })
});
/*Part of the code related to the game state*/
let games = {}
function create_new_game(){
    let new_game = {}
    new_game.player_white = {}
    new_game.player_black = {}
    new_game.player_white.socket = ''
    new_game.player_white.username = ''
    new_game.player_black.socket = ''
    new_game.player_black.username = ''
    let d = new Date()
    new_game.last_move_time = d.getTime()
    new_game.whose_turn = 'black'
    new_game.board = [
        [' ',' ',' ',' ',' ',' ',' ',' '],
        [' ',' ',' ',' ',' ',' ',' ',' '],
        [' ',' ',' ',' ',' ',' ',' ',' '],
        [' ',' ',' ','w','b',' ',' ',' '],
        [' ',' ',' ','b','w',' ',' ',' '],
        [' ',' ',' ',' ',' ',' ',' ',' '],
        [' ',' ',' ',' ',' ',' ',' ',' '],
        [' ',' ',' ',' ',' ',' ',' ',' ']
    ]
    return new_game
}
function send_game_update(socket, game_id, message){
    /*Check if game with game id already exists*/
    if('undefined' === typeof games[game_id] || !games[game_id]){
        console.log('No game exists. Creating ' + game_id
            + 'for' + socket.id)
        games[game_id] = create_new_game();
    }
    /*Ensure only 2 people are inside of each game*/
    let roomObject
    let numClients
    do{
        roomObject = io.sockets.adapter.rooms[game_id]
        numClients = roomObject.length
        if(numClients > 2){
            console.log('Too many players in room: ' + game_id + '#: ' + numClients)
            if(games[game_id].player_white.socket == roomObject.sockets[0]){
                games[game_id].player_white.socket = ''
                games[game_id].player_white.username = ''
            }
            if(games[game_id].player_black.socket == roomObject.sockets[0]){
                games[game_id].player_black.socket = ''
                games[game_id].player_black.username = ''
            }
            /*Kick one of the extra players*/
            let kick_out = Object.keys(roomObject.sockets)[0]
            io.of('/').connected[kick_out].leave(game_id)
        }
    }while((numClients-1) > 2)
    /*Assign each socket a color / side*/
    if((games[game_id].player_white.socket != socket.id) && (games[game_id].player_black.socket != socket.id)){
        console.log('Player is not assigned a color: ' + socket.id)
        if((games[game_id].player_black.socket != '') && (games[game_id].player_white.socket != '')){
            games[game_id].player_white.socket = ''
            games[game_id].player_white.username = ''
            games[game_id].player_black.socket = ''
            games[game_id].player_black.username = ''
        }
    }
    if(games[game_id].player_white.socket == ''){
        if(games[game_id].player_black.socket != socket.id){
            games[game_id].player_white.socket = socket.id
            games[game_id].player_white.username = players[socket.id].username
        }
    }
    if(games[game_id].player_black.socket == ''){
        if(games[game_id].player_white.socket != socket.id){
            games[game_id].player_black.socket = socket.id
            games[game_id].player_black.username = players[socket.id].username
        }
    }
    /*Send game update*/
    let success_data = {
        result: 'success',
        game: games[game_id],
        message: message,
        game_id: game_id
    }
    io.in(game_id).emit('game_update', success_data)
    /*Check if game is over*/
    let row, column
    var count = 0
    for(row = 0; row < 8; row++){
        for(column = 0; column < 8; column++){
            if(games[game_id].board[row][column] != ' '){
                count ++;
            }
        }
    }
    if(count == 64){
        /*Send game over message*/
        let success_data = {
            result: 'success',
            game: game_id,
            who_won: 'everyone',
            game_id: game_id
        }
        io.in(game_id).emit('game_over', success_data)
        /*Delete old games after 1 hour*/
        setTimeout(function (id){
            return function (){
                delete games[id]
            }
        }(game_id), 60*60*1000)
    }
}
/*Check if the user is logged in, if not redirect to Login page*/
function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}
/*Check if user is already authenticated*/
function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/');
    }
    next()
}
/*Manage messages from client*/
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