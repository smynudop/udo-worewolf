const fs = require("fs")
const ejs = require("ejs")

const schema = require("../schema")
const GameSchema = schema.Game
const User = schema.User

export class GameIO {
    static writeHTML(log, player, vinfo) {
        ejs.renderFile(
            "./views/worewolf_html.ejs",
            {
                logs: log,
                players: player,
                vinfo: vinfo,
            },
            function (err, html) {
                if (err) console.log(err)
                html = html.replace(/\n{3,}/, "\n")
                fs.writeFile("./public/log/" + vinfo.no + ".html", html, "utf8", function (err) {
                    console.log(err)
                })
            }
        )
    }

    static update(vno, data) {
        GameSchema.updateOne({ vno: vno }, { $set: data }, (err) => {
            if (err) console.log(err)
        })
    }

    static find(vno) {
        return GameSchema.findOne({ vno: vno }).exec()
    }
}
