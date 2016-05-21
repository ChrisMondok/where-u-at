function Friend(map, info) {
	this.id = info.id
	this.map = map

	this.initMarkers()

	this.update(info)

	this.marker.setAnimation(google.maps.Animation.DROP)

}

Friend.prototype.initMarkers = function() {
	this.marker = new google.maps.Marker({
		map: this.map,
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
		this.infoWindow.open(this.map, this.marker)
		this.accuracyCircle.setVisible(true)
}

Friend.prototype.destroy = function() {
	this.marker.setMap(null)
	this.infoWindow.setMap(null)
}

Object.defineProperty(Friend.prototype, 'name', {
	get: function() {
		return this._name
	},
	set: function(name) {
		this._name = name
		this.marker.setTitle(name)
		this.marker.setLabel(name)
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


	if (info.stale) {
		this.stale = true
		var icon = info.hiding ?
							 'http://maps.google.com/mapfiles/ms/icons/green.png' :
							 'http://maps.google.com/mapfiles/ms/icons/red.png'
		this.marker.setIcon(icon)
	}

}
