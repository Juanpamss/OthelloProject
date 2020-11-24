const passport = require('passport');
const localStrategy = require('passport-local').Strategy
const dbConnection = require('./db-connection');
const validPassword = require('./lib/passwordHandler')
const customOptions = {
    usernameField: 'username',
    passwordField: 'password'
}
const verifyCallback = (username, password, done) => {
    dbConnection.getUserByUsername(username).then(function (res){
        if(res === undefined && res.length == 0){
            return done(null,false)
        }else{
            let result = {
                id: res.rows[0]["ID"],
                username: res.rows[0]["USERNAME"],
                hash: res.rows[0]["PASSWORD"],
                salt: res.rows[0]["SALT"]
            }

            const isValid = validPassword.isValidPassword(password, result.hash, result.salt)
            
            if(isValid){
                return done(null, result)
            }else{
                return done(null, false)
            }
        }
    }).catch(e => console.error(e.stack))
}

passport.use(new localStrategy(customOptions, verifyCallback));
passport.serializeUser((user, done) => {
    done(null, user.id)
});
passport.deserializeUser((userId, done) => {
    dbConnection.getUserById(userId).then(function (res){
        let user = {
            id: res.rows[0]["ID"],
            username: res.rows[0]["USERNAME"],
            hash: res.rows[0]["PASSWORD"],
            salt: res.rows[0]["SALT"]
        }
        done(null, user)
    }).catch(e => console.error(e.stack))
});