const WebSocketServer = require('ws').Server
const StaticServer = require('node-static').Server
const url = require('url')
const shortid = require('shortid')

const fs = require('fs')


const testing = process.argv.slice(2).indexOf('--testing') != -1
const server = createServer(testing, serveClientFiles)

server.listen(testing ? 8080 : 443)

const clientFileServer = new StaticServer('./client')
const nodeModuleServer = new StaticServer('./node_modules/')

function serveClientFiles(request, response) {
	var path = url.parse(request.url, true).path
	switch (path) {
	case '/es6-promise.min.js':
		return nodeModuleServer.serveFile('es6-promise/dist/es6-promise.min.js', 200, {}, request, response)
	case '/less.min.js':
		return nodeModuleServer.serveFile('less/dist/less.min.js', 200, {}, request, response)
	default:
		return clientFileServer.serve(request, response)
	}
}

const connections = []
const wss = new WebSocketServer({server: server})
wss.on('connection', function(ws) {
	var name
	const id = shortid.generate()

	const query = url.parse(ws.upgradeReq.url, true).query

	if(query.name && query.latitude && query.longitude) {
		name = query.name
		console.log(name+" joined")
		connections.push(ws)
		ws.on('close', function() {
			console.log(name+" left")
			connections.splice(connections.indexOf(ws), 1)
			sendToOthers({
				event: "left",
				id: id,
				name: name
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

function createServer(testing, callback) {
	if(testing)
		return require('http').createServer(callback)
	else {
		const LEX = require('letsencrypt-express')
		const lex = LEX.create({
			configDir: '/etc/letsencrypt'
		})
		return require('spdy').createServer(lex.httpsOptions, LEX.createAcmeResponder(lex, callback))
	}
}
