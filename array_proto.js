var array_proto = function(){

	Array.prototype.lot = function(){
		return this[Math.floor(Math.random() * this.length)]
	}

	Array.prototype.remove = function(val){
		if(this.includes(val)){
			var i = this.indexOf(val)
			return [...this.slice(0,i), ...this.slice(i+1)]
		} else {
			return this
		}
	}
}

module.exports = array_proto
