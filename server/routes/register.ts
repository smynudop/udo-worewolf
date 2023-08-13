import * as Express from "express"

import { User } from "../db/instance"
import { IUser } from "../db/schema/user"
import { routerAsyncWrap } from "./async-wrapper"
/* GET home page. */

const router = Express.Router()

router.get("/", function (req, res, next) {
  res.render("register")
})

router.post(
  "/",
  routerAsyncWrap(async (req, res, next) => {
    const userid = req.body.userid.trim()
    const password = req.body.password.trim()

    if (!/^[^\d\s]\S+$/.test(userid)) {
      res.render("register", { error: "IDが不正です" })
      return false
    }

    if (!/^\w+$/.test(password)) {
      res.render("register", { error: "パスワードが不正です" })
      return false
    }

    const result = await User.find({ userid: userid })

    if (result.length == 0) {
      const newUser: IUser = {
        userid,
        password,
        trip: "",
      }
      const user = new User(newUser)
      await user.save()
      res.redirect("../")
    } else {
      res.render("register", { error: "このIDは既に使われています" })
    }
  })
)

export default router
