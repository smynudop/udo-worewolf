import session from "express-session"
import MongoStore from "connect-mongo"
import { mongoURL } from "./url"

const store = MongoStore.create({ mongoUrl: mongoURL })
export const sessionMiddleWare = session({
  secret: "udo",
  resave: false,
  saveUninitialized: false,
  store,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
  },
})
