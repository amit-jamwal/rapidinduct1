const express = require('express');
const app = express();
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const checkUser = require('./controller');
const nodeMailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const config = require('../config');
// var AWS = require('aws-sdk');
const { google } = require('googleapis');

app.use(checkUser());
router.post('/register', checkUser(), (req, res, next) => {
  let password = randomString();
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({
        error: err
      });
    } else {
      const user = new User({
        email: req.body.email,
        name: req.body.name,
        password: hash
      });

      user
        .save()
        .then(result => {
          console.log(result);
          let html =
            `<b>Hello <br>` +
            req.body.name +
            `, <br> Congratulations! your account is succesfully created with user name ` +
            req.body.email +
            `. <br> Temporary Password is: ` +
            password +
            `
           <br>
           Thank you <br>
           Amit Bhardwaj
           `;
          let transporter = nodeMailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'bharjam@gmail.com',
              pass: 'jamwal2622'
            }
          });
          let mailOptions = {
            from: 'bharjam@gmail.com',
            to: req.body.email,
            subject: 'test mail',
            html: html
          };

          transporter.sendMail(mailOptions, (err, resp) => {
            if (err) {
              console.error('ERROR', err);
              res.status(400).send();
            } else {
              console.log('EMAIL', resp);
              res.json({
                success: true,
                message: 'Message sent'
              });
            }
          });
          // res.status(200).json({
          //   success: true,
          //   message: 'New user has been created.'
          // });
        })
        .catch(error => {
          res.status(500).json({
            error: error
          });
        });
    }
  });
});

router.post('/forgotpassword', async (req, res) => {
  let transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'bharjam@gmail.com',
      pass: 'jamwal2622'
    }
  });
  let mailOptions = {
    from: 'bharjam@gmail.com',
    to: req.body.email,
    subject: 'test mail',
    html: `<b>Hello <br> amit-jamwal, <br>
            We wanted to let you know that your password was reset. <br>
            Temporary Password is:  <br>
            http://localhost:3000    `
  };

  transporter.sendMail(mailOptions, (err, resp) => {
    if (err) {
      console.error('ERROR', err);
      res.status(400).send();
    } else {
      console.log('EMAIL', resp);
      res.json({
        success: true,
        message: 'Message sent'
      });
    }
  });
});

router.post('/authenticate', (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) {
      console.err(err);
      throw err;
    }
    if (!user) {
      res.status(200).send({ success: false, message: 'Authentication failed. User not found.' });
    } else {
      console.log(req.body);
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        console.log(err);
        if (err || !result) {
          return res.status(401).json({
            success: false,
            message: 'Authentication failed. Wrong password.'
          });
        }
        if (result) {
          const payload = {
            user: user.email,
            _id: user._id
          };
          const token = jwt.sign(payload, config.secret);
          return res.status(200).json({
            success: true,
            token: token,
            userDetails: {
              name: user.name,
              email: user.email
            },
            message: 'Authentication Successfull'
          });
        }
      });
    }
  });
});
module.exports = router;

/**
 * FUNCTION FOR GENERATE RANDOM STRING FOR PASSWORD...
 */
function randomString() {
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
  var string_length = 8;
  var randomstring = '';
  for (var i = 0; i < string_length; i++) {
    var rnum = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(rnum, rnum + 1);
  }
  return randomstring;
}
