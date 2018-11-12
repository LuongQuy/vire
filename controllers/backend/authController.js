var passport = require('passport');

exports.get_login = function(req, res, next){
    var messages = req.flash('error');
    res.render('backend/layout_login', {
        pageTitle: req.__('Administrator Login Page'),
        csrfToken: req.csrfToken(),
        messages: messages,
        hasErrors: messages.length > 0,
        layout: false,
    });
}

exports.post_login = passport.authenticate('backend.login', {
    successRedirect: '/admin/dashboard',
    failureRedirect: '/admin/login',
    badRequestMessage: 'Please input all fields required',
    failureFlash: true
});

exports.get_dashboard = function(req, res, next) {
    res.render(
        'backend/index',
        {
            pageTitle : 'Administrator Dashboard',
            layout: false
        }
    );
}

exports.get_logout = function(req, res, next){
    req.logout();
    return res.redirect('/');
}

exports.notLogin_use = function(req, res, next){
    next();
}

exports.isLoggedIn = function(req, res, next){
    if(req.user && req.user.roles === "ADMIN" && req.user.provider === "backend"){
        return next();
    }else{
        return res.redirect('/admin/login');
    }
}

exports.notLoggedIn = function(req, res, next){
    if(!req.user) next();
    else{
        if(req.user.rolse !== "ADMIN" && req.user.provider !== "backend"){
            return next();
        }else{
            return res.redirect('/admin/dashboard');
        }
    }
}