addEventListener('load', function() {
	var comms = new Comms()

	var friendsList = null
	var search = null
	var destinationView = null

	setUpForm()

	function setUpForm() {
		var form = document.querySelector('#setup-form-container form')

		form.addEventListener('submit', function(e) {
			e.preventDefault()
			form.querySelector('button').disabled = true
			begin(form.elements.name.value)
		})

		form.querySelector('button').disabled = false
	}

	function begin(name) {
		getPosition().then(function(position) {
			 comms.setup(name, position)
			 return Promise.all([
				comms.connect(),
				makeMap(document.querySelector('main'), position)
			]).then(function(resolvedPromises) {
				createWidgets(resolvedPromises[0], resolvedPromises[1], position)
				return resolvedPromises[0]
			})
		}).then(function() {
			startWatchingPosition()
			comms.addListener(readMessages)
		}, function(e) {
			alert(e)
		})
	}

	function getPosition() {
		var checkbox = document.querySelector('#setup-form-container input[type=checkbox]')

		checkbox.indeterminate = true

		return new Promise(function(resolve, reject) {
			navigator.geolocation.getCurrentPosition(function(pos) {
				resolve(pos)
				checkbox.indeterminate = false
				checkbox.checked = true
				checkbox.nextSibling.textContent = 'Found you'
			}, function(e) {
				reject(e)
			})
		})
	}

	function makeMap(parent, position) {
		var node = document.createElement('div')
		parent.appendChild(node)

		node.style.position = 'absolute'

		;['left', 'right', 'top', 'bottom'].forEach(function(side) {
			node.style[side] = '0'
		}, this)

		var map = new google.maps.Map(node, {
			zoom: 8,
			fullscreenControl: false,
			center: { lat: position.coords.latitude, lng: position.coords.longitude },
			clickableIcons: false
		})

		return new Promise(function(resolve, reject) {
			google.maps.event.addListenerOnce(map, 'tilesloaded', function() {
				openScrim()
				resolve(map)
			})
		})
	}

	function createWidgets(connection, map, position) {
		friendsList = new FriendsList(map)
		search = new Search(map, comms)
		destinationView = new DestinationView(map, comms)
	}

	function startWatchingPosition() {
		navigator.geolocation.watchPosition(function(position) {
			try {
				comms.send({
					event: 'friend-updated',
					position: position
				})
			} catch (e) {
				console.error(e)
			}
		})
	}

	function readMessages() {
		while(comms.peek()) {
			var message = comms.read()
			friendsList.update(message)
			destinationView.update(message)
		}
	}

	function openScrim() {
		var scrim = document.querySelector("#scrim")
		scrim.className = 'scrim open'

		var formContainer = document.querySelector('#setup-form-container')

		formContainer.style.transform = "translateY(-100%)"
		formContainer.style.webkitTransform = "translateY(-100%)"

		setTimeout(function() {
			formContainer.parentNode.removeChild(formContainer)
			scrim.parentNode.removeChild(scrim)
		}, 500)

	}

})

function toQueryString(obj) {
	return Object.keys(obj).map(function(key) {
		return [key, obj[key]].map(function(string) {
			return encodeURIComponent(string)
		}).join('=')
	}).join('&')
}
