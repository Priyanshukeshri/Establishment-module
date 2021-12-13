var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var passportLocalMongoose = require("passport-local-mongoose");

var directorSchema = new mongoose.Schema({
  name: String,
  type: String,
  username: String,
  password: String,
  department: String,
  image: String,
  leaves: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Leave"
    }
  ]
});

directorSchema.plugin(passportLocalMongoose);
var director = (module.exports = mongoose.model("director", directorSchema));

module.exports.createdirector = function(newdirector, callback) {
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newdirector.password, salt, function(err, hash) {
      newdirector.password = hash;
      newdirector.save(callback);
    });
  });
};

module.exports.getUserByUsername = function(username, callback) {
  var query = { username: username };
  director.findOne(query, callback);
};

module.exports.getUserById = function(id, callback) {
  director.findById(id, callback);
};

module.exports.comparePassword = function(candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, function(err, passwordFound) {
    if (err) throw err;
    callback(null, passwordFound);
  });
};
