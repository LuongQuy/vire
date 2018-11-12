var Member = require('../models/member');

exports.lang_en = function (req, res, next) {
	res.cookie('language', 'en', {maxAge: 900000, httpOnly: true});
	res.redirect('back');
}

exports.lang_vi = function (req, res, next) {
	res.cookie('language', 'vi', {maxAge: 900000, httpOnly: true});
	res.redirect('back');
}

exports.index = function (req, res, next) {
	// Use Member model
	// Member.find({}, function)
	res.render('frontend/home/home', {
		layout: false,
	});
}