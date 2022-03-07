function statusChangeCallback(response) {
    if (response.status === 'connected') {
        // Logged into your app and Facebook.
        testAPI();
    } else if (response.status === 'not_authorized') {
        $('#start').hide();
        if (user != null) {
            user.remove();
        }
    } else {
        $('#start').hide();
        if (user != null) {
            user.remove();
        }
    }
}

function checkLoginState() {
    FB.getLoginStatus(function (response) {
        statusChangeCallback(response);
    });
}

window.fbAsyncInit = function () {
    FB.init({
        appId: '1626742007561184',
        cookie: true,  // enable cookies to allow the server to access
                       // the session
        xfbml: true,  // parse social plugins on this page
        version: 'v2.3' // use version 2.2
    });

    FB.getLoginStatus(function (response) {
        statusChangeCallback(response);
    });
};

// Load the SDK asynchronously
(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function testAPI() {
    FB.api('/me', function (response) {
        console.log('Successful login for: ' + response.name);

        name = response.name;
        userId = response.id;

        user = new Firebase(users + '/' + userId);
        user.set({name: name, id: userId});

        if (user != null) {
            user.onDisconnect().remove();
        }
        $('#start').show();
    });
}