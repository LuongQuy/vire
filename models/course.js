var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var courseSchema = new Schema({
    coursename: String,
    description: String,
    instructor: String
}, {
        timestamps: true
    });

module.exports = mongoose.model('Course', courseSchema);