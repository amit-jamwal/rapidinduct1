const express = require('express');
const app = express();
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const { checkUserName, checkUserExists } = require('../controllers/user.controller');
const nodeMailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const config = require('../config');
const transporter = nodeMailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  auth: {
    user: 'bharjam@gmail.com',
    pass: 'jamwal2622'
  }
})
const senderMail = 'bharjam@gmail.com';
app.use(checkUserName());
app.use(checkUserExists());
router.post('/register', checkUserName(), (req, res, next) => {
  const password = randomString();
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({
        error: err
      });
    } else {
      const user = new User({
        email: req.body.email,
        password: hash
      });

      user
        .save()
        .then(result => {
          const htmlTemplate =
            `<b>Hello <br>, <br> Congratulations! your account is succesfully created with user name ${req.body.email}
              . <br> Temporary Password is: ${password}
           <br>
           Thank you <br>
          GND`;
          const mailOptions = {
            from: senderMail,
            to: req.body.email,
            subject: 'test mail',
            html: htmlTemplate
          };

          transporter.sendMail(mailOptions, (error, resp) => {
            if (error) {
              console.error('ERROR', error);
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
    }
  });
});

router.post('/forgotpwd', async (req, res) => {
  User.findOne({ email: req.body.email }, (error, user) => {
    if (error) {
      res.json({ status: 'Fail', 'error': error });
    }
    if (!user) {
      res.json({ message: 'email does not exists.', status: 'Fail', 'error': error });

    }
  });
  const forgotPwd = randomString();
  bcrypt.hash(forgotPwd, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    const query = { email: req.body.email };
    User.updateOne(
      query,
      {
        $set: {
          password: hash
        }
      },
      { upsert: false }
    ).then(result => {
      res.json({ 'data': result });


      const mailOptions = {
        from: senderMail,
        to: req.body.email,
        subject: 'test mail',
        html: `<b>Hello <br> amit-jamwal, <br>
            Your password for GND is reset. <br>
            New Password is:  <br> `.concat(forgotPwd, `
            <br>
            Loggin to you account and change your password. <br>
            Thank you <br>
            GND
            `)

      };

      transporter.sendMail(mailOptions, (error, resp) => {
        if (error) {
          console.error('ERROR', error);
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
  });
});

router.post('/authenticate', checkUserExists(), (req, res, next) => {
  let userPwd = null;
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) {
      console.err(err);
      // throw err;
      res.json({ success: false, message: 'Error Occur', 'error': err });
      next();

    }
    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
      next();
    }
    userPwd = user.password;
    console.log(req.body, userPwd);
    bcrypt.compare(req.body.password, userPwd, (error, result) => {
      console.log(error);
      if (error || !result) {
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
  });


});

router.post('/updateuser', (req, res) => {
  console.log(req.body);

  User.findOne({ email: req.body.email }).then(data => {
    console.log(data);
    if (!data) {
      res.json({
        success: true,
        message: 'User not exist'
      });
    } else {
      User.updateOne(
        {
          email: req.body.email
        },
        {
          $set: {
            firstName: req.body.firstName,
            middleName: req.body.middleName,
            lastName: req.body.lastName,
            mobile: req.body.mobile
          }
        },
        { upsert: false }
      ).then(dataSet => {
        console.log('*****', dataSet);
        res.json(data);
      });
    }
  });
});


router.post('/changepwd', checkUserExists(), (req, res) => {
  console.log('adf')
  User.findOne({ email: req.body.email }, (error1, user) => {
    console.log('1', error1, user)
    if (error1) {
      res.json({ error: error1, status: 'Fail' });
    }
    if (!user) {
      res.json({
        message: 'email does not exists, please verify and try again.',
        status: 'Fail'
      });
    }
    console.log('1', user)

    if (user) {
      bcrypt.compare(req.body.oldPwd, user.password, (err, result) => {
        if (err) {
          res.status(400).json({
            message: err,
            success: false
          });
        }
        if (!result) {
          res.status(400).json({
            message: 'Old password not matched.',
            success: false
          });
        }
        if (result) {
          bcrypt.hash(req.body.newPwd, 10, (er, hash) => {
            if (er) {
              res.status(400).json({
                message: err,
                success: false
              });
            }
            const query = { email: req.body.email };
            User.updateOne(
              query,
              {
                $set: {
                  password: hash
                }
              },
              { upsert: false }
            ).then(result => {

              const mailOptions = {
                from: 'bharjam@gmail.com',
                to: req.body.email,
                subject: 'test mail',
                html: `<b>Hello <br>
                     Your password have successfully changed. <br>
                      Thank you <br>
                      GND`
              };

              transporter.sendMail(mailOptions, (errr, resp) => {
                if (errr) {
                  console.error('ERROR', errr);
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
          });
        }
      });
    }
  });
});

router.post('/assigntraining', checkUserExists(), (req, res) => {
  console.log(req.body);
  User.findOne({ email: req.body.email }).then(data => {
    console.log(data);
    if (!data) {
      res.json({
        success: true,
        message: 'User not exist'
      });
    } else {
      User.updateOne(
        {
          'email': req.body.email
        },
        {
          $set: {
            'trainingId': req.body.trainingId
          }
        },
        { upsert: false, multi: false }
      ).then(dataSet => {
        console.log('*****', dataSet);
        res.json(data);
      });
    }
  });
})



module.exports = router;

/**
 * FUNCTION FOR GENERATE RANDOM STRING FOR PASSWORD...
 */
function randomString() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
  const string_length = 8;
  let randomstring = '';
  for (let i = 0; i < string_length; i++) {
    const rnum = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(rnum, rnum + 1);
  }
  return randomstring;
}

