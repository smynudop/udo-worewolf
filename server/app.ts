import dotenv from "dotenv"
import createError from "http-errors"
import express from "express"
import path from "path"
import cookieParser from "cookie-parser"
import session from "express-session"
import { Mongoose } from "mongoose"
import MongoStore from "connect-mongo"
import { Server, Socket } from "socket.io"

// Router
import indexRouter from "./routes/index"
import loginRouter from "./routes/login"
import logoutRouter from "./routes/logout"
import makeroomRouter from "./routes/makeroom"
import worewolfRouter from "./routes/worewolf"
import ruleRouter from "./routes/rule"
import oldRouter from "./routes/old"
import registerRouter from "./routes/register"
import mypageRouter from "./routes/mypage"

import makeWordroomRouter from "./routes/makeWordroom"
import wordwolfRouter from "./routes/wordwolf"

import setArrayExtension from "./array_proto"

import WoreWolf from "./game/worewolf"
import { GameManager as Wordwolf } from "./wordwolf/wordwolf"
setArrayExtension()

dotenv.config()

const app = express()
let mongoURL: string
if (process.env.NODE_ENV == "development") {
  mongoURL = "mongodb://localhost:27017/worewolf"
} else {
  mongoURL = process.env.MONGO_URL as string
}
const mongoose = new Mongoose()
mongoose.set("useCreateIndex", true)
mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })

// view engine setup
app.set("views", path.join(__dirname, "./views"))
app.set("view engine", "ejs")

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "./public")))

const sessionMiddleWare = session({
  secret: "udo",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: mongoURL }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
  },
})
app.use(sessionMiddleWare)
// @ts-ignore
app.mw = sessionMiddleWare

const io = new Server()
// @ts-ignore
app.io = io

io.use(function (socket: Socket, next: any) {
  // @ts-ignore
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
app.use(function (req: Express.Request, res: Express.Response, next: any) {
  next(createError(404))
})

// error handler
app.use(function (err: any, req: any, res: any, next: any) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get("env") === "development" ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render("error")
})

const worewolfServer = new WoreWolf(io)
const wordwolfServer = new Wordwolf(io)

export default app
