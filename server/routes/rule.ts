import * as Express from "express"
const router = Express.Router()

/* GET home page. */
router.get("/rule", function (req, res, next) {
    res.render("rule")
})

router.get("/usage", function (req, res, next) {
    res.render("usage")
})

router.get("/prohibited", function (req, res, next) {
    res.render("prohibited")
})

router.get("/cast", function (req, res, next) {
    res.render("cast")
})

export default router
