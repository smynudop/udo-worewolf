import { IVillageSetting } from "./VillageSetting"
import { eachLog } from "./log"
import { Player } from "./player"

import fs from "fs"
import ejs from "ejs"

import { Game, User } from "../db/instance"

export class GameIO {
  static writeHTML(log: eachLog[], player: Player[], vinfo: IVillageSetting) {
    ejs.renderFile(
      "./views/worewolf_html.ejs",
      {
        logs: log,
        players: player,
        vinfo: vinfo,
      },
      function (err: Error | null, html: string) {
        if (err) console.log(err)
        html = html.replace(/\n{3,}/, "\n")
        fs.writeFile(
          "./public/log/" + vinfo.vno + ".html",
          html,
          "utf8",
          function (err: any) {
            console.log(err)
          }
        )
      }
    )
  }

  static update(vno: number, data: Partial<IVillageSetting>) {
    Game.updateOne({ vno: vno }, { $set: data }, (err: any) => {
      if (err) console.log(err)
    })
  }

  static async find(vno: number) {
    return await Game.findOne({ vno: vno })
  }
}
