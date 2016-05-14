const restify = require('restify')
const ws = require('ws')
const url = require('url')
const shortid = require('shortid')
const fs = require('fs')

const server = restify.createServer({
	name: 'Get Together',
	version: '1.0.0'
})

const wss = new ws.Server({server: server.server})

server.get('/', function(req, res, next) {
	return res.redirect('/client/index.html', next)
})

server.get('/es6-promise.min.js', restify.serveStatic({
	directory: './node_modules/es6-promise/dist'
}))

server.get('/less.min.js', restify.serveStatic({
	directory: './node_modules/less/dist'
}))

server.get(/\/client\/?.*/, restify.serveStatic({
	directory: './public'
}))

fs.readFile('google-maps-api-key', function(error, key) {
	server.get('/google-maps-api.js', function(req, res, next) {
		var gmapsApi = '//maps.googleapis.com/maps/api/js?key=YOUR_KEY_HERE&callback=mapsLoaded&libraries=places'
		return res.redirect(gmapsApi.replace('YOUR_KEY_HERE', key.toString()), next)
	})
})


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
