export class PlayerSocket {
    rooms: Set<string>
    constructor() {
        this.rooms = new Set()
    }

    join(name: string) {
        this.rooms.add(name)
    }

    leave(name: string) {
        this.rooms.delete(name)
    }

    leaveAll() {
        this.rooms = new Set<string>()
    }
}
