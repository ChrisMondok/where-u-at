function PlaceDetails(comms, canSetDestination) {
	this.canSetDestination = canSetDestination
	this.comms = comms

	google.maps.InfoWindow.apply(this, arguments)

	this.place = null
}

PlaceDetails.prototype = Object.create(google.maps.InfoWindow.prototype)
PlaceDetails.prototype.constructor = PlaceDetails

Object.defineProperty(PlaceDetails.prototype, 'place', {
	get: function() {
		return this._place
	},
	set: function(place) {
		if(place && !place.geometry)
			place = null

		this._place = place

		if(!place) {
			this.close()
			return
		}
		else
			this.setContent(this.buildContent(place))
	}
})

PlaceDetails.prototype.buildContent = function() {
	var content = document.createElement('div')

	content.className = 'place-details'

	this.setPosition(this.place.geometry.location)

	if(this.place.name) {
		var name = document.createElement('header')
		name.textContent = this.place.name
		content.appendChild(name)
	}

	if(this.place.formatted_address) {
		var address = document.createElement('address')
		address.textContent = this.place.formatted_address
		content.appendChild(address)
	}

	if(this.place.opening_hours) {
		var openingHours = this.place.opening_hours
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

	if(this.place.international_phone_number) {
		var phoneLink = document.createElement('a')
		phoneLink.href = 'tel:'+this.place.international_phone_number.replace(/\s/g,'')
		phoneLink.textContent = this.place.formatted_phone_number || this.place.international_phone_number

		var phoneBox = document.createElement('div')
		phoneBox.appendChild(phoneLink)
		content.appendChild(phoneBox)
	}

	if(this.canSetDestination) {
		var button = document.createElement('button')
		button.textContent = 'Set destination'
		button.addEventListener('click', function() {
			this.setDestination(this.place)
			button.disabled = true
			this.close()
		}.bind(this))
		content.appendChild(button)
	}

	return content
}

PlaceDetails.prototype.setDestination = function(place) {
	this.comms.send({
		event: 'destination-set',
		placeId: place.place_id
	})
}
