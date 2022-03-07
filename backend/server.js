/**
 * Created by Hania on 2015-05-15.
 */
"use strict";

process.title = 'node-chat';

var webSocketsServerPort = (process.env.PORT || 5000);

var webSocketServer = require('websocket').server;
var http = require('http');
var fs = require('fs');
var index = fs.readFileSync('src/index.html');
var script = fs.readFileSync('src/js/script.js');
var rtc = fs.readFileSync('src/js/webrtc.js');
var facebook = fs.readFileSync('src/js/facebookLogin.js');
var css = fs.readFileSync('src/css/style.css');
var icons = fs.readFileSync('src/css/ionicons.css');
var webgl = fs.readFileSync('src/js/webgl.js');
var threejs = fs.readFileSync('src/js/lib/three.min.js');
var countdown = fs.readFileSync('src/js/lib/countdown.js');
var countdownmin = fs.readFileSync('src/js/lib/countdown.min.js');
var webrtc = fs.readFileSync('src/js/lib/RTCMultiConnection.js');
var face = fs.readFileSync('src/js/lib/face.js');
var ccv = fs.readFileSync('src/js/lib/ccv.js');
var glasses = fs.readFileSync('src/images/glasses.png');
var stars = fs.readFileSync('src/images/galaxy.png');
var clients = [];

/**
 * HTTP server
 */
var server = http.createServer(function (req, res) {
    var status;
    var type;
    var file = null;
    switch (req.url) {
        case "/":
        case "/src/index.html":
            file = index;
            status = 200;
            type = "text/html";
            break;
        case "/src/js/script.js":
        file = script;
        status = 200;
        type = "text/javascript";
        break;
        case "/src/js/lib/ccv.js":
            file = ccv;
            status = 200;
            type = "text/javascript";
            break;
        case "/src/js/lib/RTCMultiConnection.js":
            file = webrtc;
            status = 200;
            type = "text/javascript";
            break;
        case "/src/images/glasses.png":
            file = glasses;
            status = 200;
            type = "image";
            break;
        case "/src/images/galaxy.png":
            file = stars;
            status = 200;
            type = "image";
            break;
        case "/src/js/lib/face.js":
            file = face;
            status = 200;
            type = "text/javascript";
            break;
        case "/src/js/facebookLogin.js":
            file = facebook;
            status = 200;
            type = "text/javascript";
            break;
        case "/src/js/webrtc.js":
            file = rtc;
            status = 200;
            type = "text/javascript";
            break;
        case "/src/js/lib/three.min.js":
            file = threejs;
            status = 200;
            type = "text/javascript";
            break;
        case "/src/js/webgl.js":
            file = webgl;
            status = 200;
            type = "text/javascript";
            break;
        case "/src/js/lib/countdown.js":
            file = countdown;
            status = 200;
            type = "text/javascript";
            break;
        case "/src/js/lib/countdown.min.js":
            file = countdownmin;
            status = 200;
            type = "text/javascript";
            break;
        case "/src/css/style.css":
            file = css;
            status = 200;
            type = "text/css";
            break;
        case "/src/css/ionicons.css":
            file = icons;
            status = 200;
            type = "text/css";
            break;

        default:
            status = 404;
            type = "text/plain";
    }
    res.writeHead(status, {'Content-Type': type});
    if (file !== null) {
        res.end(file);
    } else {
        res.end();
    }
});

server.listen(webSocketsServerPort, function () {
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});

/**
 * WebSocket server
 */
var wsServer = new webSocketServer({
    // WebSocket server is tied to a HTTP server. WebSocket request is just
    // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
    httpServer: server
});

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function (request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

    // accept connection - you should check 'request.origin' to make sure that
    // client is connecting from your website
    // (http://en.wikipedia.org/wiki/Same_origin_policy)
    var connection = request.accept(null, request.origin);
    // we need to know client index to remove them on 'close' event
    var index = clients.push(connection) - 1;
    var userName = false;
    var userColor = false;

    // user sent some message
    connection.on('message', function (message) {
        if (message.type === 'utf8') { // accept only text
            console.log(message.utf8Data);
            var json = message.utf8Data;
            for (var i = 0; i < clients.length; i++) {
                clients[i].sendUTF(json);
            }
        }
    });

    // user disconnected
    connection.on('close', function (connection) {
        console.log("DISCONNECTED");
    });
});
