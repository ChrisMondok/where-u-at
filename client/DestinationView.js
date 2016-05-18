function DestinationView(map, comms) {
	this.map = map

	this.comms = comms

	this.infoWindow = new PlaceDetails(comms, false)

	this.marker = new google.maps.Marker({
		map: map,
		icon: {
			url: 'icons/target-pin.png',
			scaledSize: new google.maps.Size(34*2/3, 50*2/3)
		},
		visible: false,
		zIndex: 2
	})

	this.marker.addListener('click', this.clicked.bind(this))

	this.placeService = new google.maps.places.PlacesService(map)
}

DestinationView.prototype.update = function(message) {

	if(message.event == 'destination-set' && message.placeId) {
		this.getPlace(message.placeId).then(function(place) {
			this.infoWindow.place = place
			this.marker.setPosition(place.geometry.location)
			this.marker.setVisible(true)

			new Toast(message.name + ' shared this place')

		}.bind(this), function(error) {
			new Toast(message.name + "shared a place, but we couldn't find it.")
		})
	}
}

DestinationView.prototype.clicked = function() {
	this.infoWindow.open(this.map, this.marker)
}

DestinationView.prototype.getPlace = function(placeId) {
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
