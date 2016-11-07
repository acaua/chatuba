var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var userSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true,
    index: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
});

userSchema.methods.encryptPassword = function(password, callback) {
  var user = this;
  bcrypt.hash(password, 10, function(err, hash) {
    if (err) {
      callback(err);
    } else {
      user.password = hash;
      callback(null, user);
    };
  });
};

userSchema.methods.verifyPassword = function(password, callback) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};

module.exports = mongoose.model('User', userSchema);