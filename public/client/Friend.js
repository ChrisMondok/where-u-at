function Friend(map, info) {
	this.id = info.id
	this.map = map

	this.marker = new google.maps.Marker({
		map: map
	})

	this.infoWindow = new google.maps.InfoWindow()

	this.update(info)

	this.marker.setAnimation(google.maps.Animation.DROP)

	this.marker.addListener('click',this.showWindow.bind(this))

}

Friend.prototype.showWindow = function() {
		this.infoWindow.open(this.map, this.marker)
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
	this.name = info.name
	this.marker.setPosition({
		lat: info.position.coords.latitude,
		lng: info.position.coords.longitude
	})
}
