import type * as SocketIO from "socket.io-client"
import { EmitEvent, EmitAllType, RecieveEvent, RecieveAllType } from "../server/game/GameNsManager"

declare const io: typeof SocketIO.io

type EventCallBack<T = any> = (data: T) => void
export default class SocketService {
    socket: SocketIO.Socket
    events: Map<EmitEvent | "disconnect", EventCallBack> = new Map()
    constructor(namespace: string, isLocalhost = false) {
        this.socket = io(namespace, {
            path: isLocalhost ? "/socket.io" : "/worewolf/socket.io",
        })
    }

    on<T extends EmitEvent | "disconnect">(
        e: T,
        callback: EventCallBack<T extends EmitEvent ? EmitAllType[T] : any>
    ) {
        this.events.set(e, callback)
    }

    emit<Ev extends RecieveEvent>(e: Ev, data: Ev extends RecieveEvent ? RecieveAllType[Ev] : any) {
        this.socket.emit(e, data)
    }

    listen() {
        for (const [event, callback] of this.events) {
            this.socket.on("disconnect", (data) => {})
            this.socket.on(event, (data: any) => {
                try {
                    console.log(`recieve event! ${event}`, data)
                    callback(data)
                } catch (e) {
                    console.log(e)
                }
            })
        }
    }
}
