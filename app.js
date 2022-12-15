var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var app = express();
const path = require('path')
const hbs = require('express-handlebars')
const session = require('express-session')
var Handlebars = require('handlebars');
// mongodb connection requiring
var db = require('./config/connection')
db.connect(err => {
  if (!err)
    console.log('database connected');
  else
    console.log('database connection failed');
})
var indexRouter = require('./routes/');
var adminRouter = require('./routes/admin');
const { options } = require('./routes/');
const { log } = require('console');
//--------------------------------------- index increment----------------------------------------------
Handlebars.registerHelper("inc", function (value, options) {
  return parseInt(value) + 1;
});
//----------------------------------- equal checking (from database and hbs )--------------------------
Handlebars.registerHelper('ifCond', function (v1, v2, options) {
  if (v1 == v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});

Handlebars.registerHelper('ifEquals', function (value1, value2, options) {
  if (value1 == value2) {
    return options.fn(this);
  }
});

Handlebars.registerHelper('ifNotEquals', function (v1, v2, options) {
  if (v1 != v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});

// --------------------in order management status checking payment approve------------------------------

// ----------------razorpy--------------------------------
Handlebars.registerHelper('razorpayfn',function(value1,value2,value3,options){
  if(value1=='complete' && value2=='online' && value3=='order canceled' || value1=='complete' && value2=='online' && value3=='return accepted'){
    return options.fn(this)
  }
});
Handlebars.registerHelper('razorpayReFn',function(value1,value2,value3,options){
  if(value1==null && value2=='online' && value3=='order canceled' || value1==null && value2=='online' && value3=='return accepted'){
    return options.fn(this)
  }
});
// ----------------paypal--------------------------------
Handlebars.registerHelper('paypalfn',function(value1,value2,value3,options){
  if(value1=='complete' && value2=='paypal' && value3=='order canceled' || value1=='complete' && value2=='paypal' && value3=='return accepted'){
    return options.fn(this)
  }
});
Handlebars.registerHelper('paypalReFn',function(value1,value2,value3,options){
  if(value1==null && value2=='paypal' && value3=='order canceled' || value1==null && value2=='paypal' && value3=='return accepted'){
    return options.fn(this)
  }
});
// ----------------cod-------------------------------

Handlebars.registerHelper('codfn',function(value1,value2,value3,options){
  if(value1=='complete' && value2=='cod' && value3=='order canceled' || value1=='complete' && value2=='cod' && value3=='return accepted'){
    return options.fn(this)
  }
});
Handlebars.registerHelper('codReFn',function(value1,value2,value3,options){
  if(value1==null && value2=='cod' && value3=='order canceled' || value1==null && value2=='cod' && value3=='return accepted'){
    return options.fn(this)
  }
});
// ------------------wallet------------------------------
Handlebars.registerHelper('walletfn',function(value1,value2,value3,options){
  if(value1=='complete' && value2=='wallet' && value3=='order canceled' || value1=='complete' && value2=='wallet' && value3=='return accepted'){
    return options.fn(this)
  }
});
Handlebars.registerHelper('walletReFn',function(value1,value2,value3,options){
  if(value1==null && value2=='wallet' && value3=='order canceled' || value1==null && value2=='wallet' && value3=='return accepted'){
    return options.fn(this)
  }
});
// --------------------in order management status checking payment approve end-----------------------
//----------------------------------- view engine setup------------------------------------------------
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({ extname: 'hbs', defaultLayout: 'layout', defaultLayout: __dirname + '/views/layout', partialsDir: __dirname + '/partials/' }))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//----------------------------------session and cache---------------------------------------
app.use(session({ secret: 'key', resave: false, saveUninitialized: false, cookie: { maxAge: 600000000000 } }))
app.use((req, res, next) => {
  res.set('cache-control', 'no-store')
  next()
})
app.use('/', indexRouter);
app.use('/admin', adminRouter);
//-----------------------------catch 404 and forward to error handler----------------------------
app.use(function (req, res, next) {
  next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
  // ---------------------------set locals, only providing error in development-------------------
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // ----------------------render the error page--------------------------------------------------
  res.status(err.status || 500);
  res.render('error');
});
module.exports = app;
