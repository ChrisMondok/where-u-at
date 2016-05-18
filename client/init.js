addEventListener('load', function() {
	var comms = new Comms()

	var friendsList = null
	var search = null
	var destinationView = null

	setUpForm()
	/**
	 * setupForm wil query for the form and append an event listener for submit.
	 * Submit will call the begin function, which will instatiate the connection
	 * and set the user up.
	 */
	function setUpForm() {
		var form = document.querySelector('#setup-form-container form')

		form.addEventListener('submit', function(e) {
			e.preventDefault()
			form.querySelector('button').disabled = true
			begin(form.elements.name.value)
		})

		form.querySelector('button').disabled = false
	}
	/**
	 *
	 * @param  {string} name The name of the new user, the input. Should probably
	 *                       validate this.
	 * @return {stuff}      stuff, not quite sure what stuff is yet.
	 */
	function begin(name) {
		getPosition().then(function(position) {
			 comms.setup(name, position)
			 return Promise.all([
				comms.connect(),
				makeMap(document.querySelector('main'), position)
			]).then(function(stuff) {
				console.log(stuff)
				createWidgets(stuff[0], stuff[1], position)
				return stuff[0]
			})
		}).then(function() {
			startWatchingPosition()
			comms.addListener(readMessages)
			getCurrentUserList(name)
		}, function(e) {
			alert(e)
		})
	}
	function getCurrentUserList(){
		try {
			comms.send({
				event: 'friend-joined',
				user: name
			})
		} catch(e) {
			console.log(e)
		}
	}
	/**
	 * Get the users location through navigator.geolocation
	 * @return {Promise} A promise that will eventually get the users
	 *                     location.
	 */
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
	/**
	 * makeMap will create a new map using google maps api.
	 * @param  {node} parent HTMLNode for the parent to append the map too
	 * @param  {Object} position GeoLocation coordinates for where the user is
	 * @return {promise}         Promise to handle adding and event listener to
	 *                                   the maps.
	 */
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
	/**
	 * Instaniate the current state for the new user
	 * @param  {ws} connection WebSocket Connection
	 * @param  {Object} map        Current Map
	 * @param  {Object} position   Users current Location
	 */
	function createWidgets(connection, map, position) {
		friendsList = new FriendsList(map)
		search = new Search(map, comms)
		destinationView = new DestinationView(map, comms)
	}
	/**
	 * startWatchingPosition will try to update your location and send this
	 * communication to Cliques to broadcast to the party
	 */
	function startWatchingPosition() {
		navigator.geolocation.watchPosition(function(position) {
			try {
				comms.send({
					event: 'location-updated',
					position: position
				})
			} catch (e) {
				console.error(e)
			}
		})
	}
	/**
	 * readMessages will iterate through the list of messages available
	 * to the user and update the friendsList
	 * @return {[type]} [description]
	 */
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
