const WebSocketServer = require('ws').Server
const StaticServer = require('node-static').Server
const url = require('url')
const shortid = require('shortid')
const Cliques = require('./Cliques')

const isTesting = process.argv.slice(2).indexOf('--testing') != -1
const server = createServer(isTesting, serveClientFiles)

const clientFileServer = new StaticServer('./client')
const nodeModuleServer = new StaticServer('./node_modules/')

server.listen(isTesting ? 8080 : 443)

function serveClientFiles(request, response) {
	var path = url.parse(request.url, true).path
	switch (path) {
	case '/':
	case '/index.html':
		response.writeHead(303, {
			Location: `/${shortid.generate()}`,
		})
		response.end()
		return
	case '/es6-promise.min.js':
		return nodeModuleServer.serveFile('es6-promise/dist/es6-promise.min.js', 200, {}, request, response)
	case '/less.min.js':
		return nodeModuleServer.serveFile('less/dist/less.min.js', 200, {}, request, response)
	default:
		if(shortid.isValid(path.slice(1)))
			return clientFileServer.serveFile('index.html', 200, {}, request, response)
		return clientFileServer.serve(request, response)
	}
}

const connections = []
const wss = new WebSocketServer({server: server})
wss.on('connection', function(ws) {
	const path = url.parse(ws.upgradeReq.url, true).pathname.slice(1)
	if(shortid.isValid(path))
		Cliques.get(path).add(ws)
	else {
		console.log("Rejecting request for "+path)
		ws.close()
	}
})

function createServer(isTesting, callback) {
	if(isTesting)
		return require('http').createServer(callback)
	else {
		const LEX = require('letsencrypt-express')
		const lex = LEX.create({
			configDir: '/etc/letsencrypt'
		})
		return require('spdy').createServer(lex.httpsOptions, LEX.createAcmeResponder(lex, callback))
	}
}
