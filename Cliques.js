const cliques = {}
const shortid = require('shortid')
const url = require('url')

function Clique(name) {
	this.name = name
	this.friends = []

	if(cliques[name])
		throw new Error("Trying to create duplicate clique "+name)
	cliques[name] = this
}

Clique.prototype.destroy = function() {
	console.log(`Destroying clique ${this.name}`)
	this.friends.forEach((c) => c.close())
	delete cliques[this.name]
}

Clique.prototype.add = function(ws) {
	const query = url.parse(ws.upgradeReq.url, true).query

	if(!['name', 'latitude', 'longitude'].every((p) => p in query)) {
		console.error(`Dropping invalid join from ${ws.name}`)
		ws.close()
		return
	}

	ws.id = shortid.generate()
	ws.name = query.name
	ws.position = {
		coords: {
			latitude: Number(query.latitude),
			longitude: Number(query.longitude)
		}
	}


	console.log(`${ws.name} (${ws.id}) joined ${this.name}`)

	this.friends.push(ws)

	ws.on('message', (m) => this.onMessage(ws, m))

	ws.on('close', (m) => {
		this.remove(ws)
	})

}

Clique.prototype.onMessage = function(sender, message) {
	var payload = {}
	try {
		payload = JSON.parse(message)
		switch (payload.event) {
			case 'friend-joined':
				payload.friends = this.friends.map(friend => {
					return {
						id: friend.id,
						position: friend.position,
						name: friend.name
					}
				})
				break
			case 'location-updated':
				sender.position = payload.position
				break
			default:
				break
		}
		payload.id = sender.id
		payload.name = sender.name
		this.broadcast(payload)
	} catch (e) {
		console.error(e)
		sender.close()
	}
}

Clique.prototype.remove = function(ws) {
	console.log(`${ws.name} (${ws.id}) left ${this.name}`)

	if(this.friends.indexOf(ws) == -1)
		console.error("Trying to remove a non-member from clique "+this.name)
	else
		this.friends.splice(this.friends.indexOf(ws), 1)

	if(!this.friends.length)
		this.destroy()
	else
		this.broadcast({
			event: 'left',
			id: ws.id,
			name: ws.name
		})
}

Clique.prototype.broadcast = function(message) {
	var json = JSON.stringify(message)
	this.friends.forEach((f) => {
		try {
			f.send(json)
		} catch (e) {
			console.error(`Failed to send message: ${e}`)
		}
	})
}

module.exports.get = function getClique(name) {
	if(!(name in cliques))
		cliques[name] = new Clique(name)

	return cliques[name]
}
