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
			else
				new Toast(message.name + ' shared this place')
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

	content.className = 'place-details'

	if(this.result.name) {
		var name = document.createElement('header')
		name.textContent = this.result.name
		content.appendChild(name)
	}

	if(this.result.formatted_address) {
		var address = document.createElement('address')
		address.textContent = this.result.formatted_address
		content.appendChild(address)
	}

	if(this.result.opening_hours) {
		var openingHours = this.result.opening_hours
		var openNow = document.createElement('div')

		openNow.textContent = openingHours.open_now ? 'Open' : 'Closed'
		openNow.className = openingHours.open_now ? 'open-now' : 'closed-now'
		content.appendChild(openNow)

		if(openingHours.weekday_text) {
			var day = (new Date().getDay() + 6) % 7
			var hours = document.createElement('div')
			hours.textContent = openingHours.weekday_text[day]
			content.appendChild(hours)
		}
	}

	if(this.result.international_phone_number) {
		var phoneLink = document.createElement('a')
		phoneLink.href = 'tel:'+this.result.international_phone_number.replace(/\s/g,'')
		phoneLink.textContent = this.result.formatted_phone_number || this.result.international_phone_number

		var phoneBox = document.createElement('div')
		phoneBox.appendChild(phoneLink)
		content.appendChild(phoneBox)
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

