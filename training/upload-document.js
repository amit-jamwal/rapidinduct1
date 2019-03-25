const express = require('express');
const multer = require('multer');
const router = express.Router();
const Training = require('../models/training.model');
const TrainingQuiz = require('../models/training-quiz.model');
const path = require('path');
const fs = require('fs');

let storage = multer.diskStorage({
  destination: function(request, file, callback) {
    callback(null, './uploads/');
  },
  filename: function(request, file, callback) {
    console.log(file);
    callback(null, request.body.name + '-' + Date.now() + path.extname(file.originalname));
  }
});
var upload = multer({ storage: storage });

router.get('/trainings', (req, res) => {
  Training.find()
    .then(result => {
      res.json({
        success: true,
        data: result
      });
    })
    .catch(error => {
      res.json({
        success: false,
        message: error
      });
    });
});

router.post('/upload', upload.single('photo'), function(req, res) {
  Training.findOne({ trainingName: req.body.name })
    .then(data => {
      if (data) {
        fs.unlink(req.file.path, err => {
          if (err) throw err;
          console.log('successfully deleted');
        });
        res.json({
          success: false,
          message: 'Training already created.',
          id: data._id
        });
      } else {
        const training = new Training({
          trainingName: req.body.name,
          description: req.body.description,
          passingMarks: req.body.passingCriteria,
          fileName: req.file.fileName,
          filePath: req.file.path
        });

        training
          .save()
          .then(result => {
            res.json({
              success: true,
              filename: req.file.originalname
            });
          })
          .catch(error => {
            console.error(error);
            fs.unlink(req.file.path, err => {
              if (err) throw err;
            });
            res.status(500).json({
              success: false,
              message: error
            });
          });
      }
    })
    .catch(error => {
      fs.unlink(req.file.path, err => {
        if (err) throw err;
      });
      res.status(500).json({
        success: false,
        message: error
      });
    });
});

router.post('/download', (req, res) => {
  console.log();
  console.log(path.dirname(require.main.filename));
  res.download(req.body.filename);
});

router.post('/edit', upload.single('photo'), (req, res) => {
  var myquery = { _id: '5c6d503bb23559537054efea' };

  Training.findOne(myquery).then(result => {
    if (result) {
      fs.unlink(result.filePath, err => {
        if (err) {
          console.error(err);
        }
        console.log('successfully deleted');
        var newvalues = { $set: { filePath: req.file.path, fileName: req.file.filename } };
        Training.updateOne(myquery, newvalues, (err, result) => {
          if (err) {
            res.json({ error: err });
          } else {
            res.json(result);
          }
        });
      });
    } else {
      fs.unlink(req.file.path, err => {
        if (err) {
          console.error(err);
        }
        console.log('successfully deleted');
      });
      res.json({
        success: false,
        message: 'No record found for update'
      });
    }
  });

  console.log(req.file);
});

router.post('/saveTrainingQuiz', (req, res) => {
  console.log(req.body);
  const trainingQuiz = new TrainingQuiz({
    trainingId: req.body.trainingId,
    question: req.body.question,
    option1: req.body.option1,
    option2: req.body.option2,
    option3: req.body.option3,
    option4: req.body.option4,
    answer: req.body.answer
  });
  trainingQuiz
    .save()
    .then(result => {
      res.json({
        success: true,
        result: result
      });
    })
    .catch(error => {
      console.log('Error', error);
      res.send(500).json({ error });
    });
});

module.exports = router;
