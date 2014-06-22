String.prototype.hashCode = function(){
	var hash = 0;
	if (this.length == 0) return hash;
	for (i = 0; i < this.length; i++) {
		char = this.charCodeAt(i);
		hash = ((hash<<5)-hash)+char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return Math.abs(hash);
}

// Post a comment
var postComment(url,path,content) {
	chrome.storage.sync.get(["username","uid"], function(username, uid) {
	  	console.log("username", username);
	  	console.log("uid",uid);
	});

	var commentsRef = new Firebase("https://mmfvc.firebaseio.com/comments/" + url.hashCode());
	commentsRef.push({'username': username, 'uid':uid, 'url': url, 'path': path, 'content':content});
	
	// Listen for replies
	fb.on("value", function(data) {
	  var name = data.val() ? data.val().name : "";
	  alert("My name is " + name);
	});

}



