function save_bittip_options() {
     var amt = document.getElementById('amount').value;
     var currency = document.getElementById('currency').value;
     var user_api_key = document.getElementById('api_key').value;
     var user_api_secret = document.getElementById('api_secret').value;

     chrome.storage.sync.set( {
        amount : amt,
        default_currency : currency,
        api_key: user_api_key,
        api_secret : user_api_secret
     });
}

function restore_bittip_options() {
  chrome.storage.sync.get({
    amount: '0.50',
    default_currency : 'USD',
    api_key : null,
    api_secret : null,

  }, function(items) {
    document.getElementById('amount').value = items.amount;
    document.getElementById('currency').value = items.default_currency;
    document.getElementById('api_key').value = items.api_key;
    document.getElementById('api_secret').value = items.api_secret;
  });
}


document.addEventListener('DOMContentLoaded', restore_bittip_options);
document.getElementById('save_bittip').addEventListener('click',save_bittip_options);