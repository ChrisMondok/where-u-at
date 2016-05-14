function MyLocation(map, position) {
	this.map = map

	this.initMarkers()

	this.initControls()

	this.search = new Search(this.map)

	var yourLocationAccuracy

	setTimeout(function() {
		this.yourLocationMarker.setVisible(true)
		this.yourLocationMarker.setAnimation(google.maps.Animation.DROP)
		this.yourAccuracy.setVisible(true)
	}.bind(this), 1000)

	this.position = position
}

Object.defineProperty(MyLocation.prototype, 'position', {
	get: function() {
		return this._position
	},
	set: function(position) {
		this._position = position
		var latlng = {lat: position.coords.latitude, lng: position.coords.longitude}
		this.yourLocationMarker.setPosition(latlng)
		this.yourAccuracy.setCenter(latlng)
		this.yourAccuracy.setRadius(position.coords.accuracy)
		return this._position
	}
})

MyLocation.prototype.initMarkers = function() {
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

MyLocation.prototype.initControls = function() {
	var button = makeImageButton('icons/Target-32.png')
	button.addEventListener('click', function() {
		this.map.panTo({lat: this.position.coords.latitude, lng: this.position.coords.longitude})
	}.bind(this))

	var container = document.createElement('div')
	container.className = 'map-control-container'
	container.appendChild(button)

	this.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(container)
}
