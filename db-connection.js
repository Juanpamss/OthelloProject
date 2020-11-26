const insertQuery = 'INSERT INTO public."OthelloUser"("USERNAME", "PASSWORD", "SALT") VALUES($1, $2, $3) RETURNING *'
const getUserByUsernameQuery = 'SELECT "ID", "USERNAME", "PASSWORD", "SALT"  FROM public."OthelloUser" WHERE "USERNAME" = $1'
const getUserQuery = 'SELECT "ID", "USERNAME", "PASSWORD", "SALT"  FROM public."OthelloUser" WHERE "ID" = $1'
const insertGameQuery = 'INSERT INTO public."Game"("GAME_ID", "WHITE_PLAYER", "BLACK_PLAYER", "WINNER") VALUES($1, $2, $3, $4) RETURNING *'
const insertGameLogQuery = 'INSERT INTO public."GameLog"("GAME_ID", "ROW", "COLUMN", "COLOR", "USERNAME") VALUES($1, $2, $3, $4, $5) RETURNING *'

const Client = require('pg').Client;

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'OthelloProject',
    password: 'gibson',
    port: 5432
})

function connectToDB(){
    try{
        client.connect()
        console.log("Connected to DB")
    }catch(e){
        console.log(e)
    }
}

function getUserByUsername(username) {

    return client.query(getUserByUsernameQuery, [username])
}

function getUserById(userId) {

    return client.query(getUserQuery, [userId])
}

function insertNewUser(user, password, salt){
    try{
        client
            .query(insertQuery, [user, password, salt])
            .then(res => {
                //console.log(res.rows)
            })
            .catch(e => console.error(e.stack))
    }catch(e){
        console.log(e)
    }
}

function insertGame(gameId, whitePlayer, blackPlayer, winner){
    try{
        client
            .query(insertGameQuery, [gameId, whitePlayer, blackPlayer, winner])
            .then(res => {
                //console.log(res.rows)
            })
            .catch(e => console.error(e.stack))
    }catch(e){
        console.log(e)
    }
}

function insertGameLogMove(gameId, row, column, color, username){
    try{
        client
            .query(insertGameLogQuery, [gameId, row, column,color,username])
            .then(res => {
                //console.log(res.rows)
            })
            .catch(e => console.error(e.stack))
    }catch(e){
        console.log(e)
    }
}

module.exports.connectToDB = connectToDB
module.exports.insertNewUser = insertNewUser
module.exports.getUserByUsername = getUserByUsername
module.exports.getUserById = getUserById
module.exports.insertGame = insertGame
module.exports.insertGameLogMove = insertGameLogMove