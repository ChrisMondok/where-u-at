function Visibility(comms){
	this.comms = comms
	document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
	this.handleVisibilityChange()
}

Visibility.prototype.handleVisibilityChange = function() {
	this.comms.send({
		event: 'friend-state-updated',
		hiding: document.hidden
	})
}
