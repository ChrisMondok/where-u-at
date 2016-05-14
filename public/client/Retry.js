function Retry(fn) {
	this.fn = fn
	this.reset()
	this._timeout = null
}

Retry.prototype.maxTries = 10
Retry.prototype.backoff = 1000

Retry.prototype.reset = function() {
	this.tries = 0
	if(this._timeout)
		clearTimeout(this._timeout)
}

Retry.prototype.start = function() {
	this.reset()

	var self = this
	return new Promise(function(resolve, reject) {
		tryOnce()

		function tryOnce() {
			self.tries++

			self.fn().then(function() {
				resolve.apply(this, arguments)
				self.reset()
				return
			}, function(e) {
				var n = self.backoff * Math.pow(2, self.tries)
				if(self.tries >= self.maxTries) {
					self.reset()
					reject()
					return
				}
				else
					setTimeout(tryOnce,  n)
			})
		}
	})
}

Retry.prototype.tryOnce = function() {
	var self = this

	this.tries++

	return new Promise(function(resolve, reject) {
		self._timeout = setTimeout(function() {
			self.fn().then(resolve, reject)
		}, self.delay)
	})
}

function failSometimes() {
	return new Promise(function(resolve, reject) {
		var x = Math.random()
		if(x > 0.8)
			resolve(x)
		else
			reject(x)
	})
}
