"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const game_1 = require("./game");
const gameIO_1 = require("./gameIO");
class GameManager {
    constructor(io) {
        this.io = io;
        this.games = [];
        this.listen();
    }
    listen() {
        console.log("listen!");
        var mgr = this;
        var rd = this.io.of(/^\/room-\d+$/).on("connect", async function (socket) {
            var nsp = socket.nsp;
            var vno = nsp.name.match(/\d+/)[0] - 0;
            if (mgr.games.includes(vno))
                return false;
            mgr.games.push(vno);
            var result = await gameIO_1.GameIO.find(vno);
            if (result) {
                var village = new game_1.Game(nsp, result);
                console.log("listen room-" + vno);
            }
        });
    }
}
exports.GameManager = GameManager;
module.exports = GameManager;
//# sourceMappingURL=worewolf.js.map