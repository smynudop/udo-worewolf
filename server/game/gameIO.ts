import { IGame } from "../db/schema/game"
import { EachLog } from "./log"
import { Player } from "./player"

import { promises as fs } from "fs"
import ejs from "ejs"

import { Game, User } from "../db/instance"

export type ILogData = {
    log: EachLog[]
    player: Player[]
    vinfo: IGame
}

export class GameIO {
    static async renderEjsAsnyc(data: ILogData): Promise<string> {
        return await new Promise<string>((resolve, reject) => {
            ejs.renderFile("./views/worewolf_html.ejs", data, (err: Error | null, html: string) => {
                if (err) reject(err)
                resolve(html.replace(/\n{3,}/, "\n"))
            })
        })
    }
    static async writeHTML(data: ILogData) {
        const html = await GameIO.renderEjsAsnyc(data)
        await fs.writeFile("./public/log/" + data.vinfo.vno + ".html", html)
    }

    static async update(vno: number, data: Partial<IGame>) {
        await Game.updateOne({ vno: vno }, { $set: data })
    }

    static async find(vno: number) {
        return await Game.findOne({ vno: vno })
    }
}
