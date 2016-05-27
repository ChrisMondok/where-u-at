function FriendsList(map, sidebar) {
	this.map = map
	this.friends = []
	this.initControls(sidebar)
}

FriendsList.prototype.update = function(message) {
	switch(message.event) {
		case 'friend-joined':
			new Toast(message.name+' joined')
			this.handleUpdate(message)
			break
		case 'friends-list-updated':
			this.handleFriendsListUpdated(message)
			break
		case 'friend-updated':
			this.handleUpdate(message)
			break
		case 'friend-state-updated':
			this.handleUpdate(message)
			break
		case 'friend-left':
			this.handleFriendLeft(message)
			break
	}
}

FriendsList.prototype.addFriend = function(friend) {
	this.friends.push(friend)
	var li = document.createElement('li')

	li.setAttribute('data-friend-id', friend.id)
	li.textContent = friend.name

	this.icon = document.createElement('span')
	this.icon.className = 'icon'
	li.insertBefore(this.icon, li.firstChild)

	this.list.appendChild(li)
	li.addEventListener('click', friend.clicked.bind(friend))
}

FriendsList.prototype.removeFriend = function(friend) {
	this.list.removeChild(this.list.querySelector('[data-friend-id='+friend.id+']'))
	friend.destroy() //harsh
	this.friends.remove(friend)
}

FriendsList.prototype.handleUpdate = function(message) {
	var friend = this.friends.find({id: message.id})
	if(friend) friend.update(message)
	else this.addFriend(new Friend(this.map, message))
	
	if(message.color)
		this.icon.style.backgroundColor = message.color
}

FriendsList.prototype.handleFriendLeft = function(message) {
	var friend = this.friends.find({id: message.id})
	if(friend) this.removeFriend(friend)
	new Toast(message.name+' left')
}

FriendsList.prototype.handleFriendsListUpdated = function(message) {
	this.friends.filter(function(friend) {
		return !message.friends.any({id: friend.id})
	}, this).forEach(this.removeFriend, this)

	message.friends.forEach(function(friend) {
		this.handleUpdate(friend)
	}, this)
}

FriendsList.prototype.initControls = function(sidebar) {
	this.list = document.createElement('ul')
	this.list.className = 'friends-list'

	var inviteLink = document.createElement('a')
	inviteLink.textContent = 'Invite More'
	inviteLink.href = 'sms:?&body='+encodeURI('Where u at? '+window.location.href)

	var container = document.createElement('div')
	container.appendChild(this.list)
	container.appendChild(inviteLink)

	sidebar.addSection('Friends', container)
}

