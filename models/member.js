var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var memberSchema = new Schema({
    info: {
        firstname: String,
        lastname: String,
        phone: String,
        company: String, 
        address: String,
        cities: [{ type: Schema.ObjectId, ref: 'City'}], //store array city_id
        countries: [{ type: Schema.ObjectId, ref: 'Country'}], //store array country_id
    },
    local: { // Use local
        email: String,
        password: String,
        adminPin: String,
        activeToken: String,
        activeExpires: Date,
        resetPasswordToken: String,
        resetPasswordExpires: Date
    },
    facebook: { // Use passport facebook
        id: String,
        token: String,
        email: String,
        name: String,
        photo: String
    },
    google: { // Use passport google
        id: String,
        token: String,
        email: String,
        name: String,
        photo: String
    },
    newsletter: Boolean, // True or false
    roles: String, //ADMIN, MOD, MEMBER, VIP
    status: String //ACTIVE, INACTIVE, SUSPENDED
}, {
    timestamps: true
});

// Mã hóa mật khẩu
memberSchema.methods.encryptPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
}

// Giải mã mật khẩu
memberSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
}

// check pincode
memberSchema.methods.validPincode = function(pincode) {
    // return bcrypt.compareSync(pincode, this.local.adminPin);
    return pincode === this.local.adminPin;
}

// check role
memberSchema.methods.isGroupAdmin = function(role){
    return role === 'ADMIN';
}


memberSchema.methods.isInActivated = function(checkStatus){
    return checkStatus == "INACTIVE";
};

memberSchema.methods.isSuspended = function(checkStatus){
    return checkStatus == "SUSPENDED";
};

module.exports = mongoose.model('Member', memberSchema);