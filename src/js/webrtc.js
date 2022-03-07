function connectToRoom(type, room) {
    connection = new RTCMultiConnection();     //participants
    if (connection) {
        connection.userid = userId;
        connection.session = {
            audio: true,
            video: true
        };
        if (type == 'part') {
            connection.connect(room);
            connection.join(room);
        }
        if (type == 'init') {
            connection.maxParticipantsAllowed = 6;   //here must be 6///
            connection.connect();
            connection.open(room);
        }
        connection.onstream = function (e) {
            var aktVid, aktTex;
            if (e.userid == userId) return true;
            for (var i = 0; i < 6; i++) {
                if (cubeSides[i] == -1) {
                    aktVid = 'vid' + i;
                    aktTex = 'videoTex' + i;
                    cubeSides[i] = e.userid;
                    mediaElements[i] = e.mediaElement;
                    streams[i] = e.stream;
                    if (mediaElements[i].mozSrcObject)
                        document.getElementById(aktVid).mozSrcObject = mediaElements[i].mozSrcObject;
                    if (mediaElements[i].src)
                        document.getElementById(aktVid).src = mediaElements[i].src;
                    document.getElementById(aktVid).play();
                    if (centerSide == i) {
                        mediaElements[i].muted = false;
                        document.getElementById(aktVid).muted = false;
                    } else {
                        mediaElements[i].muted = true;
                        document.getElementById(aktVid).muted = true;
                    }
                    break;
                }
            }
        };
    }
}
