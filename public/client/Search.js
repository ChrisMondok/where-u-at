function Search(map) {
	this.map = map

	this.marker = new google.maps.Marker({
		map: map,
		visible: false
	})

	this.initControls()
}

Search.prototype.initControls = function() {
	var input = this.makeAutocomplete()

	var container = document.createElement('div')
	container.className = 'map-control-container'

	container.appendChild(input)
	
	this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(container)
}

Search.prototype.makeAutocomplete = function () {
	var input = document.createElement('input')
	input.type = 'search'

	var autocomplete = new google.maps.places.Autocomplete(input)
	autocomplete.bindTo('bounds', this.map)

	autocomplete.addListener('place_changed', function() {
		var place = autocomplete.getPlace()
		if(place.geometry) {
			this.marker.setIcon({
				url: place.icon,
				size: new google.maps.Size(71, 71),
				scaledSize: new google.maps.Size(35, 35)
			})
			this.marker.setVisible(true)
			this.marker.setPosition(place.geometry.location)
			this.marker.setAnimation(google.maps.Animation.DROP)
			if(place.geometry.viewport) this.map.fitBounds(place.geometry.viewport)
			else {
				this.map.setCenter(place.geometry.location)
				this.map.setZoom(17)
			}
		}
		
	}.bind(this))

	return input
}
