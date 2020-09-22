"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 拡張メソッドの実装側
Array.prototype.lot = function () {
    return this[Math.floor(Math.random() * this.length)];
};
//# sourceMappingURL=array_proto.js.map