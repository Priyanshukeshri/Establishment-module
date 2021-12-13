var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var passportLocalMongoose = require("passport-local-mongoose");

var employeeSchema = new mongoose.Schema({
  name: String,
  type: String,
  username: String,
  password: String,
  department: String,
  email: String,
  image: String,
  leaves: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Leave"
    }
  ]
});
employeeSchema.plugin(passportLocalMongoose);
var Employee = (module.exports = mongoose.model("Employee", employeeSchema));

module.exports.createEmployee = function(newEmployee, callback) {
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newEmployee.password, salt, function(err, hash) {
      newEmployee.password = hash;
      newEmployee.save(callback);
    });
  });
};

module.exports.getUserByUsername = function(username, callback) {
  var query = { username: username };
  Employee.findOne(query, callback);
};

module.exports.getUserById = function(id, callback) {
  Employee.findById(id, callback);
};

module.exports.comparePassword = function(candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, function(err, passwordFound) {
    if (err) throw err;
    callback(null, passwordFound);
  });
};
