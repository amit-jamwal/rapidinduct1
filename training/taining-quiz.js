const express = require('express');
const router = express.Router();
const TrainingQuiz = require('../models/training.model');

router.post('/saveTrainingQuiz', (req, res) => {
  console.log(req.body);
  res.json({ success: true });
});

module.exports = router;
