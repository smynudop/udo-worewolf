import SocketIO from "socket.io"
import { Game } from "./game"
import { GameIO } from "./gameIO"

export class GameManager {
  io: SocketIO.Server
  games: number[]
  constructor(io: SocketIO.Server) {
    this.io = io
    this.games = []
    this.listen()
  }

  listen() {
    console.log("listen!")

    const rd = this.io
      .of(/^\/room-\d+$/)
      .on("connect", async (socket: SocketIO.Socket) => {
        const nsp = socket.nsp
        const vno = +nsp.name.match(/\d+/)![0]
        if (this.games.includes(vno)) return false

        this.games.push(vno)

        const result = await GameIO.find(vno)

        if (result) {
          const village = new Game(nsp, result)
          console.log("listen room-" + vno)
        }
      })
  }
}

export default GameManager
