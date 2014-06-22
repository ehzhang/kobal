// this is derived from
// http://stackoverflow.com/questions/15167981/how-do-i-use-firebase-simple-login-with-email-password/15167983#15167983

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

myUser = -1;
authClient = new FirebaseSimpleLogin(new Firebase("https://mmfvc.firebaseio.com"), function (error, user) {
    if (error) {
        alert(error);
        return;
    }
    if (user) {
        // User is already logged in.
        console.log('User ID: ' + user.id + ', Provider: ' + user.provider);
        myUser = user;
        $("#username-afterlogin")[0].innerHTML = myUser.email;
        console.log('logged in');
    } else {
        console.log('logged out');
    }
});

function doLogin(email1, password1) {
    authClient.login('password', {
        email: email1,
        password: password1
    });
    $("#username-afterlogin").innerHTML = email;
};

function register() {
    console.log('registered! woohoo');
    var email = getParameterByName('email');
    var password = getParameterByName('password');
    console.log("Creating user " + email + " " + password);

    authClient.createUser(email, password, function (error, user) {
        if (!error) {
            console.log('logging new registered user');
            doLogin(email,password);
        } else {
            console.log(error);
        }
    });
}
register();

$("#opener-register").onclick = function () {
    register();
};

$("#save").onclick = function() {
    var name = document.getElementById('username').value;
    console.log('saved! woohoo');
    chrome.storage.sync.set( {
        username : name,
        id : myUser.id,
        email : myUser.email,
        firebaseAuthToken: myUser.firebaseAuthToken,
        uid: myUser.uid
    });
}


// $("#opener-login").onclick = function () {
//     console.log('trying to login: ' + $("#login-email").val());
//     var email = $("#login-email").val();
//     var password = $("#login-password").val();

//     doLogin(email, password);
//     console.log("logged in ",email.toString());
//     $("#username-afterlogin").innerHTML = email;
// };

$("#opener-logout").click(function () {
    authClient.logout();
});
