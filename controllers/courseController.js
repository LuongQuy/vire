var Course = require('../models/course');

exports.get_course = function(req, res){
    res.render('frontend/course/main', {
        layout: false,
        pageTitle: "Course",
        csrfToken: req.csrfToken()
    });
}

exports.post_add_new_course = function(req, res, next){
    var newCourse = new Course();
    newCourse.coursename = req.body.coursename;
    newCourse.description = req.body.description;
    newCourse.instructor = req.user.info.firstname;
    // console.log(req.user.info.firstname);
    // process.exit();
    newCourse.save(function(err) {
        if(err) throw err;
        res.redirect('/course/instructor/classroom');
    });
}

exports.get_classroom_student = function(req, res, next){
    res.render('frontend/course/classroom', {
        layout: false,
        pageTitle: "Classroom"
    });
}

exports.get_classroom_instructor = function(req, res, next){
    res.render('backend/course/classroom', {
        layout: false,
        pageTitle: "Classroom - Instructor"
    });
}