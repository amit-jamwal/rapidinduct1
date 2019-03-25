const Training = require('../models/training.model');

const checkTraining = () => {
  return (req, res, next) => {
    console.log('99999', req.body);
    Training.findOne({ trainingName: req.body.name })
      .then(data => {
        console.log('*******', data);
        if (data) {
          res.json({
            success: false,
            message: 'Training already created.',
            id: data._id
          });
        } else {
          next();
        }
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({
          success: false,
          message: error
        });
      });
  };
};

module.exports = checkTraining;
