import * as Express from "express"
export const router = Express.Router()

import { Game } from "../schema"

/* GET users listing. */
router.get("/", function (req, res, next) {
    if (!req.session.userid) {
        req.session.rd = "makeroom"
        res.redirect("login")
    } else {
        res.render("makeroom", { userid: req.session.userid })
    }
})

router.post("/", function (req, res, next) {
    if (!req.session.userid) {
        req.session.rd = "makeroom"
        res.redirect("login")
    } else {
        var userid = req.session.userid
        var vno
        var name = req.body.name
        var pr = req.body.pr
        var casttype = req.body.casttype
        var capacity = req.body.capacity
        var kariGM = req.body.kariGM == "1"
        var time = {}

        if (!name || name.length >= 24 || name.length == 0) {
            res.render("makeroom", { userid: userid, error: "村名は24文字以内で入力してください" })
            return false
        } else {
            name += "村"
        }

        if (pr && pr.length > 30) {
            pr = pr.slice(0, 30)
        } else if (!pr || pr == "") {
            pr = "PR文が設定されていません"
        }

        if (!casttype || ["Y"].includes(casttype)) {
            casttype = "Y"
        }

        if (capacity > 20) {
            capacity = 20
        }

        for (var t of ["day", "vote", "night", "ability", "nsec"]) {
            if (!req.body[t] || req.body[t] - 0 > 600) {
                res.render("makeroom", { userid: userid, error: "時間が不正です" })
                return false
            } else {
                time[t] = req.body[t] - 0
            }
        }

        Game.find({}, {}, { sort: { vno: -1 }, limit: 1 }, function (err, data) {
            if (err) console.log(err)
            if (data.length == 0) {
                vno = 1
            } else {
                vno = data[0].vno + 1
            }
        }).then(() => {
            var game = new Game()
            game.vno = vno
            game.name = name
            game.pr = pr
            game.casttype = casttype
            game.GMid = userid
            game.time = time
            game.capacity = capacity
            game.state = "recruit"
            game.kariGM = kariGM

            game.save(function (err) {
                if (err) console.log(err)
                res.redirect("/worewolf")
            })
        })
    }
})
