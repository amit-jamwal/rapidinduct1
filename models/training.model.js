const mongoose = require('mongoose');

const training = mongoose.Schema({
  trainingName: { type: String, require: true },
  description: { type: String },
  passingMarks: { type: Number, require: true },
  filePath: { type: String, require: true },
  fileName: { type: String, require: true }
});

module.exports = mongoose.model('Training', training);
