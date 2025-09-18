const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please insert your name'],
  },
  email: {
    type: String,
    required: [true, 'Please insert your email address'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false, //it will never show in any query
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      //if the returned value is false that means we get a validation error
      //this only works on CREATE and SAVE
      validator: function (el) {
        return el === this.password;
      },
      message: 'The Passwords do not match',
    },
  },
  passwordChangedAt: Date,
});

//midlleware. pre hook. we want to do this only if the password field is modified!
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  //12 is the cpu cost. we are hashing the password with the cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  //we only have the real password hashed so we need to delete the confirmed password
  //it is a required input but it is not required to pressist in the database
  this.passwordConfirm = undefined;
  next();
});

//this is an instance method. it is a method that is available on all documents of a certain collection
//the candidate password is the password the user passes in
//the this keyword points to the current document in all instance methods we don't use it here because of the select false!
//correctPassword returns true or false
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

//we want to know if the user changed the password after the token was issued. we will pass the timestamp when the token was issued
//by default we will return false which means the user did not change the password after the token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    //they do not come in the same format 2024-10-03T00:00:00.000Z 1727960956. 10 is the base because it is a base 10 number. we devided by 1000 because it comes in milisseconds
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

//model creation
const User = mongoose.model('User', userSchema);
module.exports = User;
