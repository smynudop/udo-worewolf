import * as Express from "express"
import { Game } from "../db/instance"
import { routerAsyncWrap } from "./async-wrapper"

const router = Express.Router()

/* GET home page. */

router.get(
  "/",
  routerAsyncWrap(async (req, res, next) => {
    if (!req.session.userid) {
      req.session.rd = "worewolf"
      res.redirect("./login")
    } else {
      const result = await Game.find({ state: { $ne: "logged" } })
      res.render("worewolf_lobby", {
        result: result,
        userid: req.session.userid,
      })
    }
  })
)

router.get(
  "/:vno",
  routerAsyncWrap(async (req, res, next) => {
    if (!req.session.userid) {
      req.session.rd = "worewolf"
      res.redirect("./login")
    } else {
      const vno = +req.params.vno!
      const result = await Game.findOne({ vno: vno })
      if (!result) {
        res.redirect("./")
        return
      }

      if (result.state == "logged") {
        res.redirect("./log/" + vno + ".html")
      } else {
        res.render("worewolf", { id: req.session.userid, vno: vno })
      }
    }
  })
)

export default router
