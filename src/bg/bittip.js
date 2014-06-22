var coinbase-api-key, coinbase-secret;
var checkCoinbaseLogin = function(success_callback, failure_callback) {
	chrome.storage.sync.get("api_key", function(token) {
		coinbase-api-key = token['api_key'];
	});

	chrome.storage.sync.get("api_secret", function(token) {
		coinbase-secret = token['api_secret'];
	});

	if (coinbase-secret != "undefined" && coinbase-api-key != "undefined") {
		return success_callback();
	} else {
		return failure_callback();
	}
};

var fromUser;

// The amount to send
var sendAmount = 0.50;
var sendCurrency = 'USD';

var sendFailed = function(msg) {
	console.log(msg)
}

var sendSuccess = function(msg) {
	console.log(msg);
}

var sendBitcoin = function(destination_address, sendAmount, sendCurrency) {
	// Sends money using Coinbase
	var sendMoney = function(success_callback, failure_callback) {
		$.ajax("https://coinbase.com/api/v1/transactions/send_money", {
			type: "POST",
			data: {
				access_token: coinbase_access_token,
				transaction: {
					to: destination_address,
					amount_string: sendAmount,
					amount_currency_iso: sendCurrency,
					notes: "Tip from a 'tatertip user"
				}
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

	// Now string it all together...
	var postAuth = function() {
		sendMoney(function() {
				sendSuccess('success!');
			}, function(msg) {
				// Failed to send (not enough funds, etc)
				sendFailed(msg);
		});
	}

	checkCoinbaseLogin(function() {
			// Already logged in...
			postAuth();
		}, function(msg) {
			// Not authed, lets try to log in...
			coinbaseLogin(function() {
					// Authed now...
					postAuth();
				}, function(msg) {
					// Failed to get user to login to their Coinbase acct...
					sendFailed(msg);
			});
	})
};