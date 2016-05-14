var resolveMap

var mapsPromise = new Promise(function(r, reject) {
	resolveMap = r
})

function mapsLoaded() {
	resolveMap()
}

addEventListener('load', function() {
	var form = document.querySelector('#setup-form-container form')


	var checkbox = document.querySelector('#setup-form-container input[type=checkbox]')

	checkbox.indeterminate = true

	var locationPromise = new Promise(function(resolve, reject) {
		navigator.geolocation.getCurrentPosition(function(pos) {
			resolve(pos)
			checkbox.indeterminate = false
			checkbox.checked = true
			checkbox.nextSibling.textContent = 'Found you'
		}, function(e) {
			alert("Got error "+e)
		})
	})

	var namePromise = new Promise(function(resolve, reject) {
		form.style.display = ''
		form.addEventListener('submit', function(e) {
			e.preventDefault()
			form.querySelector('button').disabled = true
			resolve(form.elements.name.value)
		})
	})

	var connectionPromise = Promise.all([namePromise, locationPromise]).then(function(promises) {
		var coords = promises[1].coords
		var url = 'ws://'+location.host+'?'+toQueryString({
			name: promises[0],
			latitude: coords.latitude,
			longitude: coords.longitude
		})

		var ws = new WebSocket(url)

		return new Promise(function(resolve, reject) {
			ws.addEventListener('open', function() {
				resolve(ws)
			})

			ws.addEventListener('error', function() {
				reject(ws)
			})

		})
	})

	Promise.all([mapsPromise, connectionPromise, locationPromise]).then(function(promises) {
		return new Promise(function(resolve, reject) {
			new MapView(document.querySelector('main'), promises[1], promises[2], resolve)
		})
	}).then(openScrim, function(e) {
		alert("Got error "+e)
	})

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
