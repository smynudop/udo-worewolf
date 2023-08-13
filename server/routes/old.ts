import * as Express from "express"
const router = Express.Router()
import { Game } from "../db/instance"
import { routerAsyncWrap } from "./async-wrapper"

/* GET home page. */

router.get(
  "/",
  routerAsyncWrap(async (req, res, next) => {
    const result = await Game.find({ state: "logged" })
    res.render("old", { result: result })
  })
)

export default router
