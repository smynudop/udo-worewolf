import * as Express from "express"
export const router = Express.Router()

import { User } from "../schema"

router.get("/", function (req, res, next) {
    res.render("login", {})
})

router.post("/", function (req, res, next) {
    var userid = req.body.userid
    var password = req.body.password

    User.find({ userid: userid }, function (err, result) {
        if (err) console.log(err)

        if (result.length == 0) {
            var user = new User()

            user.userid = userid
            user.password = password

            user.save(function (err) {
                if (err) console.log(err)
                req.session.userid = userid
                res.redirect("/")
            })
        } else {
            if (password == result[0].password) {
                req.session.userid = userid
                var rd = req.session.rd
                if (rd) {
                    delete req.session.rd
                    res.redirect("/" + rd)
                } else {
                    res.redirect("/")
                }
            } else {
                res.render("login", { registerflg: "incorrect" })
            }
        }
    })

    /*処理を書く*/
})
