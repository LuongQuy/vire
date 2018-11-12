var express = require('express');
var router = express.Router();
var csrf = require('csurf');

var csrfProtected = csrf();
router.use(csrfProtected);

// Require Controller Module
var member_controller = require('../controllers/memberController');

/* GET Member Profile. */
router.get('/account', member_controller.isLogedIn, member_controller.get_profile);

/* GET Member logout. */
router.get('/logout', member_controller.isLogedIn, member_controller.get_logout);

router.use('/', member_controller.notLogin_use);

/* GET Member Register. */
router.get('/register', member_controller.notLogedIn, member_controller.get_register);

/* POST Member Register. */
router.post('/register', member_controller.post_register);

/* GET Member Login. */
router.get('/login', member_controller.notLogedIn, member_controller.get_login);

/* POST Member Login. */
router.post('/login', member_controller.post_login);

/* GET Facebook Login */
router.get('/facebook', member_controller.get_facebook_login); 

/* GET Facebook callback login */
router.get('/facebook/callback', member_controller.get_facebook_callback_login); 

// GET Google login
router.get('/google', member_controller.get_google_login);

// GET Google callback login
router.get('/google/callback', member_controller.get_google_callback_login);

module.exports = router;
