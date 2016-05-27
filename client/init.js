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
			new Visibility(comms)
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
		parent.insertBefore(node, parent.firstChild)

		node.className = 'map-container'

		var map = new google.maps.Map(node, {
			zoom: 8,
			fullscreenControl: false,
			center: { lat: position.coords.latitude, lng: position.coords.longitude },
			clickableIcons: false,
			disableDefaultUI: true
		})


		var menuButton = document.createElement('button')
		menuButton.id = 'toggle-sidebar'
		menuButton.innerHTML = '&vellip;'
		map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(menuButton)

		menuButton.addEventListener('click', toggleSidebar)

		return new Promise(function(resolve, reject) {
			google.maps.event.addListenerOnce(map, 'tilesloaded', function() {
				openScrim()
				resolve(map)
			})
		})

		function toggleSidebar() {
			document.querySelector('aside.sidebar').classList.toggle('expanded') 
			setTimeout(function() {
				google.maps.event.trigger(map, 'resize')
			}, 250)
		}
	}

	function createWidgets(connection, map, position) {
		friendsList = new FriendsList(map, document.querySelector('aside.sidebar'))
		search = new Search(map, comms)
		destinationView = new DestinationView(map, comms)
	}

	function startWatchingPosition() {
		navigator.geolocation.watchPosition(function(position) {
			sendMessage({
				event: 'friend-updated',
				position: position
			})
		})
	}

	function sendMessage(message){
		try {
			comms.send(message)
		}
		catch(e) {
			console.log(e)
		}
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
