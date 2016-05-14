const restify = require('restify')
const ws = require('ws')
const url = require('url')
const shortid = require('shortid')

const server = restify.createServer({
	name: 'Get Together',
	version: '1.0.0'
})

const wss = new ws.Server({server: server.server})

server.get('/', function(req, res, next) {
	return res.redirect('/client/index.html', next)
})

server.get(/\/client\/?.*/, restify.serveStatic({
	directory: './public'
}))

server.listen(5555, function() {
	console.log("We're live!")
})

const connections = []

wss.on('connection', function(ws) {
	var name

	var id = shortid.generate()

	var query = url.parse(ws.upgradeReq.url, true).query

	if(query.name && query.latitude && query.longitude) {
		name = query.name
		console.log(name+" joined")
		connections.push(ws)
		ws.on('close', function() {
			console.log(name+" left")
			connections.splice(connections.indexOf(ws), 1)
			sendToOthers({
				event: "left",
				id: id
			})
		})
	}
	else {
		console.log("Dropping invalid request")
		ws.close()
	}

	ws.on('message', function(message) {
		var payload = {}
		try {
			payload = JSON.parse(message)
			payload.id = id
			payload.name = name
			sendToOthers(payload)
		} catch (e) {
			console.error(e)
			ws.close()
		}
	})

	function sendToOthers(message) {
		connections
			.filter(function(c) { return c != ws })
			.forEach(function(other) {
				try {
					other.send(JSON.stringify(message))
				} catch (e) {
					console.error("Failed to send to "+name+": "+e)
				}
			})
	}
})
