const User = require('../models/user.model');

const checkUser = () => {
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

module.exports = checkUser;
