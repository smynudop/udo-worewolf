import * as Express from "express"
export const router = Express.Router()

/* GET home page. */
router.get("/", function (req, res, next) {
    res.render("cast")
})
