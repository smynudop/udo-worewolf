import * as Express from "express"
export const router = Express.Router()

/* GET home page. */
router.get("/", function (req, res, next) {
    if (req.session.userid) {
        res.render("index", { userid: req.session.userid, islogin: true })
    } else {
        res.render("index", { islogin: false })
    }
})
