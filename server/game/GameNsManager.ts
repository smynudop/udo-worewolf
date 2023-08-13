import { Socket, Namespace } from "socket.io"
import {
    IAbilityData,
    IPlayerForClient,
    IPlayerforPlayer,
    IUpdatePlayerData,
    IVoteData,
} from "./player"
import { eachLog } from "./log"
import { IChangePhaseInfo } from "./game"
import { ITalkData } from "./player"
import { IGame } from "../db/schema/game"

type EmitAllType = {
    player: IPlayerForClient[]
    changePhase: IChangePhaseInfo
    initialLog: eachLog[]
    talk: eachLog
    useAbilitySuccess: boolean
    refresh: boolean
    you: IPlayerForClient
    enterSuccess: IPlayerforPlayer
    voteSuccess: boolean
    banTalk: boolean
    leaveSuccess: boolean
}
type EmitEvent = keyof EmitAllType

type RecieveAllType = {
    connect: null
    enter: any
    leave: null
    fixPlayer: IUpdatePlayerData
    talk: ITalkData
    vote: IVoteData
    ability: IAbilityData
    rollcall: null
    start: null
    summonNPC: null
    checkCast: null
    kick: { target: number }
    fixVillage: IGame
}
type RecieveEvent = keyof RecieveAllType

type EventCallback<T = any> = (userid: string, data: T, manager: GameNsManager) => void

export class GameNsManager {
    io: Namespace
    events: Map<string, EventCallback> = new Map()
    sockets: Map<string, Socket> = new Map()
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

    /**
     * イベントを個人のみに送信します。
     * @param event
     * @param arg
     * @param id
     */
    emitByUserId<T extends EmitEvent>(event: T, arg: EmitAllType[T], userid: string) {
        const socket = this.sockets.get(userid)
        if (socket != null) {
            socket.send(event, arg)
        } else {
            console.warn("socket is undefined.")
        }
    }

    on<T extends RecieveEvent>(event: T, callback: EventCallback<RecieveAllType[T]>) {
        this.events.set(event, callback)
    }

    dispatch<T extends RecieveEvent>(event: T, userid: string, data: RecieveAllType[T]) {
        const callback = this.events.get(event)
        if (callback != null) {
            callback(userid, data, this)
        }
    }

    listen(func: (Socket: Socket) => void) {
        this.io.on("connection", func)
    }

    listen2() {
        this.io.on("connection", (socket) => {
            // @ts-ignore
            const userid = socket.request?.session?.userid as string | undefined

            if (userid == undefined) {
                return
            }
            this.sockets.set(userid, socket)

            this.dispatch("connect", userid, null)

            for (const [event, callback] of this.events) {
                socket.on(event, (data) => {
                    try {
                        callback(userid, data, this)
                    } catch (e) {
                        console.log(e)
                    }
                })
            }
        })
    }

    assignRoom() {}
}
