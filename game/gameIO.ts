import { IVillageSetting } from "./VillageSetting"
import {eachLog} from "./log"
import {Player} from "./player"

const fs = require("fs")
const ejs = require("ejs")

const schema = require("../schema")
const GameSchema = schema.Game
const User = schema.User

export class GameIO {
    static writeHTML(log:eachLog[], player:Player[], vinfo:IVillageSetting) {
        ejs.renderFile(
            "./views/worewolf_html.ejs",
            {
                logs: log,
                players: player,
                vinfo: vinfo,
            },
            function (err:number, html:string) {
                if (err) console.log(err)
                html = html.replace(/\n{3,}/, "\n")
                fs.writeFile("./public/log/" + vinfo.vno + ".html", html, "utf8", function (err:any) {
                    console.log(err)
                })
            }
        )
    }

    static update(vno:number, data:Partial<IVillageSetting>) {
        GameSchema.updateOne({ vno: vno }, { $set: data }, (err:any) => {
            if (err) console.log(err)
        })
    }

    static find(vno:number) {
        return GameSchema.findOne({ vno: vno }).exec()
    }
}
