// 拡張メソッドの定義
declare global {
  interface Array<T> {
    /** 配列の中からランダムに1つ選んで返します。 **/
    lot(): T
    /** 配列をシャッフルします。破壊的なメソッドです。 */
    shuffle(): void
  }
}

const setArrayExtension = () => {
  // 拡張メソッドの実装側
  Array.prototype.lot = function () {
    return this[Math.floor(Math.random() * this.length)]
  }

  Array.prototype.shuffle = function () {
    for (let i = this.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1))
      ;[this[i], this[j]] = [this[j], this[i]]
    }
  }
}

export default setArrayExtension
