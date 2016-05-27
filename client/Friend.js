function Friend(map, info) {
	this.id = info.id
	this.map = map
	this.hiding = false
	this.color = 'white'

	this.initMarkers()

	this.update(info)

	this.marker.setAnimation(google.maps.Animation.DROP)

}

Friend.prototype.initMarkers = function() {
	this.foregroundPin = makePin('white', 1.0)
	this.backgroundPin = makePin('white', 0.5)

	this.marker = new google.maps.Marker({
		map: this.map,
		icon: this.foregroundPin
	})

	this.marker.addListener('click',this.clicked.bind(this))

	this.infoWindow = new google.maps.InfoWindow()

	this.accuracyCircle = new google.maps.Circle({
		fillColor: '#5555FF',
		strokeColor: '#5555FF',
		fillOpacity: 0.1,
		strokeOpacity: 0.5,
		map: this.map,
		visible: false
	})

	this.infoWindow.addListener('closeclick', function() {
		this.accuracyCircle.setVisible(false)
	}.bind(this))
}

Friend.prototype.clicked = function() {
		var visible = this.accuracyCircle.visible
		this.toggleInfoWindow(visible)
		this.accuracyCircle.setVisible(!visible)
}

Friend.prototype.toggleInfoWindow = function(visible) {
	if(visible)
		this.infoWindow.close(this.map, this.marker)
	else
		this.infoWindow.open(this.map, this.marker)
}

Friend.prototype.destroy = function() {
	this.marker.setMap(null)
	this.infoWindow.setMap(null)
	this.accuracyCircle.setMap(null)
}

Object.defineProperty(Friend.prototype, 'name', {
	get: function() {
		return this._name
	},
	set: function(name) {
		this._name = name
		this.marker.setTitle(name)
		this.infoWindow.setContent(name)
		return this._name
	}
})

Friend.prototype.update = function(info) {
	if(info.name)
		this.name = info.name

	if(info.position) {
		var coords = { lat: info.position.coords.latitude, lng: info.position.coords.longitude }
		this.marker.setPosition(coords)
		this.accuracyCircle.setCenter(coords)

		if(info.position.coords.accuracy)
			this.accuracyCircle.setRadius(info.position.coords.accuracy)
	}

	if(info.color) {
		if(this.color != info.color) {
			this.color = info.color
			this.foregroundPin = makePin(this.color, 1.0)
			this.backgroundPin = makePin(this.color, 0.7)
		}
	}

	if('hiding' in info)
		this.hiding = info.hiding

	this.marker.setIcon(this.hiding ? this.backgroundPin : this.foregroundPin)
}
