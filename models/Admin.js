var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var passportLocalMongoose = require("passport-local-mongoose");

var adminSchema = new mongoose.Schema({
  name: String,
  type: String,
  username: String,
  password: String,
  email: String,
  image: String
});

adminSchema.plugin(passportLocalMongoose);
var admin = (module.exports = mongoose.model("admin", adminSchema));

module.exports.createadmin = function(newadmin, callback) {
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newadmin.password, salt, function(err, hash) {
      newadmin.password = hash;
      newadmin.save(callback);
    });
  });
};

module.exports.getUserByUsername = function(username, callback) {
  var query = { username: username };
  admin.findOne(query, callback);
};

module.exports.getUserById = function(id, callback) {
  admin.findById(id, callback);
};

module.exports.comparePassword = function(candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, function(err, passwordFound) {
    if (err) throw err;
    callback(null, passwordFound);
  });
};
