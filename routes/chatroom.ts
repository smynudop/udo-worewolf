import * as Express from "express"
export const router = Express.Router()

router.get("/", function (req, res, next) {
    if (!req.session.userid) {
        req.session.rd = "chatroom"
        res.redirect("login")
    } else {
        res.render("chatroom", { id: req.session.userid })
    }
})
