// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


//example of using a message handler from the inject scripts

chrome.extension.onMessage.addListener(
  function (message, sender, sendResponse) {
    // Check to make sure the message contains the fields we want
    if (message.url && message.path && message.content) {
      if (sendResponse) {

        console.log("whoa, just got a message!");
        // Do something with the url, path, content
        // sendResponse can be passed through as a callback in another function
        sendResponse('Some kind of JSON-ifiable object');

        return true; // Return true keeps the connection open for async
      }
    } else if (sendResponse) {
      sendResponse();
    }
  }
);
