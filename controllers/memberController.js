var passport = require('passport');

/* GET register */
exports.get_register = function(req, res, next) {
    var messages = req.flash('error');
    res.render('frontend/member/register', {   
        pageTitle: req.__('Member Register'),
        csrfToken: req.csrfToken(),
        messages: messages,
        hasErrors: messages.length > 0
    });
}

// POST Register
exports.post_register = passport.authenticate('local.register', {
    successRedirect: '/member/account',
    failureRedirect: '/member/register',
    failureFlash: true
});

// GET profile
exports.get_profile = function(req, res, next){
    res.render('frontend/member/dashboard', {
        pageTitle: req.__('Dashboard')
    });
}

// GET login local
exports.get_login = function(req, res, next){
    var messages = req.flash('error');
    res.render('frontend/member/login', {
        pageTitle: req.__('Login'),
        csrfToken: req.csrfToken(),
        messages: messages,
        hasErrors: messages.length > 0,
        // layout: false
    });
}

// POST login local
exports.post_login = passport.authenticate('local.login', {
    successRedirect: '/course',
    failureRedirect: '/member/login',
    failureFlash: true
});

/* GET login facebook */
exports.get_facebook_login = passport.authenticate('facebook', {
    scope: ['email', 'public_profile']
});

/* GET facebook callback login */
exports.get_facebook_callback_login = passport.authenticate('facebook', {
    successRedirect: '/member/account',
    failureRedirect: '/member/login'
});

/* GET login google */
exports.get_google_login = passport.authenticate('google', {
    scope: ['email', 'profile']
});

/* GET google callback login */
exports.get_google_callback_login = passport.authenticate('google', {
    successRedirect: '/member/account',
    failureRedirect: '/member/login'
});

// GET logout
exports.get_logout = function(req, res, next){
    req.logout();
    res.redirect('/');
};

//
exports.isLogedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/member/login');
};

exports.notLogedIn = function(req, res, next){
    if(!req.isAuthenticated()){
        return next();
    }
    res.redirect('/member/account');
};

exports.notLogin_use = function(req, res, next){
    next();
}