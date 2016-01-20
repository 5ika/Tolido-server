var express = require('express');
var router = express.Router();
var passport = require('passport');
var tokenAuth = require('../config/token');
var User = require('../config/user-model');
var Project = require('../config/project-model');
var config = require('../config');

// Sécurité sur le header
router.use('/', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'x-access-token');
  res.header('Access-Control-Allow-Methods',
    'GET, HEAD, PUT, DELETE, POST');
  next();
});

router.get('/', function (req, res) {
  res.redirect('/user/profile');
});

// =====================================
// LOGIN ===============================
// =====================================
// show the login form
router.get('/login', function (req, res) {

  // render the page and pass in any flash data if it exists
  res.render('login', {
    message: req.flash('loginMessage')
  });
});

// process the login form
router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/user/profile', // redirect to the secure profile section
  failureRedirect: '/user/login', // redirect back to the signup page if there is an error
  failureFlash: true // allow flash messages
}));
// =====================================
// SIGNUP ==============================
// =====================================
// show the signup form
router.get('/signup', function (req, res) {
  // render the page and pass in any flash data if it exists
  res.render('signup', {
    message: req.flash('signupMessage')
  });
});

// process the signup form
router.post('/signup', passport.authenticate('local-signup'), function (req, res) {
  res.redirect(config.client);
});

// =====================================
// PROFILE SECTION =====================
// =====================================
router.get('/profile', isLoggedIn, function (req, res) {
  console.log(req.user);
  res.render('profile', {
    user: req.user // get the user out of session and pass to template
  });
});

// =====================================
// GET A TOKEN =========================
// =====================================
// router.get('/:user/token', isLoggedIn, function(req, res) {
//     var token = tokenAuth.getToken(req.params.user);
//     res.send({
//         'token': token.value,
//         'expire': token.expire,
//         'user': token.user
//     });
// });

// =====================================
// LOGOUT ==============================
// =====================================
router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/user/login');
});

// =====================================
// DELETE USER =========================
// =====================================
router.get('/delete', tokenAuth.isValidToken, function (req, res) {
  deleteUser(req.user, function (err) {
    if(!err) {
      req.logout();
      res.render('login', {
        message: "L'utilisateur a bien été supprimé"
      });
    } else res.render('profile', {
      user: req.user,
      message: "Impossible de supprimer l'utilisateur"
    });
  });

});

router.delete('/delete', function (req, res) {
  var user = req.body.user;
  deleteUser(user, function (err) {
    if(!err) res.sendStatus(200);
    else res.sendStatus(400);
  })
});

// =====================================
// UPDATE USER =========================
// =====================================
router.post('/', isValidToken, function (req, res) {
  User.findById(req.user._id, (err, user) => {
    if(err) res.send('ERROR');
    else {
      if(req.body.newPswd)
        user.local.password = user.generateHash(req.body.newPswd);
      if(req.body.newMail)
        user.local.email = req.body.newMail;
      user.save();
      res.send('OK');
    }
  });
});

// =====================================
// GET USER ============================
// =====================================
router.get('/:usermail', function (req, res) {
  var usermail = req.params.usermail;
  User.findOne({
    'local.email': usermail
  }, function (err, user) {
    if(!err)
      if(user)
        res.json({
          user: user,
          token: tokenAuth.getToken(user._id)
        });
      else res.json({
        user: null,
        token: null
      });
    else res.sendStatus(404);
  });
});

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if(req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/user/login');
}

// route middleware to make sure user uses a valid auth token
function isValidToken(req, res, next) {
  // Récupération du token (plusieurs méthodes possibles)
  var token = (req.body && req.body.access_token) || (req.query &&
    req.query
    .access_token) || req.headers['x-access-token'];

  if(token)
    tokenAuth.isValid(token, function (user) {
      if(user) { // if user token is valid, carry on
        req.user = user;
        return next();
      } else // if it isn't, send error message
        console.log("Token not valid");
      res.status(401).json({
        error: 'Your token is not valid'
      });
    });
  else res.status(401).json({
    error: 'No token'
  })
}

// Remove an user in the DB
function deleteUser(user, callback) {
  User.remove({
    _id: user._id
  }, function (err) {
    if(!err)
      Project.remove({
        userId: user._id
      }, function (err) {
        callback(err);
      })
    else callback(err);
  });
};

module.exports = router;
