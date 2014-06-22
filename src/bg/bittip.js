var checkCoinbaseLogin = function(success_callback, failure_callback) {
	chrome.storage.sync.get("api_key", function(token) {
		coinbase_api_key = token['api_key'];
	});

	chrome.storage.sync.get("api_secret", function(token) {
		coinbase_secret = token['api_secret'];
	});

  chrome.storage.sync.get("amount", function(token) {
    sendAmount = token['amount'];
  });

  chrome.storage.sync.get("default_currency", function(token) {
    sendCurrency = token['default_currency'];
  });

	if (coinbase_secret != null && coinbase_api_key != null) {
		return success_callback();
	} else {
		return failure_callback();
	}
};

var sendFailed = function(msg) {
	console.log(msg)
}

var sendSuccess = function(msg) {
	console.log(msg);
}

chrome.extension.onMessage.addListener(
  function (message, sender, sendResponse) {
    // Check to make sure the message contains the fields we want
    if (message.bittip && message.targetEmail) {
      console.log("whoa, just got a message!");
      // Your method here
      return true;
    } else if (sendResponse) {
      sendResponse();
    }
  }
);

var sendBitcoin = function(destination_address, note) {

	var sendMoney = function(success_callback, failure_callback) {
    var nonce = (new Date()).getTime();
    // var signature;
    var url = "https://coinbase.com/api/v1/transactions/send_money"
    + "?transaction%5Bto%5D=" + destination_address
    + "&transaction%5Bamount_string%5D=" + sendAmount
    + "&transaction%5Bamount_currency_iso%5D=" + sendCurrency
    + "&transaction%5Bnotes%5D=" + encodeURIComponent(note)
    + "&transaction%5Breferrer_id%5D=52b1dfa7296f323fe50000be";

		$.ajax(url, {
			type: "POST",
			headers: {
				ACCESS_KEY: coinbase_api_key,
				ACCESS_SIGNATURE:  CryptoJS.HmacSHA256(nonce.toString() + url, coinbase_secret),
				ACCESS_NONCE: nonce,
			},
			success: function(response, textStatus, jqXHR) {
				if (response.success == true)
					success_callback('sent ' + sendAmount + ' ' + sendCurrency + '...');
				else if (response.errors[0].indexOf("You don't have that much") == 0) {
					failure_callback("not enough funds");
                  } else if (response.errors[0].indexOf("This transaction amount is below the current minimum amount to be accepted by the bitcoin network") == 0) {
					failure_callback("value too small to send until the recipient claims their first tip");
                  } else if (response.errors[0].indexOf("This transaction requires a 0.0005 fee to be accepted by the bitcoin network") == 0) {
					failure_callback("value too small to send until the recipient claims their first tip");
				} else {
					console.log("Error sending money:");
					console.log(response);
					failure_callback("unknown error sending");
				}
			},
			error: function(response, textStatus, jqXHR) {
				console.log("Error sending money:");
				console.log(response);
				failure_callback("unknown error sending");
			}
		});
	};

  // Check if logged in
	checkCoinbaseLogin(function() {
			// Already logged in...
			sendMoney(function() {
        sendSuccess('success!');
      }, function(msg) {
        // Failed to send (not enough funds, etc)
        sendFailed(msg);
      });
		}, function() {
			// Not authed
      alert("Please configure the extension with your Coinbase credentials!");
	});
};