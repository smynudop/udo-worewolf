import { Game } from "./game"
import { GameIO } from "./gameIO"

export class GameManager {
    io: any
    games: number[]
    constructor(io) {
        this.io = io
        this.games = []
        this.listen()
    }

    listen() {
        console.log("listen!")
        var mgr = this

        var rd = this.io.of(/^\/room-\d+$/).on("connect", async function (socket) {
            var nsp = socket.nsp
            var vno = nsp.name.match(/\d+/)[0] - 0
            if (mgr.games.includes(vno)) return false

            mgr.games.push(vno)

            var result = await GameIO.find(vno)

            if (result) {
                var village = new Game(nsp, result)
                console.log("listen room-" + vno)
            }
        })
    }
}

module.exports = GameManager
