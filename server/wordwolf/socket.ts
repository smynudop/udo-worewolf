import SocketIO from "socket.io"

class SocketLike {
    id: string
    rooms: any
    constructor() {
        this.id = "this is not socket"
        this.rooms = {}
    }
    emit() {
        return false
    }
    join() {
        return false
    }
    leave() {
        return false
    }
}

export class PlayerSocket {
    socket: any
    rooms: Set<string>
    constructor(socket: SocketIO.Socket | null) {
        this.socket = socket || new SocketLike()
        this.rooms = new Set()
    }

    emit(type: string, data?: any) {
        this.socket.emit(type, data)
    }

    join(name: string) {
        this.socket.join(name)
        this.rooms.add(name)
    }

    leave(name: string) {
        this.socket.leave(name)
        this.rooms.delete(name)
    }

    leaveAll() {
        for (const room of this.rooms) {
            this.leave(room)
        }
    }

    updateSocket(socket: SocketIO.Socket) {
        this.socket = socket
        for (const room of this.rooms) {
            this.join(room)
        }
    }
}
