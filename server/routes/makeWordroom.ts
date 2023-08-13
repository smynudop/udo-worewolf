import * as Express from "express"
const router = Express.Router()

import { Wordwolf as Game } from "../db/instance"
import { IWordWolfTime } from "../db/schema/wordwolf"

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
    const userid = req.session.userid
    let name = req.body.name
    let pr = req.body.pr
    const time = {} as IWordWolfTime

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

    for (const t of ["setWord", "discuss", "counter"] as const) {
      if (!req.body[t] || req.body[t] - 0 > 600) {
        res.render("makeWordroom", { userid: userid, error: "時間が不正です" })
        return false
      } else {
        time[t] = req.body[t] - 0
      }
    }

    Game.find({}, {}, { sort: { vno: -1 }, limit: 1 }).then((data) => {
      const vno = data.length > 0 ? data[0].vno : 1
      const game = new Game()
      game.vno = vno
      game.name = name
      game.pr = pr
      game.GMid = userid
      game.time = time
      game.state = "recruit"

      game.save()
      res.redirect("./wordwolf")
    })
  }
})

export default router
