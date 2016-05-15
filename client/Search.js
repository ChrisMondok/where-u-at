function Search(map, comms) {
	this.map = map

	this.comms = comms

	this.infoWindow = new PlaceDetails(comms, true)

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
		if(place.geometry)
			this.result = place
		else
			this.result = null
		
	}.bind(this))

	return input
}

Object.defineProperty(Search.prototype, 'result', {
	get: function() {
		return this._result
	},
	set: function(place) {
		this._result = place

		this.infoWindow.place = place
		if(place.geometry) {
			this.infoWindow.open(this.map)

			if(place.geometry.viewport)
				this.map.fitBounds(place.geometry.viewport)
			else {
				this.map.setCenter(place.geometry.location)
				this.map.setZoom(17)
			}
		} else this.infoWindow.close()
	}
})
