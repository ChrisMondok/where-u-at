function Toast(message) {
	this.node = document.createElement('div')
	this.node.textContent = message

	this.node.className = 'toast'

	document.getElementById('toast-container').appendChild(this.node)

	setTimeout(this.close.bind(this), 5000)
}

Toast.prototype.close = function() {
	this.node.className = 'toast closing'
	setTimeout(function() {
		if(this.node.parentElement)
			this.node.parentElement.removeChild(this.node)
	}.bind(this), 1000)
}
