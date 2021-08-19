require('dotenv').config();
var createError = require("http-errors")
var express = require("express")
var path = require("path")
var cookieParser = require("cookie-parser")
var logger = require("morgan")
var session = require("express-session")
var mongoose = require("mongoose")
var MongoStore = require("connect-mongo")

var array_proto = require("./array_proto")

var io = require("socket.io")()

import { router as indexRouter } from "./routes/index"
import { router as loginRouter } from "./routes/login"
import { router as logoutRouter } from "./routes/logout"
import { router as makeroomRouter } from "./routes/makeroom"
import { router as worewolfRouter } from "./routes/worewolf"
import { router as ruleRouter } from "./routes/rule"
import { router as oldRouter } from "./routes/old"
import { router as registerRouter } from "./routes/register"
import { router as mypageRouter } from "./routes/mypage"

import { router as makeWordroomRouter } from "./routes/makeWordroom"
import { router as wordwolfRouter } from "./routes/wordwolf"
import SocketIO from "socket.io"

var app = express()
var mongoURL
if (process.env.NODE_ENV == "development") {
    mongoURL = "mongodb://localhost:27017/worewolf"
} else {
    mongoURL = process.env.MONGO_URL
}
mongoose.set("useCreateIndex", true)
mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })

// view engine setup
app.set("views", path.join(__dirname, "./views"))
app.set("view engine", "ejs")

app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "./public")))

var sessionMiddleWare = session({
    secret: "udo",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: mongoURL }),
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
    },
})
app.use(sessionMiddleWare)

app.mw = sessionMiddleWare

app.io = io

io.use(function (socket:SocketIO.Socket, next:any){
    sessionMiddleWare(socket.request, socket.request.res, next)
})

app.use("/", indexRouter)

app.use("/", ruleRouter) // ほぼ静的ファイル

app.use("/login", loginRouter)
app.use("/logout", logoutRouter)
app.use("/makeroom", makeroomRouter)
app.use("/worewolf", worewolfRouter)
app.use("/old", oldRouter)
app.use("/register", registerRouter)
app.use("/mypage", mypageRouter)
app.use("/makeWordroom", makeWordroomRouter)
app.use("/wordwolf", wordwolfRouter)

// catch 404 and forward to error handler
app.use(function (req:Express.Request, res:Express.Response, next:any) {
    next(createError(404))
})

// error handler
app.use(function (err:any, req:any, res:any, next:any) {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get("env") === "development" ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.render("error")
})

var Worewolf = require("./game/worewolf")
var worewolfServer = new Worewolf(io)

var Wordwolf = require("./wordwolf/wordwolf")
var wordwolfServer = new Wordwolf(io)

module.exports = app
