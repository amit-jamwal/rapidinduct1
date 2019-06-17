const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const config = require('./config');
const userRouter = require('./users/user.route');
const uploadRouter = require('./training/upload-document');

const PORT = process.env.PORT || 3001;
mongoose.connect(config.database, { useNewUrlParser: true}, (err)=>{
  if(err){
    console.error('ERROR:', err);
  }
});
app.set('superSecret', config.secret);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ type: 'application/json' }));
app.use(morgan('dev'));

//create a cors middleware
app.use(function(req, res, next) {
  //set headers to allow cross origin request.
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use('/user', userRouter);
app.use('/doc', uploadRouter);
// app.use('/training', trainingQuiz);

app.listen(PORT, () => {
  console.log('Server is running on Port', PORT);
});
