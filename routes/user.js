var express = require('express');
var router = express.Router();
var passport = require('passport');
var tokenAuth = require('../config/token');
var User = require('../config/user-model');
var Project = require('../config/project-model');
var config = require('../config');

router.get('/', function(req, res) {
    res.redirect('/user/profile');
});

// =====================================
// LOGIN ===============================
// =====================================
// show the login form
router.get('/login', function(req, res) {

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
router.get('/signup', function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render('signup', {
        message: req.flash('signupMessage')
    });
});

// process the signup form
router.post('/signup', passport.authenticate('local-signup'), function(req, res) {
    res.redirect(config.client);
});

// =====================================
// PROFILE SECTION =====================
// =====================================
router.get('/profile', isLoggedIn, function(req, res) {
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
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/user/login');
});

// =====================================
// DELETE USER =========================
// =====================================
router.get('/delete', tokenAuth.isValidToken, function(req, res) {
    deleteUser(req.user, function(err) {
        if (!err) {
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

router.delete('/delete', function(req, res) {
    var user = req.body.user;
    deleteUser(user, function(err) {
        if (!err) res.sendStatus(200);
        else res.sendStatus(400);
    })
});

// =====================================
// GET USER ============================
// =====================================
router.get('/:usermail', function(req, res) {
    var usermail = req.params.usermail;
    User.findOne({
        'local.email': usermail
    }, function(err, user) {
        if (!err)
            if (user)
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
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/user/login');
}

// Remove an user in the DB
function deleteUser(user, callback) {
    User.remove({
        _id: user._id
    }, function(err) {
        if (!err)
            Project.remove({
                userId: user._id
            }, function(err) {
                callback(err);
            })
        else callback(err);
    });
};


module.exports = router;
