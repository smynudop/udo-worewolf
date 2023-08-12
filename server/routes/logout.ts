import * as Express from "express"
const router = Express.Router()

router.get("/", function (req, res, next) {
  delete req.session.userid
  res.redirect("./")
})

export default router
