// The Coinbase access_token
//TODO: Track its expiration instead of requesting a new one each time
var coinbase_access_token = "";

// Hook up a chrome message handler to get back messages when we finish OAUTH
var login_success_callback;
var login_failure_callback;

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	sendResponse({});
	if (message.code_token == undefined)
		login_failure_callback("error connecting to coinbase");
	else {
		console.log(chrome.extension.getURL("options/oauth_response.html"));
		$.ajax("https://coinbase.com/oauth/token", {
			type: "POST",
			data: {
				grant_type: "authorization_code",
				code: message.code_token,
				redirect_uri: chrome.extension.getURL("options/oauth_response.html"),
				client_id: "83c08a377c3b6e9a3232a092c78f5c5ebfccc1f5da5df94f947116bcb7328085",
				// Ideally we would keep the client_secret secret, however there are essentially no threats that aren't easily addressed with this public.
				// The reason for keeping this secret is so that if a malicious person were to clone the reddit tipbot (or any Coinbase app) and steal user's money, Coinbase could immediately blacklist the client_id making the calls and break the app.
				// Though the possibility that such an attacker could use the real app's secret slows that a bit, it is still possible to push a new client_id/_secret to the real app and disable the old one.
				// Sadly, for any motivated attacker, there is no way to prevent this (especially in Chrome, where we can easily see all the requests being made, including their headers, by simply pulling up the developer tools)
				// (well...unless we were to do a native app and require TXT and a TPM-measured environment.......)
				client_secret: "d64cf1bff72bdd010ad5f7e9c65ce2d6601705a8ce43e834a642ae8e0033e577"
			},
			success: function(response, textStatus, jqXHR) {
				if (response.access_token != undefined && response.refresh_token != undefined) {
					coinbase_access_token = response.access_token;
					chrome.storage.local.set({'coinbase-refresh-token': response.refresh_token}, function() {});
					login_success_callback();
				} else {
					console.log("Error getting Coinbase auth token:");
					console.log(response);
					login_failure_callback("error connecting to coinbase");
				}
			},
			error: function(response, textStatus, jqXHR) {
				console.log("Error getting auth_token from Coinbase after OAUTH");
				console.log(response);
				login_failure_callback("error connecting to coinbase");
			},
			cache: false
		});
	}
});

var checkCoinbaseLogin = function(success_callback, failure_callback) {
	chrome.storage.local.get("coinbase-refresh-token", function(token) {
		if (token["coinbase-refresh-token"] != "undefined") {
			$.ajax("https://coinbase.com/oauth/token", {
				type: "POST",
				data: {
					grant_type: "refresh_token",
					refresh_token: token["coinbase-refresh-token"],
					client_id: "83c08a377c3b6e9a3232a092c78f5c5ebfccc1f5da5df94f947116bcb7328085",
					client_secret: "d64cf1bff72bdd010ad5f7e9c65ce2d6601705a8ce43e834a642ae8e0033e577"
				},
				success: function(response, textStatus, jqXHR) {
					if (response.access_token != undefined && response.refresh_token != undefined) {
						coinbase_access_token = response.access_token;
						chrome.storage.local.set({'coinbase-refresh-token': response.refresh_token}, function() {});
						success_callback();
					} else {
						console.log("Error getting Coinbase auth token:");
						console.log(response);
						failure_callback("not logged into Coinbase");
					}
				},
				error: function(response, textStatus, jqXHR) {
					failure_callback("not logged into Coinbase");
				}
			});
		} else
			failure_callback("not logged into Coinbase");
	});
};

// Opens up a Coinbase OAUTH window
var coinbaseLogin = function(success_callback, failure_callback) {
	login_success_callback = success_callback;
	login_failure_callback = failure_callback;
	window.showModalDialog("https://coinbase.com/oauth/authorize?response_type=code&client_id=83c08a377c3b6e9a3232a092c78f5c5ebfccc1f5da5df94f947116bcb7328085&client_secret=d64cf1bff72bdd010ad5f7e9c65ce2d6601705a8ce43e834a642ae8e0033e577&scope=send&redirect_uri=" + chrome.extension.getURL("options/oauth_response.html"));
};

var fromUser;

// The amount to send
var sendAmount = 0.50;
var sendCurrency = 'USD';

var enableInput = function() {
	chrome.storage.sync.get("default_value", function(token) {
		if (token["default_value"] == undefined)
			token["default_value"] = "0.50";

		chrome.storage.sync.get("default_currency", function(currency) {
			if (currency["default_currency"] == undefined)
				currency["default_currency"] = "USD";
		});
	})
};

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