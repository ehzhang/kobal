// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


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

String.prototype.shave = function() {
  var index = this.indexOf('?');
  if (index < 0) {
    return this;
  } else {
    return this.substring(0,index);
  }
}

var sendEmailAlert = function(email, url, original_content, replyer, reply_content, sendResponse) {
  var content = replyer+" replied to your Annotip comment!\n\nYou wrote: " + original_content + "\n\n" + replyer + " wrote: " + reply_content + "\n\n" + "Click "+url+" to respond.";
  var m = new mandrill.Mandrill('MKqVPsdcFONaM-Tmo88RyQ');
  var params = {
    "message": {
      "from_email":"annotip@mit.edu",
      "to":[{"email":email}],
      "subject": "Response to Annotip comment",
      "text": content
    }
  };
  // Send the email!
  m.messages.send(params, function(res) {
      console.log(res);
  }, function(err) {
      console.log(err);
  });
}

var postComment = function(url,text_id,content,sendResponse) {
  chrome.storage.sync.get("username", function(username) {
    chrome.storage.sync.get("email", function(email) {
      chrome.storage.sync.get("id", function(uid) {
        var comment_id = Math.floor((Math.random() * 1000000) + 1);
        var path = "https://mmfvc.firebaseio.com/urls/" + url.shave().hashCode() + "/paragraphs/" + SHA224(content).toString() + "/comments/" + comment_id.toString();
        var commentsRef = new Firebase(path);
        commentsRef.update({'username': username, 'uid': uid, 'url': url, 'email': email, 'text_id': text_id});
        // Listen for replies
        var repliesRef = new Firebase("https://mmfvc.firebaseio.com/comments/" + url.shave().hashCode());
        commentsRef.on("child_added", function(childSnapshot, prevChildName) {
          sendEmailAlert(email, url, content, childSnapshot.val()['username'], childSnapshot.val()['content'],sendResponse);
          sendResponse(childSnapshot.val());
        })
        sendResponse(text_id);
      });
    });
  });
}

var getPageComments = function(url,text_id,sendResponse) {
  var commentsRef = new Firebase("https://mmfvc.firebaseio.com/comments/" + url.shave().hashCode());
  commentsRef.once('value', function(childSnapshots) {
    childSnapshots.forEach(function(childSnapshot) {
      sendResponse(childSnapshot.val());
    });
  });
}

chrome.extension.onMessage.addListener(
  function (message, sender, sendResponse) {
    // Check to make sure the message contains the fields we want
    if (message.url && message.id && message.content && message.type && sendResponse && message.type == "POST") {
      console.log("whoa, just got a post message!");
      postComment(message.url,message.id,message.content,sendResponse);
      return true;
    } else if (message.url && message.id && message.type == "GET") {
      getPageComments(message.url, message.id,sendResponse);
      return true;
    } else if (sendResponse) {
      sendResponse();
    }
  }
);








