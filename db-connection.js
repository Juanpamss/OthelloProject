const insertQuery = 'INSERT INTO public."OthelloUser"("USERNAME", "PASSWORD", "SALT") VALUES($1, $2, $3) RETURNING *'
const getUserByUsernameQuery = 'SELECT "ID", "USERNAME" FROM public."OthelloUser" WHERE "USERNAME" = $1'
const getUserByUsernameQueryForAuthentication = 'SELECT "ID", "USERNAME", "PASSWORD", "SALT"  FROM public."OthelloUser" WHERE "USERNAME" = $1'
const getUserQuery = 'SELECT "ID", "USERNAME", "PASSWORD", "SALT" FROM public."OthelloUser" WHERE "ID" = $1'
const insertGameQuery = 'INSERT INTO public."Game"("GAME_ID", "WHITE_PLAYER", "BLACK_PLAYER", "WINNER") VALUES($1, $2, $3, $4) RETURNING *'
const insertGameLogQuery = 'INSERT INTO public."GameLog"("GAME_ID", "ROW", "COLUMN", "COLOR", "USERNAME") VALUES($1, $2, $3, $4, $5) RETURNING *'
const getGameQuery = 'SELECT * FROM public."Game"'
const getGameMovesQuery = 'SELECT "MOVE_ID", "GAME_ID", "ROW", "COLUMN", "COLOR", "USERNAME" FROM public."GameLog" WHERE "GAME_ID" = $1'
const getStatisticsQuery = 'SELECT * FROM public.playerstatistics_view'


const {Client} = require('pg')

const server = new Client()

function connectToDB(){
    try{
        server.connect()
        console.log("Connected to DB")
    }catch(e){
        console.log(e)
    }
}

function getUserByUsername(username) {

    return server.query(getUserByUsernameQuery, [username])
}

function getUserByUsernameForAuthentication(username) {

    return server.query(getUserByUsernameQueryForAuthentication, [username])
}

function getUserById(userId) {

    return server.query(getUserQuery, [userId])
}

function insertNewUser(user, password, salt){
    try{
        server
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
        server
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
        server
            .query(insertGameLogQuery, [gameId, row, column,color,username])
            .then(res => {
                //console.log(res.rows)
            })
            .catch(e => console.error(e.stack))
    }catch(e){
        console.log(e)
    }
}

function getGames() {
    return server.query(getGameQuery)
}

function getGameMoves(gameId) {

    return server.query(getGameMovesQuery, [gameId])
}

function getStatistics() {

    return server.query(getStatisticsQuery)
}

module.exports.connectToDB = connectToDB
module.exports.insertNewUser = insertNewUser
module.exports.getUserByUsername = getUserByUsername
module.exports.getUserByUsernameForAuthentication = getUserByUsernameForAuthentication
module.exports.getUserById = getUserById
module.exports.insertGame = insertGame
module.exports.insertGameLogMove = insertGameLogMove
module.exports.getGames = getGames
module.exports.getGameMoves = getGameMoves
module.exports.getStatistics = getStatistics