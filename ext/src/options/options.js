var ref = new Firebase("https://mmfvc.firebaseio.com");
var authClient = new FirebaseAuthClient(ref, function(error, user) {
  if (error) {
    alert(error);
    return;
  }
  if (user) {
    // User is already logged in.
    doLogin(user);
  } else {
    // User is logged out.
    showLoginBox();
  }
});

function showLoginBox() {
  ...
  // Do whatever DOM operations you need to show the login/registration box.
  $("#registerButton").on("click", function() {
    var email = $("#email").val();
    var password = $("#password").val();
    authClient.createUser(email, password, function(error,  user) {
      if (!error) {
        doLogin(user);
      } else {
        alert(error);
      }
    });
  });
}

function showLoginBox() {
  ...
  // Do whatever DOM operations you need to show the login/registration box.
  $("#loginButton").on("click", function() {
    authClient.login("password", {
      email: $("#email").val(),
      password: $("#password").val(),
      rememberMe: $("#rememberCheckbox").val()
    });
  });
}