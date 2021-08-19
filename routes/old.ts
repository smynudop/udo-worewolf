import * as Express from "express"
export const router = Express.Router()
import { Game } from "../schema"

/* GET home page. */

router.get("/", function (req, res, next) {
    Game.find({ state: "logged" }, function (err:any, result:any) {
        if (err) console.log(err)
        res.render("old", { result: result })
    })
})
