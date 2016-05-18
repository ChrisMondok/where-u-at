function FriendsList(map) {
	this.map = map
	this.friends = []
	this.initControls()
}

FriendsList.prototype.update = function(message) {
	var friend = this.friends.find({id: message.id})
	switch(message.event) {
		case 'friend-joined':
			var friends = message.friends || [];
			friends.forEach(function(friend, index){
				//only add if the friends not already in the room
				//Should probably figure out a better way of handling this so we
				//don't have to always iterate over the friends list
				if(!this.friends.find({id: friend.id}))
					this.addFriend(new Friend(this.map, friend))
			}, this)
			break
		case 'location-updated':
			if(friend) friend.update(message)
			else this.addFriend(new Friend(this.map, message))
			break
		case 'left':
			if(friend) this.removeFriend(friend)
			break
	}
}

FriendsList.prototype.removeFriend = function(friend) {
	this.list.removeChild(this.list.querySelector('[data-friend-id='+friend.id+']'))
	friend.destroy() //harsh
	this.friends.remove(friend)

	new Toast(friend.name+' left')
}

FriendsList.prototype.addFriend = function(friend) {
	this.friends.push(friend)
	var li = document.createElement('li')

	li.setAttribute('data-friend-id', friend.id)
	li.textContent = friend.name
	this.list.appendChild(li)
	li.addEventListener('click', friend.clicked.bind(friend))

	new Toast(friend.name+' joined')
}

FriendsList.prototype.initControls = function() {
	this.list = document.createElement('ul')

	container = document.createElement('div')
	container.className = 'friends-list-container collapsed'

	container.appendChild(this.list)

	var toggleButton = makeImageButton('icons/User-Profile-32.png')

	toggleButton.addEventListener('click', function() {
		container.classList.toggle('collapsed')
	});

	container.appendChild(toggleButton)
	this.map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(container)
}
