var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var i18n = require('i18n');
var bodyParser = require('body-parser');
var logger = require('morgan');
var expHbs = require('express-handlebars');
var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');

var settings = require('./config/settings');
var database = require('./config/database');

var index = require('./routes/index');
var memberRouter = require('./routes/member');
var backendRoutes = require('./routes/backend');
var courseRouter = require('./routes/course');

var app = express();
  
var Member = require('./models/member');
var Course = require('./models/course');
mongoose.connect(database.dbStr, {useNewUrlParser: true});
mongoose.connection.on('error', function(err) {
	console.log('Error connect to Database: ' + err);
});

app.use(validator());

require('./config/passport');

// view engine setup
var hbsConfig = expHbs.create({
	helpers: require('./helpers/handlebars.js').helpers,
	layoutsDir: path.join(__dirname, '/templates/'+ settings.defaultTemplate +'/layouts'),
	defaultLayout: path.join(__dirname, '/templates/'+ settings.defaultTemplate +'/layouts/layout'),
	partialsDir: path.join(__dirname, '/templates/'+ settings.defaultTemplate +'/partials'),
	extname: '.hbs'
});

app.engine('.hbs', hbsConfig.engine);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, '/templates/default'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
i18n.configure({
	locales: ['en', 'vi'], // Khai báo danh sách ngôn ngữ
	register: global,
	fallbacks: {'en' : 'vi'},
	cookie: 'language', // This is cookie's name in browser
	queryParameter: 'lang', // This is the params on url: domain.com/?lang=vi
	defaultLocale: 'vi', // defaul language
	directory: __dirname + '/languages',
	directoryPermissions: '755', // Thiết lập quyền ghi cho các file ngôn ngữ (chỉ dùng cho hệ thống linux)
	autoReload: true,
	updateFiles: true,
	api: {
		'__': '__', // Đây là 2 hàm dùng trong template dịch ngôn ngữ
		'__n': '__n'
	}
});

app.use(session({
	secret: settings.secured_key,
	resave: false,
	saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
	i18n.init(req, res, next);
});

app.use(function(req, res, next){
	res.locals.clanguage = req.getLocale(); // Ngôn ngữ hiện tại
	res.locals.languages = i18n.getLocales(); // Danh sách ngôn ngữ khai báo trong phần cấu hình bên trên.
	res.locals.settings = settings;
	res.locals.loged = req.isAuthenticated();
	res.locals.member = req.user;
	// res.locals.backend = (req.user.provider === 'backend'?true:false);
	next();
});

app.use('/', index);
app.use('/member', memberRouter);
app.use('/admin', backendRoutes);
app.use('/course', courseRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
