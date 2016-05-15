const LEX = require('letsencrypt-express')
const WebSocketServer = require('ws').Server
const https = require('spdy')
const StaticServer = require('node-static').Server

const url = require('url')
const shortid = require('shortid')

const fs = require('fs')

const lex = LEX.create({
	configDir: '/etc/letsencrypt'
})

const server = https.createServer(lex.httpsOptions, LEX.createAcmeResponder(lex, onRequest))

const wss = new WebSocketServer({server: server})

const clientFileServer = new StaticServer('./client')
const nodeModuleServer = new StaticServer('./node_modules/')

function onRequest(request, response) {
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

server.listen(443)
