const User = require('../models/user.model');

const checkUserName = () => {
  return (req, res, next) => {
    User.findOne({ email: req.body.email })
      .then(data => {
        if (data) {
          res.json({
            success: false,
            message: 'User name already taken.',
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

const checkUserExists = () => {
  return (req, res, next) => {
    User.findOne({ email: req.body.email }, (error, user) => {
      if (error) {
        res.json({ status: 'Fail', 'error': error });
      }
      if (!user) {
        res.json({ message: 'email does not exists.', status: 'Fail', 'error': error });
      } else {
        next();
      }
    });
  };
};

module.exports = { checkUserName, checkUserExists };