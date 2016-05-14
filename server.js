const express = require('express')
const url = require('url')
const shortid = require('shortid')
const fs = require('fs')

var app = express()

require('express-ws')(app)

app.get('/', function(req, res, next) {
	return res.redirect(301, '/client/index.html')
})

app.get('/es6-promise.min.js', express.static('./node_modules/es6-promise/dist'))

app.get('/less.min.js', express.static('./node_modules/less/dist'))

app.get(/\/client\/?.*/, express.static('./public'))

fs.readFile('google-maps-api-key', function(error, key) {
	key = key.toString()

	app.get('/google-maps-api.js', function(req, res) {
		var url = '//maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=mapsLoaded&libraries=places'
		return res.redirect(302, encodeURI(url.replace('YOUR_API_KEY', key)))
	})
})

app.listen(5555, function() {
	console.log("We're live!")
})


const connections = []

app.ws('/', function(ws, req) {
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
