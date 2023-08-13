import * as Express from "express"
const router = Express.Router()

import { User } from "../db/instance"
import { IUser } from "../db/schema/user"
import { routerAsyncWrap } from "./async-wrapper"

router.get("/", function (req, res, next) {
    res.render("login", {})
})

router.post(
    "/",
    routerAsyncWrap(
        async (req, res, next) => {
            const userid = req.body.userid
            const password = req.body.password

            const result = await User.find({ userid: userid })

            console.log(result)

            if (result == undefined || result.length == 0) {
                console.log(`newUser!`)
                const newUser: IUser = {
                    userid,
                    password,
                    trip: "",
                }
                const user = new User(newUser)

                await user.save()

                req.session.userid = userid
                res.redirect("./")
            } else {
                console.log(`login!`)
                if (password == result[0].password) {
                    req.session.userid = userid
                    const rd = req.session.rd
                    if (rd) {
                        req.session.rd = undefined
                        res.redirect("./" + rd)
                    } else {
                        res.redirect("./")
                    }
                } else {
                    res.render("login", { registerflg: "incorrect" })
                }
            }
        }

        /*処理を書く*/
    )
)

export default router
