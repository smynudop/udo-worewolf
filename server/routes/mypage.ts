import * as Express from "express"
const router = Express.Router()

import tripcode from "tripcode"

import { User } from "../schema"

router.use("/", async function (req, res, next) {
  if (!req.session.userid) {
    req.session.rd = "mypage"
    res.redirect("./login")
  } else {
    const user = await User.findOne({ userid: req.session.userid }).exec()
    req.user = user
    next()
  }
})

/* GET users listing. */
router.get("/", async function (req, res, next) {
  res.render("mypage", { userid: req.user.userid, trip: req.user.trip })
})

router.post("/set_trip", function (req, res, next) {
  const trip = "◆" + tripcode(req.body.key)
  User.updateOne(
    { userid: req.session.userid },
    { $set: { trip: trip } },
    undefined,
    function (err: any) {
      if (err) console.log(err)
      res.redirect("/?mes=success_set_trip")
    }
  )
})

router.post("/change_password", function (req, res, next) {
  const new1 = req.body.new
  const new2 = req.body.new2

  if (
    req.user.password != req.body.now ||
    !/^\w+$/.test(new1) ||
    new1 != new2
  ) {
    return res.redirect("/?mes=failed_change_password")
  }

  User.updateOne(
    { userid: req.session.userid },
    { $set: { password: new1 } },
    undefined,
    function (err: any) {
      if (err) console.log(err)
      res.redirect("/?mes=success_change_password")
    }
  )
})

export default router
