var validator = require('express-validator');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var FacebookStrategy = require('passport-facebook');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var settings = require('../config/settings');
var Member = require('../models/member');
var cfgAuth = require('./auth');

var provider = null;

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (id, done) {
    Member.findById(id, function (err, member) {

        var newMember = member.toObject();
        newMember['provider'] = provider;
        done(err, newMember);

    });
});

// Passport register
passport.use('local.register', new LocalStrategy({
    usernameField: 'email', // Tên của input dùng đăng nhập
    passwordField: 'password', // tên của input mật khẩu
    passReqToCallback: true
}, function (req, email, password, done) {
    // Validator các input từ trang đăng ký
    req.checkBody('firstname', req.__('Please input first name.')).notEmpty();
    req.checkBody('lastname', req.__('Please input last name.')).notEmpty();
    req.checkBody('email', req.__('Email address invalid, please check again.')).notEmpty().isEmail();
    req.checkBody('password', req.__('Password invalid, password must be at least %d characters or more.', settings.passwordLength)).notEmpty().isLength({
        min: settings.passwordLength
    });
    req.checkBody('password', req.__('Password invalid, password must be at least %d characters or more.', settings.passwordLength)).notEmpty().isLength({
        min: settings.passwordLength
    });

    req.checkBody('password', req.__('Confirm password is not the same, please check again.')).equals(req.body.confirmpassword);
    req.checkBody('accept', req.__('You have to accept with our terms to continue.')).equals("1");

    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }

    Member.findOne({
        'local.email': email
    }, function (err, member) {
        if (err) {
            return done(err);
        }
        if (member) {
            return done(null, false, {
                message: req.__('Email address used, please enter another email.')
            });
        }
        var newMember = new Member();
        newMember.info.firstname = req.body.firstname;
        newMember.info.lastname = req.body.lastname;
        newMember.local.email = req.body.email;
        newMember.local.password = newMember.encryptPassword(req.body.password);
        newMember.newsletter = req.body.newsletter;
        newMember.roles = 'MEMBER';
        // Nếu yêu cầu kích hoạt tài khoản qua email thì trạng thái tài khoản là INACTIVE
        newMember.status = (settings.confirmRegister == 1) ? 'INACTIVE' : 'ACTIVE';

        newMember.save(function (err, result) {
            if (err) {
                return done(err);
            } else {
                // Nếu yêu cầu kích hoạt tài khoản qua email thì chỉ đăng ký mà không tự động đăng nhập
                if (settings.confirmRegister == 1) {
                    return done(null, newMember);
                } else {
                    // Tự động đăng nhập cho thành viên mới đăng ký khi không yêu cầu kích hoạt tài khoản qua email
                    req.logIn(newMember, function (err) {
                        provider = 'local';
                        return done(err, newMember);
                    });
                }
            }
        });
    });
}));

// passport login
passport.use('local.login', new LocalStrategy({
    usernameField: 'email', // Tên của input dùng đăng nhập
    passwordField: 'password', // tên của input mật khẩu
    passReqToCallback: true
}, function (req, email, password, done) {
    req.checkBody('email', req.__('Invalid email address, please try again.')).notEmpty().isEmail();
    req.checkBody('password', req.__('Incorrect password, please try again.')).notEmpty();

    // var errors = req.validationErrors();

    // if(errors){
    //     var messages = [];
    //     errors.forEach(function(error){
    //         messages.push(error);
    //     });
    //     return done(null, false, req.flash('error', messages));
    // }

    //Check member input
    Member.findOne({
        'local.email': email
    }, function (err, member) {
        if (err) {
            return done(err);
        }
        if (!member) {
            return done(null, false, {
                message: req.__('Member not found!')
            });
        }

        if (!member.validPassword(password)) {
            return done(null, false, {
                message: req.__('Password incorrect, please try again.')
            });
        }

        if (member.isInActivated(member.status)) {
            return done(null, false, {
                message: req.__('Your account is inactive')
            });
        }

        // if(member.isSuspended(member.status)) {
        //     return done(null, false, {
        //         message: req.__('Your account is suspended')
        //     });
        // }

        provider = "local";
        return done(null, member);

    });
}));

/* passport facebook */
passport.use(new FacebookStrategy({
    clientID: cfgAuth.facebookAuth.clientID,
    clientSecret: cfgAuth.facebookAuth.clientSecret,
    callbackURL: cfgAuth.facebookAuth.callbackURL,
    profileFields: cfgAuth.facebookAuth.profileFields,
    passReqToCallback: true
}, function (req, token, refreshToken, profile, done) {
    // check exist account
    Member.findOne({
        'facebook.id': profile.id
    }, function (err, member) {
        if (err) return done(err);

        if (member) {
            provider = "facebook";
            return done(null, member);
        } else {
            Member.findOne({
                'local.email': profile.emails[0].value
            }, function (err, member) {
                if (err) return done(err);
                if (member) {
                    // Update exist account
                    Member.findOneAndUpdate({
                        'local.email': profile.emails[0].value
                    }, {
                            'facebook.id': profile.id,
                            'facebook.token': token,
                            'facebook.email': profile.emails[0].value,
                            'facebook.name': profile.name.giveName + ' ' + profile.name.familyName,
                            'facebook.photo': 'https://graph.facebook.com/v3.2/' + profile.id + 'picture?type=large'
                        }, {
                            'new': true
                        }, function (err, member) {
                            if (err) return done(err);
                            provider = "facebook";
                            return done(null, member);
                        });
                } else {
                    // add new account with facebook info
                    var newMember = new Member();
                    newMember.facebook.id = profile.id;
                    newMember.facebook.token = token;
                    newMember.facebook.email = profile.emails[0].value;
                    newMember.facebook.name = profile.name.giveName + ' ' + profile.name.familyName;
                    newMember.facebook.photo = "https://graph.facebook.com/v3.2/" + profile.id + 'picture?type=large';
                    newMember.roles = "MEMBER";
                    newMember.status = "ACTIVE";
                    newMember.save(err, function () {
                        if (err) return done(err);
                        provider = "facebook";
                        return done(null, newMember);
                    });
                }
            });
        }

    });
}));

// passport google
passport.use(new GoogleStrategy({
    clientID: cfgAuth.googleAuth.clientID,
    clientSecret: cfgAuth.googleAuth.clientSecret,
    callbackURL: cfgAuth.googleAuth.callbackURL,
    passReqToCallback: true
}, function (req, token, refreshToken, profile, done) {
    // check exist account
    Member.findOne({
        'google.id': profile.id
    }, function (err, member) {
        if (err) return done(err);

        if (member) {
            provider = "google";
            return done(null, member);
        } else {
            Member.findOne({
                'local.email': profile.emails[0].value
            }, function (err, member) {
                if (err) return done(err);
                if (member) {
                    Member.findOneAndUpdate({
                        'local.email': profile.emails[0].value
                    }, {
                            'google.id': profile.id,
                            'google.token': token,
                            'google.name': profile.displayName,
                            'google.email': profile.emails[0].value,
                            'google.photo': profile.photos[0].value
                        }, {
                            new: true
                        },
                        function (err, member) {
                            if (err) return done("day la loi: " + err);
                            provider = "google";
                            return done(null, member);
                        }
                    );
                } else {
                    //add new member using google account
                    var newMember = new Member();
                    newMember.google.id = profile.id;
                    newMember.google.token = profile.token;
                    newMember.google.name = profile.displayName;
                    newMember.google.email = profile.emails[0].value;
                    newMember.google.photo = profile.photos[0].value;
                    newMember.roles = 'MEMBER';
                    newMember.status = 'ACTIVE';

                    newMember.save(function (err) {
                        if (err) throw err;
                        provider = "google";
                        return done(null, newMember);
                    });
                }
            });
        }
    });
}));

// passport backend
passport.use('backend.login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done){
    req.checkBody('email', req.__('Email address is valid, please check again')).notEmpty().isEmail();
    req.checkBody('password', req.__('Please input your password')).notEmpty();
    req.checkBody('pin_code', req.__('Please input your pincode')).notEmpty();

    var errors = req.validationErrors();
    
    if(errors){
        var messages = [];
        errors.forEach((err) => {
            messages.push(err.msg);
        });
        return done(null, false, req.flash('error', messages));
    }

    // // find member
    Member.findOne({
        'local.email': email
    }, function(err, member){
        if(err) return done(err);
        if(!member){
            return done(null, false, {
                message: req.__('This account is not exist, please check again')
            });
        }
        // process.exit();
        if(!member.validPincode(req.body.pin_code)){
            return done(null, false, {
                message:  req.__('Your information invalid, please check again')
            });
        }
        // console.log(member.isGroupAdmin(member.roles));
        // process.exit();
        if(!member.isGroupAdmin(member.roles)){
            return done(null, false, {
                message:  req.__('You haven\'t permission login administrator panel, please go back homepage')
            });
        }
        if(member.isInActivated(member.status)){
            return done(null, false, {
                message: req.__('Your account is not actived')
            });
        }
        if(member.isSuspended(member.status)){
            return done(null, false, {
                message: req.__('Your account is suspended')
            });
        }
        provider = "backend";
        return done(null, member);
    });
}));