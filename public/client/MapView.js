function MapView(parentNode, connection, position, callback) {
	this.node = document.createElement('div')

	this.connection = connection

	connection.addEventListener('message', this.gotMessage.bind(this))


	parentNode.appendChild(this.node)

	this.node.style.position = 'absolute'

	;['left', 'right', 'top', 'bottom'].forEach(function(side) {
		this.node.style[side] = '0'
	}, this)

	this.map = new google.maps.Map(this.node, {
		zoom: 8,
		fullscreenControl: false,
		center: {lat: position.coords.latitude, lng: position.coords.longitude}
	})

	this.friendsList = new FriendsList(this.map)

	this.initMarkers()

	this.initControls()

	this.search = new Search(this.map)

	var yourLocationAccuracy

	var self = this
	google.maps.event.addListenerOnce(this.map, 'tilesloaded',function() {
		setTimeout(function() {
			self.yourLocationMarker.setVisible(true)
			self.yourLocationMarker.setAnimation(google.maps.Animation.DROP)
			self.yourAccuracy.setVisible(true)
		}, 1000)
		if(callback)
			callback()
	})

	this.position = position

	this.positionWatcher = navigator.geolocation.watchPosition(function(position) {
		this.position = position
	}.bind(this))
}

MapView.prototype.map = null
MapView.prototype.position = null
MapView.prototype.yourLocationMarker = null

Object.defineProperty(MapView.prototype, 'position', {
	get: function() {
		return this._position
	},
	set: function(position) {
		this._position = position
		var latlng = {lat: position.coords.latitude, lng: position.coords.longitude}
		this.yourLocationMarker.setPosition(latlng)
		this.yourAccuracy.setCenter(latlng)
		this.yourAccuracy.setRadius(position.coords.accuracy)
		try {
			this.send(position.coords)
		} catch (e) {
			console.error(e)
		}
		return this._position
	}
})

MapView.prototype.send = function(input) {
	var message = {}
	for(var key in input)
		message[key] = input[key]
	this.connection.send(JSON.stringify(message))
}

MapView.prototype.gotMessage = function(messageEvent) {
	var payload = JSON.parse(messageEvent.data)
	console.log("Got payload %O", payload)
	if(payload.event == 'update')
		this.friendsList.update(payload)
	if(payload.event == 'leave')
		this.friendsList.remove(payload)
}

MapView.prototype.initMarkers = function() {
	this.yourLocationMarker = new google.maps.Marker({
		map: this.map,
		title: 'You',
		visible: false
	})

	this.yourAccuracy = new google.maps.Circle({
		fillColor: '#5555FF',
		strokeColor: '#5555FF',
		fillOpacity: 0.1,
		strokeOpacity: 0.5,
		map: this.map,
		visible: false
	})
}

MapView.prototype.initControls = function() {
	var button = makeImageButton('icons/Target-32.png')
	button.addEventListener('click', function() {
		this.map.panTo({lat: this.position.coords.latitude, lng: this.position.coords.longitude})
	}.bind(this))

	var container = document.createElement('div')
	container.className = 'map-control-container'
	container.appendChild(button)

	this.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(container)
}
