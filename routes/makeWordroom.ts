import * as Express from "express"
const router = Express.Router()

import { Wordwolf as Game } from "../schema"

/* GET users listing. */
router.get("/", function (req, res, next) {
    if (!req.session.userid) {
        req.session.rd = "makeWordroom"
        res.redirect("./login")
    } else {
        res.render("makeWordroom", { userid: req.session.userid })
    }
})

router.post("/", function (req, res, next) {
    if (!req.session.userid) {
        req.session.rd = "makeWordroom"
        res.redirect("./login")
    } else {
        var userid = req.session.userid
        var vno = 1
        var name = req.body.name
        var pr = req.body.pr
        var time: Record<string, number> = {}

        if (!name || name.length >= 24 || name.length == 0) {
            res.render("makeWordroom", {
                userid: userid,
                error: "村名は24文字以内で入力してください",
            })
            return false
        } else {
            name += "村"
        }

        if (pr && pr.length > 30) {
            pr = pr.slice(0, 30)
        } else if (!pr || pr == "") {
            pr = "PR文が設定されていません"
        }

        for (var t of ["setWord", "discuss", "counter"]) {
            if (!req.body[t] || req.body[t] - 0 > 600) {
                res.render("makeWordroom", { userid: userid, error: "時間が不正です" })
                return false
            } else {
                time[t] = req.body[t] - 0
            }
        }

        Game.find({}, {}, { sort: { vno: -1 }, limit: 1 }, function (err: any, data: any) {
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
            game.GMid = userid
            game.time = time
            game.state = "recruit"

            game.save(function (err: any) {
                if (err) console.log(err)
                res.redirect("./wordwolf")
            })
        })
    }
})

export default router