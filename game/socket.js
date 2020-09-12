class SocketLike {
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

class PlayerSocket {
    constructor(socket) {
        this.socket = socket || new SocketLike()
        this.rooms = new Set()
    }

    emit(type, data) {
        this.socket.emit(type, data)
    }

    join(name) {
        this.socket.join(name)
        this.rooms.add(name)
    }

    leave(name) {
        this.socket.leave(name)
        this.rooms.delete(name)
    }

    leaveAll() {
        for (var room of this.rooms) {
            this.leave(room)
        }
    }

    updateSocket(socket) {
        this.socket = socket
        for (var room of this.rooms) {
            this.join(room)
        }
    }
}

module.exports = PlayerSocket
