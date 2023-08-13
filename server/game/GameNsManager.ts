import { Socket, Namespace } from "socket.io"
import { IPlayerForClient } from "./player"
import { eachLog } from "./log"
import { IChangePhaseInfo } from "./game"

type EmitAllType = {
    player: IPlayerForClient[]
    changePhase: IChangePhaseInfo
    initialLog: eachLog[]
    talk: eachLog
    useAbilitySuccess: boolean
    refresh: boolean
}
type EmitEvent = keyof EmitAllType

export class GameNsManager {
    io: Namespace
    constructor(io: Namespace) {
        this.io = io
    }

    emit<T extends EmitEvent>(event: T, arg: EmitAllType[T]) {
        this.io.emit(event, arg)
    }

    emitPlayer<T extends EmitEvent>(event: T, arg: EmitAllType[T]) {
        this.io.to(["gm", "all"]).emit(event, arg)
    }

    emitRoom<T extends EmitEvent>(event: T, arg: EmitAllType[T], room: string) {
        const rooms = ["gm", "all", room]
        this.io.to(rooms).emit(event, arg)
    }

    emitPersonal<T extends EmitEvent>(event: T, arg: EmitAllType[T], id: number) {
        const rooms = ["gm", "all", "player-" + id]
        this.io.to(rooms).emit(event, arg)
    }

    listen(func: (Socket: Socket) => void) {
        this.io.on("connection", func)
    }
}
