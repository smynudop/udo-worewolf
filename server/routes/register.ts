import * as Express from "express"
const router = Express.Router()

import { User } from "../schema"
/* GET home page. */

router.get("/", function (req, res, next) {
  res.render("register")
})

router.post("/", function (req, res, next) {
  var userid = req.body.userid.trim()
  var password = req.body.password.trim()

  if (!/^[^\d\s]\S+$/.test(userid)) {
    res.render("register", { error: "IDが不正です" })
    return false
  }

  if (!/^\w+$/.test(password)) {
    res.render("register", { error: "パスワードが不正です" })
    return false
  }

  User.find({ userid: userid }, function (err: any, result: any) {
    if (err) console.log(err)

    if (result.length == 0) {
      var user = new User()

      user.userid = userid
      user.password = password

      user.save(function (err: any) {
        if (err) console.log(err)
        req.session.userid = userid
        res.redirect("../")
      })
    } else {
      res.render("register", { error: "このIDは既に使われています" })
    }
  })

  /*処理を書く*/
})

export default router
