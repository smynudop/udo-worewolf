"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("express-session");
var mongoose = require("mongoose");
var MongoStore = require("connect-mongo")(session);
const schema = require("./schema");
var array_proto = require("./array_proto");
var io = require("socket.io")();
const index_1 = require("./routes/index");
const chatroom_1 = require("./routes/chatroom");
const login_1 = require("./routes/login");
const logout_1 = require("./routes/logout");
const makeroom_1 = require("./routes/makeroom");
const worewolf_1 = require("./routes/worewolf");
const rule_1 = require("./routes/rule");
const old_1 = require("./routes/old");
const register_1 = require("./routes/register");
const mypage_1 = require("./routes/mypage");
const makeWordroom_1 = require("./routes/makeWordroom");
const wordwolf_1 = require("./routes/wordwolf");
var app = express();
var mongoURL;
if (process.env.NODE_ENV == "development") {
    mongoURL = "mongodb://localhost:27017/worewolf";
}
else {
    mongoURL =
        "mongodb+srv://user-udo:tnxe6sou@cluster0.cidgl.mongodb.net/worewolf?retryWrites=true&w=majority";
}
mongoose.set("useCreateIndex", true);
mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
// view engine setup
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));
var sessionMW = session({
    secret: "udo",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
    },
});
app.session = sessionMW;
app.use(sessionMW);
app.io = io;
io.use(function (socket, next) {
    sessionMW(socket.request, socket.request.res, next);
});
app.use("/", index_1.router);
app.use("/", rule_1.router); // ほぼ静的ファイル
app.use("/login", login_1.router);
app.use("/logout", logout_1.router);
app.use("/chatroom", chatroom_1.router);
app.use("/makeroom", makeroom_1.router);
app.use("/worewolf", worewolf_1.router);
app.use("/old", old_1.router);
app.use("/register", register_1.router);
app.use("/mypage", mypage_1.router);
app.use("/makeWordroom", makeWordroom_1.router);
app.use("/wordwolf", wordwolf_1.router);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render("error");
});
var Worewolf = require("./game/worewolf");
var worewolfServer = new Worewolf(io);
var Wordwolf = require("./wordwolf/wordwolf");
var wordwolfServer = new Wordwolf(io);
module.exports = app;
//# sourceMappingURL=app.js.map