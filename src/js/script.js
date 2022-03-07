/**
 * Created by Hania on 2015-05-15.
 */

var room, roomInit, user, partnerId, name, userId, freeUser, end, firstUserInRoom, partner, connection, isStart,
    numberOfRoomParticipants, joinedToRoom, counterOfRooms, myInitData, myFreeInitData, streams, mediaElements, videos,
    textures, countOfMessages, dragXDown, dragYDown, dragXUp, dragYUp, prevX, prevY, cube, context, canvas, backCanvases,
    backContexts, renderer, camera, scene, topSide, bottomSide, leftSide, rightSide, hideSide, centerSide, cubeSides,
    isMouseDown, expanded, firstMove, actualAngle, sphere, shaders, uniforms, videosTags, horizontal, canvases, motion,
    motionInterval, interval, renderElement, angleRight, angleLeft, angleTop, angleBottom, intervalDrawGlasses, comp,
    glasses, ccvs;

/* Firebase url */
var url = 'https://intense-heat-663.firebaseio.com/',
    users = 'https://intense-heat-663.firebaseio.com/web/users',
    freeUsers = 'https://intense-heat-663.firebaseio.com/web/freeUsers',
    rooms = 'https://intense-heat-663.firebaseio.com/web/rooms/';

window.requestAnimFrame = (function () {     ////
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback, element) {
            window.setTimeout(callback, 1000 / 60);
        };
})();


function disconnectFirebase() {
    if (partner) {
        partner.once("value", function (partnerSnapshot) {
            if (partnerSnapshot.numChildren() == 1) {
                room.remove();
                partner.remove();
            }
        });
    } else if (freeUser) {
        freeUser.once("value", function (partnerSnapshot) {
            if (partnerSnapshot.numChildren() == 1) {
                room.remove();
                freeUser.remove();
            }
        });
    }
    if (myFreeInitData)
        myFreeInitData.remove();
    if (myInitData)
        myInitData.remove();
    if (room)
        room.off();
    if (roomInit)
        roomInit.off();
    if (partner)
        partner.off();
    if (freeUser)
        freeUser.off();
}

function displayChatMessage(name, text) {
    var time, div, spanName, spanTime, pText, lastMsg;
    countOfMessages++;
    time = new Date();
    div = document.createElement('div');
    spanName = document.createElement('span');
    spanName.textContent = name;
    spanName.setAttribute('class', 'name');
    div.appendChild(spanName);
    spanTime = document.createElement('span');
    spanTime.textContent = countdown(time).toString();
    spanTime.setAttribute('class', 'timeinterval');
    div.appendChild(spanTime);
    div.setAttribute('class', 'msg');
    pText = document.createElement('p');
    pText.textContent = text;
    div.appendChild(pText);
    lastMsg = document.getElementById('lastmsg').childNodes[0];
    document.getElementById('lastmsg').insertBefore(div, lastMsg);
    if (countOfMessages > 1) {
        document.getElementById('messagesDiv').insertBefore(lastMsg, document.getElementById('messagesDiv').childNodes[0]);
    }
    setInterval(function () {
        setTimeout(function () {
            div.removeChild(spanTime)
            spanTime.textContent = "    (" + countdown(time).toString() + ' ago)  ';
            div.insertBefore(spanTime, div.childNodes[1]);
        }, 5000);

    }, 5000);
}

function waitForTextMessage() {
    room.on('child_added', function (snapshot) {
        var message = snapshot.val();
        if (message.name != '') {
            displayChatMessage(message.name, message.text);
        }
    });
}

function setElementsOnDisconnect() {
    $('#login').show();
    $('#effects').hide();
    $('#messagesDiv').text("");
    $('#chat').hide();
    $('#start').show();
    document.getElementById('cube').removeChild(renderElement);
    document.getElementById('lastmsg').removeChild(document.getElementById('lastmsg').childNodes[0]);
    $('#messagesDiv').empty();
}

function setElementsOnConnect() {
    $('#search').hide();
    $('#messagesDiv').text("");
    $('#chat').show();
    $('#login').hide();
    $('#effects').show();
    $('#start').hide();
    $('#cube').show();
}

function waitForParticipants(randRoom) {
    var me, added;
    roomInit.on('child_added', function (snapshot) {
        if (snapshot.child('name').val() == '') {
            partnerId = snapshot.child('text').val();
            room = new Firebase(rooms + freeUser.key() + '2');
            added = new Firebase(rooms + freeUser.key() + '2/' + partnerId);
            added.set({name: "", text: userId});
            if (partnerId == userId) {
                me = added;
                if (me)
                    me.onDisconnect().remove();
            }
            if (firstUserInRoom == true) {
                connectToRoom('init', randRoom);
                waitForTextMessage();
                setElementsOnConnect();
                firstUserInRoom = false;
            }
        }
    });
}

function initiator() {
    var rand, randRoom;
    rand = Math.floor(100000 * Math.random());
    randRoom = userId + "" + rand;
    freeUser = new Firebase(freeUsers + "/" + userId + rand);
    roomInit = new Firebase(rooms + freeUser.key());
    myInitData = roomInit.push({name: '', text: userId});
    if (myInitData)
        myInitData.onDisconnect().remove();
    myFreeInitData = freeUser.push({id: userId});
    if (myFreeInitData)
        myFreeInitData.onDisconnect().remove();
    firstUserInRoom = true;
    waitForParticipants(randRoom);
    removeUserFromCube(freeUser);
}

function initVariables() {
    streams = new Array(6);
    mediaElements = new Array(6);
    motionInterval = new Array(6);
    motion = new Array(6);
    cubeSides = new Array(6);
    canvases = new Array(6);
    backCanvases = new Array(6);
    comp = new Array(6);
    ccvs = new Array(6)
    videosTags = new Array(6);
    context = new Array(6);
    backContexts = new Array(6);
    intervalDrawGlasses = new Array(6);
    glasses = new Image();
    //glasses.src = glasses.src || glasses.mozSrcObject;
    glasses.src = '/src/images/glasses.png';
    expanded = false;
    end = false;
    joinedToRoom = false;
    isMouseDown = false;
    isStart = true;
    counterOfRooms = 0;
    centerSide = 0;
    countOfMessages = 0;
}

function sendMessageOnClickOnButton() {
    if (!end) {
        var text = $('#messageInput').val();
        room.push({name: name, text: text});
        $('#messageInput').val('');
    }
}

function onStopClick() {
    connection.leave();
    connection.disconnect();
    for (var i = 0; i < 6; i++) {
        if (streams[i]) {
            //streams[i].stop();

            if (typeof mediaElements[i].mozSrcObject != 'undefined') {
                mediaElements[i].mozSrcObject = null;
                document.getElementById("vid" + i).mozSrcObject = null;
            }
            else {
                mediaElements[i].src = "";
                document.getElementById("vid" + i).src = "";
            }
        }
    }
    end = true;
    isStart = false;
    clearInterval(interval);
    disconnectFirebase();
    setElementsOnDisconnect();
}

function onSlideClick() {
    $("#messagesDiv").slideToggle("slow");
    if (expanded) {
        expanded = false;
        $('#slideSpan').removeClass("glyphicon glyphicon-triangle-top");
        $('#slideSpan').addClass("glyphicon glyphicon-triangle-bottom");
    } else {
        expanded = true;
        $('#slideSpan').removeClass("glyphicon glyphicon-triangle-bottom");
        $('#slideSpan').addClass("glyphicon glyphicon-triangle-top");
    }
}

function searchRoom(snapshot, childSnapshot) {
    var textRoom;
    if (joinedToRoom) return true;

    counterOfRooms++;
    partnerId = childSnapshot.key();
    room = new Firebase(rooms + partnerId + '2');
    roomInit = new Firebase(rooms + partnerId);
    partner = new Firebase(freeUsers + '/' + partnerId + '/');
    textRoom = new Firebase(rooms + partnerId + '2/' + userId);

    if (textRoom)
        textRoom.onDisconnect().remove();

    partner.once("value", function (partnerSnapshot) {
        numberOfRoomParticipants = partnerSnapshot.numChildren();
        if (numberOfRoomParticipants < 6) {
            joinedToRoom = true;
            myInitData = roomInit.push({name: '', text: userId});
            if (myInitData)
                myInitData.onDisconnect().remove();
            waitForTextMessage();
            setElementsOnConnect();
            connectToRoom('part', partnerId);
            return true;

        } else if (counterOfRooms == snapshot.numChildren()) {
            initiator();
        }
    });
    if (partner)
        myFreeInitData = partner.push({id: userId});
    if (myFreeInitData)
        myFreeInitData.onDisconnect().remove();
    removeUserFromCube(partner);
}

function onStartClick() {
    initVariables();
    initCube();
    initCanvases();

    var allRooms = new Firebase(freeUsers);
    allRooms.once("value", function (snapshot) {
        if (snapshot.hasChildren()) {
            snapshot.forEach(function (childSnapshot) {
                searchRoom(snapshot, childSnapshot);
            });
        } else
            initiator();
    });
}

function main() {
    $('#start').click(onStartClick);

    $('#sepia').click(sepiaFilter);

    $('#normal').click(noSepiaFilter);

    $('#motionTracking').click(onMotionTrackingClick);

    $('#messageInput').keypress(function (e) {
        if (e.keyCode == 13) {
            var text = $('#messageInput').val();
            room.push({name: name, text: text});
            $('#messageInput').val('');
        }
    });

    $('#send').click(sendMessageOnClickOnButton);

    $('#stop').click(onStopClick);

    $('#slide').click(onSlideClick);
}

$(document).ready(main);
