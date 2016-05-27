function Sidebar(container, map) {
	this.map = map
	this.initControls(container)
	this._expanded = false
}

Sidebar.prototype.initControls = function(container) {
	this.node = document.createElement('aside')
	this.node.className = 'sidebar'
	container.appendChild(this.node)

	var theVoid = document.createElement('div')
	theVoid.className = 'the-void'
	theVoid.addEventListener('click', function() {
		this.expanded = false
	}.bind(this))

	this.node.appendChild(theVoid)
}

Sidebar.prototype.addSection = function(title, node) {
	var section = document.createElement('section')
	var header = document.createElement('header')
	header.textContent = title
	section.appendChild(header)
	section.appendChild(node)

	this.node.appendChild(section)
}

Object.defineProperty(Sidebar.prototype, 'expanded', {
	get: function() {
		return this._expanded
	}, set: function(v) {
		this._expanded = v
		this.node.classList[v ? 'add' : 'remove']('expanded')
		setTimeout(function() {
			google.maps.event.trigger(this.map, 'resize')
		}.bind(this), 250)
	}
})

Sidebar.prototype.toggle = function() {
	this.expanded = !this.expanded
}
