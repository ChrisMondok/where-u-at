function Search(map) {
	this.map = map

	this.infoWindow = new google.maps.InfoWindow({
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

		this.updateInfoWindow()

		if(place.geometry) {
			this.infoWindow.open(this.map)

			if(place.geometry.viewport)
				this.map.fitBounds(place.geometry.viewport)
			else {
				this.map.setCenter(place.geometry.location)
				this.map.setZoom(17)
			}
		}
	}
})

Search.prototype.updateInfoWindow = function() {
	if(!this.result || !this.result.geometry) {
		this.infoWindow.close()
		return
	}

	var content = document.createElement('div')

	if(this.result.name) {
		var name = document.createElement('div')
		name.textContent = this.result.name
		content.appendChild(name)
	}

	if(this.result.formatted_address) {
		var address = document.createElement('address')
		address.textContent = this.result.formatted_address
		content.appendChild(address)
	}

	var button = document.createElement('button')
	button.textContent = 'Set target'
	content.appendChild(button)

	this.infoWindow.setContent(content)

	this.infoWindow.setPosition(this.result.geometry.location)
}
