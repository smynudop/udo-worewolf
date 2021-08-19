import * as Express from "express"
export const router = Express.Router()

router.get("/", function (req, res, next) {
    delete req.session.userid
    res.redirect("./")
})
