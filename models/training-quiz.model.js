const mongoose = require('mongoose');

const training_quiz = mongoose.Schema({
  trainingId: { type: String, require: true },
  question: { type: String, require: true },
  option1: { type: String, require: true },
  option2: { type: String, require: true },
  option3: { type: String, require: true },
  option4: { type: String, require: true },
  answer: { type: String, require: true }
});

module.exports = mongoose.model('TrainingQuiz', training_quiz);
