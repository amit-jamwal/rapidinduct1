const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');

const config = require('./config');
const User = require('./models/user.model');
const userRouter = require('./users/user.route');

const PORT = process.env.PORT || 3000;
mongoose.connect(config.database, { useNewUrlParser: true });
app.set('superSecret', config.secret);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/test', (req, res, next) => {
  res.json({
    Test: 'Test api successfull'
  });
});
app.get('/', (req, res) => {
  res.json({ msg: 'fdfd' });
});

app.get('/setup', function(req, res) {
  // create a sample user
  var nick = new User({
    email: 'amit@gmail.com',
    name: 'amit bhardwaj',
    password: 'password'
  });

  // save the sample user
  nick.save(function(err) {
    if (err) {
      console.log(err);
      throw err;
    }

    console.log('User saved successfully');
    res.json({ success: true });
  });
});

app.use('/user', userRouter);

// app.use('/user', user);
app.listen(PORT, () => {
  console.log('Server is running on Port', PORT);
});
