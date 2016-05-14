function Search(map, comms) {
	this.map = map

	this.comms = comms

	this.infoWindow = new google.maps.InfoWindow()

	this.targetMarker = new google.maps.Marker({
		map: map,
		visible: false
	})

	this.initControls()

	this.placeService = new google.maps.places.PlacesService(map)
}

Search.prototype.update = function(message) {
	if(message.event == 'place-shared') {
		this.getPlace(message.placeId).then(function(place) {
			this.result = place
			var senderNote = document.createElement('div')
			senderNote.textContent = 'Shared by '+message.name
			this.infoWindow.getContent().appendChild(senderNote)
			this.infoWindow.getContent().querySelector('button').disabled = true
			if(document.hidden)
				new Notification('Place shared', {
					body: message.name+' shared a place: '+place.name
				})
		}.bind(this), function(error) {
			alert("Someone shared a place, but we couldn't find it.")
		})
	}
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
	button.textContent = 'Share with friends'
	button.addEventListener('click', function() {
		this.sharePlace(this.result)
		button.disabled = true
	}.bind(this))
	content.appendChild(button)

	this.infoWindow.setContent(content)

	this.infoWindow.setPosition(this.result.geometry.location)
}

Search.prototype.sharePlace = function(place) {
	this.comms.send({
		event: 'place-shared',
		placeId: place.place_id
	})
}

Search.prototype.getPlace = function(placeId) {
	var service = this.placeService;
	return new Promise(function(resolve, reject) {
		service.getDetails({ placeId: placeId }, function(place, status) {
			if(status === google.maps.places.PlacesServiceStatus.OK)
				resolve(place)
			else
				reject(status)
		})
	}.bind(this))
}

