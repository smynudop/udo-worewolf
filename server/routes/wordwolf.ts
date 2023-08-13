import * as Express from "express"
const router = Express.Router()
import { Wordwolf as Game } from "../db/instance"
import { routerAsyncWrap } from "./async-wrapper"

/* GET home page. */

router.get(
    "/",
    routerAsyncWrap(async (req, res, next) => {
        if (!req.session.userid) {
            req.session.rd = "wordwolf"
            res.redirect("./login")
        } else {
            const result = await Game.find({ state: { $ne: "logged" } })
            res.render("wordwolf_lobby", {
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
            req.session.rd = "wordwolf"
            res.redirect("./login")
        } else {
            const vno = +req.params.vno!
            const result = await Game.findOne({ vno: vno })
            if (!result) {
                res.redirect("./")
                return
            }

            if (result.state == "logged") {
                res.redirect("./log_word/" + vno + ".html")
            } else {
                res.render("wordwolf", { id: req.session.userid, vno: vno })
            }
        }
    })
)

export default router
