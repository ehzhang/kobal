// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


String.prototype.hashCode = function(){
  var hash = 0;
  if (this.length == 0) return hash;
  for (var i = 0; i < this.length; i++) {
    var char = this.charCodeAt(i);
    hash = ((hash<<5)-hash)+char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

String.prototype.shave = function() {
  var index = this.indexOf('?');
  if (index < 0) {
    return this;
  } else {
    return this.substring(0,index);
  }
};

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
//      console.log(res);
  }, function(err) {
//      console.log(err);
  });
};

var postComment = function(url,text_id,comment,content,sendResponse) {
  chrome.storage.sync.get("username", function(username_data) {
    var username_str = this["username"];
    debugger;
    console.log("username is: " + username_str);
    chrome.storage.sync.get("email", function(email_data) {
      var email_str = email_data["email"];
      console.log("email is: " + email_str);
      chrome.storage.sync.get("id", function(uid_data) {
        var uid_str = uid_data["id"];
        console.log("id is: " + uid_str);
        var comment_id = Math.floor((Math.random() * 1000000) + 1);
        var path = "https://mmfvc.firebaseio.com/urls/" + url.shave().hashCode() + "/paragraphs/" + SHA224(content).toString() + "/comments";
        var commentsRef = new Firebase(path + "/" + comment_id.toString());
        console.log("hereyo");
        commentsRef.update({'username': username_str, 'uid': uid_str, 'url': url, 'email': email_str, 'comment': comment, 'timestamp':new Date()});
        // Listen for replies
        var repliesRef = new Firebase(path);
        debugger;
        repliesRef.on("child_added", function(childSnapshot, prevChildName) {
          debugger;
          //if (childSnapshot["username"] != username_str) {
            sendEmailAlert(email_str, url, content, childSnapshot.val()['username'], childSnapshot.val()['content'],sendResponse);
            console.log(email_str+url,content,childSnapshot.child("username"));
          //}
        });
        sendResponse(text_id);
      });
    });
  });
};

var getPageComments = function(url,text_id,content,sendResponse) {
  var path = "https://mmfvc.firebaseio.com/urls/" + url.shave().hashCode() + "/paragraphs/" + SHA224(content).toString() + "/comments";
  var commentsRef = new Firebase(path);
//  console.log(path);
  commentsRef.once('value', function(childSnapshots) {
    var comments = [];
    childSnapshots.forEach(function(childSnapshot) {
      comments.push(childSnapshot.val());
    });
    sendResponse(comments);
  });
};

chrome.extension.onMessage.addListener(
  function (message, sender, sendResponse) {
    // Check to make sure the message contains the fields we want
    if (message.url && message.id && message.comment && message.content && message.type && sendResponse && message.type == "POST") {
      console.log("whoa, just got a post message!");
      postComment(message.url,message.id,message.comment, message.content, sendResponse);
      return true;
    } else if (message.url && message.id && message.content && message.type == "GET") {
      getPageComments(message.url, message.id,message.content,sendResponse);
      return true;
    } else if (sendResponse) {
      sendResponse();
    }
  }
);








