import * as Express from "express"
export const router = Express.Router()

var tripcode = require("tripcode")

import { User } from "../schema"

router.use("/", async function (req, res, next) {
    if (!req.session.userid) {
        req.session.rd = "mypage"
        res.redirect("login")
    } else {
        let user = await User.findOne({ userid: req.session.userid }).exec()
        req.user = user
        next()
    }
})

/* GET users listing. */
router.get("/", async function (req, res, next) {
    res.render("mypage", { userid: req.user.userid, trip: req.user.trip })
})

router.post("/set_trip", function (req, res, next) {
    let trip = "◆" + tripcode(req.body.key)
    User.update({ userid: req.session.userid }, { $set: { trip: trip } }, function (err) {
        if (err) console.log(err)
        res.redirect("/mypage?mes=success_set_trip")
    })
})

router.post("/change_password", function (req, res, next) {
    let new1 = req.body.new
    let new2 = req.body.new2

    if (req.user.password != req.body.now || !/^\w+$/.test(new1) || new1 != new2) {
        return res.redirect("/mypage?mes=failed_change_password")
    }

    User.update({ userid: req.session.userid }, { $set: { password: new1 } }, function (err) {
        if (err) console.log(err)
        res.redirect("/mypage?mes=success_change_password")
    })
})
