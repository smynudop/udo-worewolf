import SocketIO from "socket.io"

export class PlayerSocket {
    socket: SocketIO.Socket | null
    rooms: Set<string>
    constructor(socket: SocketIO.Socket | null) {
        this.socket = socket ?? null
        this.rooms = new Set()
    }

    emit(type: string, data?: any) {
        this.socket?.emit(type, data)
    }

    join(name: string) {
        this.socket?.join(name)
        this.rooms.add(name)
    }

    leave(name: string) {
        this.socket?.leave(name)
        this.rooms.delete(name)
    }

    leaveAll() {
        for (var room of this.rooms) {
            this.leave(room)
        }
    }

    updateSocket(socket: SocketIO.Socket) {
        this.socket = socket
        for (var room of this.rooms) {
            this.join(room)
        }
    }
}
