function makePin(color, opacity) {

	var pinAngle = Math.PI/4
	var radius = 10 * devicePixelRatio
	var borderWidth = 2 * devicePixelRatio

	var tailLength = radius + radius / Math.tan(pinAngle/2)

	var canvas = document.createElement('canvas')

	canvas.width = 2 * radius + borderWidth
	canvas.height = tailLength + 2 * borderWidth

	var ctx = canvas.getContext('2d')

	ctx.beginPath()
	ctx.moveTo(radius + borderWidth/2, tailLength + borderWidth/2)
	ctx.arc(radius + borderWidth/2, radius + borderWidth/2, radius, pinAngle/2, Math.PI-pinAngle/2, true)
	ctx.closePath()

	ctx.fillStyle = color
	ctx.globalAlpha = opacity
	ctx.fill()
	ctx.globalAlpha = 1
	ctx.lineWidth = borderWidth
	ctx.stroke()

	return {
		url: canvas.toDataURL(),
		scaledSize: new google.maps.Size(canvas.width / devicePixelRatio, canvas.height / devicePixelRatio),
	}
}
