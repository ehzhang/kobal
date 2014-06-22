chrome.extension.sendMessage({}, function(response) {
  var readyStateCheckInterval = setInterval(function() {
  if (document.readyState === "complete") {
    clearInterval(readyStateCheckInterval);

    // ----------------------------------------------------------
    // This part of the script triggers when page is done loading
    console.log("Hello. This message was sent from scripts/inject.js");
    // ----------------------------------------------------------

    // Send a message to chrome (Listen for on app.js)
    chrome.runtime.sendMessage({
      url: "blah.com",
      path: "//Body/Div whatever",
      content: "documentation blah blah bad"
    }, function(response){

      console.log(response);

    });


    }
  }, 10);
});