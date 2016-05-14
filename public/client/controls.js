function makeImageButton(src) {
	var button = document.createElement('button')
	var img = document.createElement('img')
	img.alt = 'Center map'
	img.title = 'Center map'
	img.src = src
	button.className = 'icon-button circle'
	button.appendChild(img)

	return button
}
