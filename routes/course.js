var express = require('express');
var router = express.Router();
var csrf = require('csurf');

var csrfProtected = csrf();
router.use(csrfProtected);

var member_controller = require('../controllers/memberController');
var course_controller = require('../controllers/courseController');

router.get('/', member_controller.isLogedIn, course_controller.get_course);

router.post('/add-new-course', course_controller.post_add_new_course);

router.get('/student/classroom', member_controller.isLogedIn_Student, course_controller.get_classroom_student);

router.get('/instructor/classroom', member_controller.isLogedIn_Instructor, course_controller.get_classroom_instructor);

module.exports = router;