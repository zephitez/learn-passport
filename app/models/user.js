//load the things we needed
var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs');

//define schema

var userSchema = mongoose.Schema({

  local : {
    email : String,
    password : String
  },
  facebook : {
    id : String,
    token : String,
    email : String,
    name : String
  }
});


//method
//generation hash
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

  //check against our db user password
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

//create model and expose to app
module.exports = mongoose.model('User', userSchema);
