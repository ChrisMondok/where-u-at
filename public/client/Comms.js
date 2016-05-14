function Comms() {
	this.connection = null
	this.outgoing = []
	this.incoming = []
	this.listeners = []
}

Comms.prototype.connect = function(name, position) {
	var url = 'ws://'+location.host+'?'+toQueryString({
		name: name,
		latitude: position.coords.latitude,
		longitude: position.coords.longitude
	})

	var ws = this.connection = new WebSocket(url)

	var self = this
	return new Promise(function(resolve, reject) {
		ws.addEventListener('open', function() {
			self.flush()
			resolve()
		})

		ws.addEventListener('error', function(e) {
			console.log("WS Error: %O", e)
			try { ws.close() } catch (error) {} //whatever
			this.connection = null
			reject(e)
		}.bind(this))

		ws.addEventListener('close', function() {
			console.log("Connection closed")
			this.connection = null
		}.bind(this))

		ws.addEventListener('message', function(event) {
			var message

			try {
				message = JSON.parse(event.data)
			} catch (e) {
				console.log("uh-oh")
			}

			if(message) {
				this.incoming.push(message)
				this.listeners.forEach(function(l) { l() })
			}

		}.bind(this))
	}.bind(this))
}

Comms.prototype.addListener = function(listener) {
	this.listeners.push(listener)
}

Comms.prototype.removeListener = function(listener) {
	this.listeners.remove(listener)
}

Comms.prototype.peek = function() {
	return this.incoming[0]
}

Comms.prototype.read = function() {
	return this.incoming.shift()
}

Comms.prototype.send = function(message) {
	this.outgoing.push(message)
	this.flush()
}

Comms.prototype.deepCopy = function(input) {
	var output = {}

	if(input instanceof Array)
		throw new Exception("Arrays aren't implemented yet.")

	for(var key in input) {
		if(input[key] instanceof Object)
			output[key] = this.deepCopy(input[key])
		else
			output[key] = input[key]
	}

	return output
}

Comms.prototype.flush = function() {
	try {
		while(this.connection && this.outgoing[0]) {
			this.connection.send(JSON.stringify(this.deepCopy(this.outgoing[0])))
			this.outgoing.shift()
		}
	} catch (e) {
		console.error("Failed to send message: %O", e)
	}
}
