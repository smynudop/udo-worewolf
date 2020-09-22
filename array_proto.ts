export {}

// 拡張メソッドの定義
declare global {
    interface Array<T> {
        lot(): T
    }
}

// 拡張メソッドの実装側
Array.prototype.lot = function () {
    return this[Math.floor(Math.random() * this.length)]
}
