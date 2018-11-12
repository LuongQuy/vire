var csrf = require('csurf');
var express = require('express');
var router = express.Router();

var csrfProtection = csrf();
router.use(csrfProtection);
var auth_controller = require('../controllers/backend/authController');

router.get('/dashboard', auth_controller.isLoggedIn, auth_controller.get_dashboard);
router.get('/logout', auth_controller.isLoggedIn, auth_controller.get_logout);

router.use('/', auth_controller.notLogin_use);
router.get('/login', auth_controller.notLoggedIn, auth_controller.get_login);
router.post('/login', auth_controller.post_login);

module.exports = router;