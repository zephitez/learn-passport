//app/routes.js
module.exports = function(app, passport) {

  //HOME PAGE (with login links)
  app.get('/', function(req, res) {
    res.render('index.ejs'); //load the index.ejs file
  });

  //login PAGE

  //show login form
  app.get('/login', function(req, res) {
    res.render('login.ejs', {
      message: req.flash('loginMessage')
    });
  });

  //signup
  //show signup forms
  app.get('/signup', function(req, res) {

    //render the page and pass in any flash stuff
    res.render('signup.ejs', {
      message: req.flash('signupMessage')
    });
  });

  //process the signup forms
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true

  }));

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  //PROFILE SECTION
  //we will want this protected so you have to be logged in to visit
  //we will use route middleware to verify this (this isLoggedIn function)

  app.get('/profile', isLoggedIn, function(req, res) {
    res.render('profile.ejs', {
      message: req.flash('authMessage'),
      user: req.user //get the user out of  session and pass to template
    });
  });

//facebook routing
  // route for facebook athentication and login
      app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

      // handle the callback after facebook has authenticated the user
      app.get('/auth/facebook/callback',
          passport.authenticate('facebook', {
              successRedirect : '/profile',
              failureRedirect : '/'
          }));




//if they go to logout page, log them out
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

};

//Logouttttt

function isLoggedIn(req, res, next) {

  if (req.isAuthenticated())
    return next();

  //if not auth then redirect to homepage
  res.redirect('/');
}
