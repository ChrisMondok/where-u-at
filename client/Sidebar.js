function Sidebar(container) {
	this.initControls(container)
}

Sidebar.prototype.initControls = function(container) {
	this.node = document.createElement('aside')
	this.node.className = 'sidebar'
	container.appendChild(this.node)

	var theVoid = document.createElement('div')
	theVoid.className = 'the-void'
	theVoid.addEventListener('click', this.close.bind(this))

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

Sidebar.prototype.toggle = function() {
	this.node.classList.toggle('expanded') 
}

Sidebar.prototype.close = function() {
	this.node.classList.remove('expanded')
}
