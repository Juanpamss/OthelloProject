if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

/*Require express module*/
const express = require('express');

/* Including static file webserver libraries*/
const static = require('node-static');

/*Include HTTP server library*/
const https = require('https');

/*Include encryption module*/
const bcrypt = require('bcrypt');

/*Include flash and session*/
const flash = require('express-flash');
const session = require('express-session');

/*Include passport and session*/
const passport = require('passport');
const initializePassport = require('./passport-config');
initializePassport(
    passport,
    username => users.find(user => user.username === username),
    id => users.find(user => user.id === id)
)

/*Include override*/
const methodOverride = require('method-override');

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

/*Setting Database Users*/
const users = []

/*Setting Login*/
//Tell the server to serve static files from the public folder
//app.use('/', express.static(directory));

/*Define usages*/
app.use(express.urlencoded({ extended: false}));
app.use(flash());
app.use(session({
    secret : process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

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
    res.sendFile(__dirname + '/public/lobby.html');
})

/*Set post methods*/
app.post('/register', async (req, res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            username: req.body.username,
            password : hashedPassword
        })
        res.redirect('/login')
        console.log(users)
    }catch{
        res.redirect('/register')
    }
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/lobby',
    failureRedirect: '/login',
    failureFlash: true
}))

/*Logout the user*/
app.delete('/logout', (req, res) => {
    req.logOut();
    res.redirect('/login');
})

/*Set up static web server*/
//var file = new static.Server(directory);

const httpsOptions = {
    cert: fs.readFileSync(path.join(__dirname,'ssl','cert.crt')),
    key: fs.readFileSync(path.join(__dirname,'ssl', 'key.key'))
}

let server = https.createServer(httpsOptions,app).listen(port);

console.log('Server running at: ' + port);

/*Configure socket server*/
var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket){
    /*Log activity*/
    function log(){
        var array = ['Server log message'];
        for (var i = 0; i < arguments.length; i++){
            array.push(arguments[i]);
            console.log(arguments[i])
        }
        socket.emit('log', array);
        //Multicast to all clients connected
        socket.broadcast.emit('log', array);
    }

    log('Client connected to the server');

    socket.on('disconect', function(socket){
        log('Client disconnected from the server');
    });
});

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
