const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt');

function initialize(passport, getUserByUsername, getUserById){
    const authenticateUser = async (username, password, done) => {
        const user = getUserByUsername(username);
        if(user == null){
            console.log("Username does not exist")
            return done(null, false, {message: "Username does not exist"})
        }
        try{
            if(await bcrypt.compare(password, user.password)){
                console.log("Correct")
                return done(null, user)
            }else{
                console.log("Incorrect")
                return done(null, false, {message: "Incorrect credentials. Try Again"})
            }
        }catch(e){
            return done(e)
        }
    }

    passport.use(new localStrategy({
        usernameField: 'username'
    }, authenticateUser));
    passport.serializeUser((user, done) => {
        done(null, user.id)
    });
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id))
    });
}

module.exports = initialize