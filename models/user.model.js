const mongoose = require('mongoose');

const user = mongoose.Schema({
  email: { type: String, require: true },
  // name: { type: String, require: true },
  password: { type: String, require: true },
  firstName: { type: String, require: true },
  middleName: { tyoe: String },
  lastName: { type: String, require: true },
  mobile: { type: Number, require: true }
});

module.exports = mongoose.model('User', user);
