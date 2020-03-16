var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session)
var schema = require("./schema")

var array_proto = require("./array_proto")()

var io = require('socket.io')()

var indexRouter = require('./routes/index');
var chatroomRouter = require('./routes/chatroom');
var loginRouter = require("./routes/login");
var logoutRouter = require("./routes/logout")
var makeroomRouter = require("./routes/makeroom")
var worewolfRouter = require("./routes/worewolf")
var ruleRouter = require("./routes/rule")
var oldRouter = require("./routes/old")
var registerRouter = require("./routes/register")
var mypageRouter = require("./routes/mypage")

var app = express();
var mongoURL
if(process.env.NODE_ENV == "development"){
  mongoURL = "mongodb://localhost:27017/worewolf"
} else {
  mongoURL = "mongodb://heroku_9pvbfnxx:i2rp4vjh712sm5pnme6os9pf6o@ds133271.mlab.com:33271/heroku_9pvbfnxx"
}
mongoose.set('useCreateIndex', true)
mongoose.connect(mongoURL, { useNewUrlParser: true ,  useUnifiedTopology: true});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
var sessionMW = session({
  secret: 'udo',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000
  }
})
app.session = sessionMW
app.use(sessionMW);

app.io = io
io.use(function(socket, next){
  sessionMW(socket.request, socket.request.res, next)
})

app.use('/', indexRouter);

app.use("/", ruleRouter) // ほぼ静的ファイル

app.use('/login', loginRouter);
app.use('/logout', logoutRouter)
app.use("/chatroom", chatroomRouter)
app.use("/makeroom", makeroomRouter)
app.use("/worewolf", worewolfRouter)
app.use("/old", oldRouter)
app.use("/register", registerRouter)
app.use("/mypage", mypageRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var Worewolf = require("./game/worewolf")
var worewolfServer = new Worewolf(io)

var Wordwolf = require("./game/wordwolf")
var wordwolfServer = new Wordwolf(io.of("/wordwolf"))


module.exports = app;
