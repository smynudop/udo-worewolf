import * as Express from "express"
const router = Express.Router()

import { User } from "../db/instance"
import { IUser } from "../db/schema/user"

router.get("/", function (req, res, next) {
  res.render("login", {})
})

router.post("/", function (req, res, next) {
  const userid = req.body.userid
  const password = req.body.password

  User.find(
    { userid: userid },
    function (err: any, result: IUser[] | undefined) {
      if (err) console.log(err)

      if (result == undefined || result.length == 0) {
        const newUser: IUser = {
          userid,
          password,
          trip: "",
        }
        const user = new User(newUser)

        user.save().catch((e) => console.log(e)) // todo: await

        req.session.userid = userid
        res.redirect("./")
      } else {
        if (password == result[0].password) {
          req.session.userid = userid
          const rd = req.session.rd
          if (rd) {
            req.session.rd = undefined
            res.redirect("./" + rd)
          } else {
            res.redirect("./")
          }
        } else {
          res.render("login", { registerflg: "incorrect" })
        }
      }
    }
  )

  /*処理を書く*/
})

export default router
