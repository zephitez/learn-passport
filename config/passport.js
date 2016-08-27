//load all the things we needed
var LocalStrategy = require('passport-local').Strategy,
  FacebookStrategy = require('passport-facebook').Strategy;


//load user model
var User = require('../app/models/user');

//load the auth variable
var configAuth = require('./auth');

//expose this function to our app
module.exports = function(passport) {

  //passport session setup
  //required for persistent login
  //passport needs ability to serialize and unserialize users out of session

  //used to serialize the user for session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  //used to DE-serialize the user for session
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  //local signup
  //we are using named strategies since we have one for login and one for signup
  passport.use('local-signup', new LocalStrategy({
      //by default, local strategy uses username and pwd, we will override with email
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true //allows us to pass back entire request to the callback
    },
    function(req, email, password, done) {
      //asynchronous
      //User.findOne won't fire unless data is sent back
      process.nextTick(function() {
        User.findOne({
          'local.email': email
        }, function(err, user) {
          //if error return error
          if (err) return done(err);
          //check if theres user with that email
          if (user) {
            return done(null, false, req.flash('signupMessage', 'That email got someone use liao'));
          } else {

            //create LocalStrategy
            var newUser = new User();

            //set local credentials

            newUser.local.email = email;
            newUser.local.password = newUser.generateHash(password);

            //save it

            newUser.save(function(err) {
              if (err) throw err;
              return done(null, newUser, req.flash('authMessage', 'WELCOME to jiak simi sai!'));
            });
          }

        });

      });

    }));

  passport.use('local-login', new LocalStrategy({
      // by default, local strategy uses username and password, we will override with email
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      User.findOne({
        'local.email': email
      }, function(err, user) {
        // if there are any errors, return the error before anything else
        if (err)
          return done(err);

        // if no user is found, return the message
        if (!user)
          return done(null, false, req.flash('loginMessage', 'No user found lehhh...sowrie..')); // req.flash is the way to set flashdata using connect-flash

        // if the user is found but the password is wrong
        if (!user.validPassword(password))
          return done(null, false, req.flash('loginMessage', 'Uncle... Wrong password siol.')); // create the loginMessage and save it to session as flashdata

        // all is well, return successful user
        return done(null, user, req.flash('authMessage', 'WELCOME BEG..shiok sia'));
      });

    }));

  // use Facebook to login
  passport.use(new FacebookStrategy({

      // pull in our app id and secret from our auth.js file
      clientID: configAuth.facebookAuth.clientID,
      clientSecret: configAuth.facebookAuth.clientSecret,
      callbackURL: configAuth.facebookAuth.callbackURL

    },

    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {

      // asynchronous
      process.nextTick(function() {

        // find the user in the database based on their facebook id
        User.findOne({
          'facebook.id': profile.id
        }, function(err, user) {

          // if there is an error, stop everything and return that
          // ie an error connecting to the database
          if (err)
            return done(err);

          // if the user is found, then log them in
          if (user) {
            return done(null, user); // user found, return that user
          } else {
            // if there is no user found with that facebook id, create them
            var newUser = new User();

            // set all of the facebook information in our user model
            newUser.facebook.id = profile.id; // set the users facebook id
            newUser.facebook.token = token; // we will save the token that facebook provides to the user
            newUser.facebook.name = profile.displayName; // look at the passport user profile to see how names are returned
            console.log(profile);
            // newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

            // save our user to the database
            newUser.save(function(err) {
              if (err)
                throw err;

              // if successful, return the new user
              return done(null, newUser);
            });
          }

        });
      });

    }));


};
