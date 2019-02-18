var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session')
//this allows us to store session data in mongo instead of RAM
var MongoStore = require('connect-mongo')(session);
var app = express();


//connect with mongoose
mongoose.connect("mongodb://localhost:27017/bookworm", {useNewUrlParser: true})
var db = mongoose.connection;
//mongo error
db.on('error', console.error.bind(console,'MICHELLE!!! connection error'))

//use express-session middleware.
app.use(session({
  secret: 'treehouse loves you',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    //same db as the variable declared in the mongoose connect middleware
    mongooseConnection: db
  })
}))

//make user ID available in templates - custom middleware?
//response object has a property called locals. We're stuffing this with custom info using express.
//all views cann access responses locals
//call to next is required in custom middleware.
app.use(function(req, res, next){
  res.locals.currentUser = req.session.userId;
  next();
})


// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files from /public
//express built in middleware.
app.use(express.static(__dirname + '/public'));

// view engine setup
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

// include routes
var routes = require('./routes/index');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// listen on port 3000
app.listen(3000, function () {
  console.log('Express app listening on port 3000');
});
