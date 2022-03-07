/**
 * Created by Hania on 2015-06-01.
 */
function refresh() {
    for (var j = 0; j < 6; j++) {
        if (videos[j] != null) {
            if (videos[j].readyState === videos[j].HAVE_ENOUGH_DATA) {
                if (textures[j]) textures[j].needsUpdate = true;
            }
        }
    }
    renderer.clear();
    renderer.render(scene, camera);
    requestAnimFrame(function () {
        refresh();
    });
}

function createSphere() {
    var sphereGeometry = new THREE.SphereGeometry(100, 100, 40);
    sphereGeometry.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));
    var sphereMaterial = new THREE.MeshPhongMaterial({
        map: THREE.ImageUtils.loadTexture('/src/images/galaxy.png',
            THREE.SphericalRefractionMapping)
    });
    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);
}

function createCube() {
    var cubeGeometry = new THREE.CubeGeometry(15, 15, 15);
    var cubeMaterial = new THREE.MeshFaceMaterial(shaders);
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    var yAxis = new THREE.Vector3(0, 1, 0);
    rotateAroundWorldAxis(cube, yAxis, -Math.PI / 2);
    initSides();
    scene.add(cube);
}

function createTextures() {
    videos = [];
    textures = [];
    shaders = new Array(6);
    uniforms = new Array(6);
    for (var j = 0; j < 6; j++) {
        cubeSides[j] = -1;
        motion[j] = false;
        videos[j] = document.getElementById('output' + j);
        textures[j] = new THREE.Texture(videos[j]);
        uniforms[j] = {
            filter: {type: 'i', value: 0},
            tex: {type: 't', value: textures[j]}
        };
        shaders[j] = new THREE.ShaderMaterial({
            uniforms: uniforms[j],
            vertexShader: document.getElementById('vertShader' + j).text,
            fragmentShader: document.getElementById('fragShader' + j).text
        });
    }
}

function createRenderer() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(1138, 600);
    renderElement = document.getElementById("cube").appendChild(renderer.domElement);
    camera = new THREE.PerspectiveCamera(45, 1178 / 600, 1, 1000);
    camera.position.z = 50;
    scene = new THREE.Scene();
}

function addLight() {
    var ambientLight = new THREE.AmbientLight(0xFFFFFF);
    scene.add(ambientLight);
    var directionalLight = new THREE.DirectionalLight(0xFFFFFF);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);
}

function initSides() {
    centerSide = 0;  //pink
    leftSide = 4; //blue
    rightSide = 5;   //black
    topSide = 2; //yellow
    bottomSide = 3;    //red
    hideSide = 1; //green
}

function initCube() {
    createTextures();
    createRenderer();
    createSphere();
    createCube();
    addLight();
    refresh();
}

function rotateAroundWorldAxis(object, axis, radians) {
    if (object != null) {
        var rotWorldMatrix = new THREE.Matrix4();
        rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
        rotWorldMatrix.multiply(object.matrix);
        object.matrix = rotWorldMatrix;
        object.rotation.setEulerFromRotationMatrix(object.matrix);
    }
}

function move(cube, sphere, direction, counter, mouseUp) {
    var angle = counter;
    var newCounter = counter - angle;
    var yAxis = new THREE.Vector3(0, 1, 0);
    var xAxis = new THREE.Vector3(1, 0, 0);
    if (direction == 1) {
        rotateAroundWorldAxis(cube, yAxis, angle);
        if (!mouseUp)
            rotateAroundWorldAxis(sphere, yAxis, angle);
    } else if (direction == 2) {
        rotateAroundWorldAxis(cube, yAxis, -angle);
        if (!mouseUp)
            rotateAroundWorldAxis(sphere, yAxis, -angle);
    } else if (direction == 3) {
        rotateAroundWorldAxis(cube, xAxis, angle);
        if (!mouseUp)
            rotateAroundWorldAxis(sphere, xAxis, angle);
    } else if (direction == 4) {
        rotateAroundWorldAxis(cube, xAxis, -angle);
        if (!mouseUp)
            rotateAroundWorldAxis(sphere, xAxis, -angle);
    }
    renderer.clear();
    renderer.render(scene, camera);
    if (newCounter > 0) {
        move(direction, newCounter, mouseUp);
    }
}

function oneMoving(actualDiff, direction) {
    var angle = (Math.PI / 200) * actualDiff;
    switch (direction) {
        case 1:
            angleRight += angle;
            break;
        case 2:
            angleLeft += angle;
            break;
        case 3:
            angleBottom += angle;
            break;
        case 4:
            angleTop += angle;
            break;
    }
    actualAngle += angle;
    move(cube, sphere, direction, angle, false);
}

function setSides(direction) {
    var tempSide = centerSide;
    if (direction == 1) {
        centerSide = leftSide;
        leftSide = hideSide;
        hideSide = rightSide;
        rightSide = tempSide;
    }
    if (direction == 2) {
        centerSide = rightSide;
        rightSide = hideSide;
        hideSide = leftSide;
        leftSide = tempSide;
    }
    if (direction == 3) {
        centerSide = topSide;
        topSide = hideSide;
        hideSide = bottomSide;
        bottomSide = tempSide;
    }
    if (direction == 4) {
        centerSide = bottomSide;
        bottomSide = hideSide;
        hideSide = topSide;
        topSide = tempSide;
    }
    var vidNotMute = document.getElementById("vid" + centerSide);
    if (mediaElements[centerSide]) {
        vidNotMute.muted = false;
        mediaElements[centerSide].muted = false;
    }
    var vidMute = document.getElementById("vid" + tempSide);
    if (mediaElements[tempSide]) {
        vidMute.muted = true;
        mediaElements[tempSide].muted = true;
    }
}

function mouseDown(event) {
    if (!isStart) return true;
    isMouseDown = true;
    firstMove = true;
    actualAngle = 0;
    angleBottom = 0;
    angleLeft = 0;
    angleRight = 0;
    angleTop = 0;
    dragXDown = event.clientX;
    dragYDown = event.clientY;
}

function mouseMove(event) {
    if (isMouseDown) {
        var actualX = event.clientX;
        var actualY = event.clientY;
        var diffX = actualX - dragXDown;
        var diffY = actualY - dragYDown;
        var angle, actualDiffX, actualDiffY;

        if ((Math.abs(diffX) <= 20) && (Math.abs(diffY) <= 20)) {
            prevX = actualX;
            prevY = actualY;
            return true;
        }
        if (firstMove == true) {
            if (Math.abs(diffX) > Math.abs(diffY)) {
                horizontal = true;
            } else {
                horizontal = false;
            }
            firstMove = false;
        }
        if (horizontal) {
            actualDiffX = actualX - prevX;
            prevX = actualX;
            if (diffX > 0) {                            //right
                oneMoving(actualDiffX, 1);
            } else {
                oneMoving(-actualDiffX, 2);              //left
            }
        } else {
            actualDiffY = actualY - prevY;
            prevY = actualY;
            if (diffY > 0) {                            //down
                oneMoving(actualDiffY, 3);
            } else {                                   //up
                oneMoving(-actualDiffY, 4);
            }
        }
    }
}

function movingOnMouseUp(differenceAngle, direction1, direction2) {
    var countOfRotatedSides = Math.floor(Math.abs(differenceAngle) / (Math.PI / 2));
    var angleOnLastSide = Math.abs(differenceAngle) - (countOfRotatedSides * (Math.PI / 2));
    var angleFailedOnLastSide = (Math.PI / 2) - angleOnLastSide;
    var countOfChangedSides = Math.round(Math.abs(differenceAngle) / (Math.PI / 2));

    for (var i = 0; i < countOfChangedSides; i++)
        setSides(direction1);
    if (angleOnLastSide < (angleFailedOnLastSide)) {
        move(cube, sphere, direction2, angleOnLastSide, true);
    } else {
        move(cube, sphere, direction1, angleFailedOnLastSide, true);
    }
}

function mouseUp(event) {
    if (!isMouseDown) return true;
    isMouseDown = false;
    firstMove = false;
    dragXUp = event.clientX;
    dragYUp = event.clientY;
    var diffX = dragXUp - dragXDown;
    var diffY = dragYUp - dragYDown;
    if ((Math.abs(diffX) < 20) && (Math.abs(diffY) < 20)) return true;

    if (horizontal) {
        if (angleRight - angleLeft > 0) {
            var differenceAngle = angleRight - angleLeft;
            movingOnMouseUp(differenceAngle, 1, 2);
        } else {
            var differenceAngle = angleLeft - angleRight;
            movingOnMouseUp(differenceAngle, 2, 1);
        }
    } else {
        if (angleBottom - angleTop > 0) {
            var differenceAngle = angleBottom - angleTop;
            movingOnMouseUp(differenceAngle, 3, 4);
        } else {
            var differenceAngle = angleTop - angleBottom;
            movingOnMouseUp(differenceAngle, 4, 3);
        }
    }
}

function drawVideosToCanvases() {
    for (var i = 0; i < 6; i++) {
        var ctx = context[i];
        if ((videosTags[i].mozSrcObject != '') || (videosTags[i].src != ''))
            ctx.drawImage(videosTags[i], 0, 0, canvases[i].width, canvases[i].height);
    }
}

function initCanvases() {
    for (var i = 0; i < 6; i++) {
        videosTags[i] = document.getElementById('vid' + i);
        canvases[i] = document.querySelector('#output' + i);
        context[i] = canvases[i].getContext('2d');
        canvases[i].width = videosTags[i].width;
        canvases[i].height = videosTags[i].height;
        backCanvases[i] = document.getElementById('backcanvas' + i);
        backContexts[i] = backCanvases[i].getContext('2d');
        backCanvases[i].width = videosTags[i].width / 4;
        backCanvases[i].height = videosTags[i].height / 4;
    }
    interval = setInterval(function () {
        drawVideosToCanvases();
    }, 16);
}

function drawGlassesToCanvas(actualSide) {
    var m = 4,
        w = 4,
        i,
        compAct,
        ctx = context[actualSide],
        backCtx = backContexts[actualSide],
        video = videosTags[actualSide];

    backCtx.drawImage(video, 0, 0, backCanvases[actualSide].width, backCanvases[actualSide].height);
    compAct = ccv.detect_objects(ccvs[actualSide] = ccvs[actualSide] || {
        canvas: backCanvases[actualSide],
        cascade: cascade,
        interval: 4,
        min_neighbors: 1
    });

    if (compAct.length) {
        comp[actualSide] = compAct;
    }
    if (comp[actualSide]) {
        for (i = comp[actualSide].length; i--;) {
            ctx.drawImage(glasses, (comp[actualSide][i].x - w / 2) * m, (comp[actualSide][i].y - w / 2) * m,
                (comp[actualSide][i].width + w) * m, (comp[actualSide][i].height + w) * m);
        }
    }
}

function startMotionTracking() {
    var video = document.getElementById('vid' + centerSide);
    var backCanvas = document.getElementById('backcanvas' + centerSide);
    var canvas = document.querySelector('#output' + centerSide);
    var backContext;
    var firstEvent = true;
    var actualSide = centerSide;
    if (firstEvent) {
        firstEvent = false;
        video.play();
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        backCanvas.width = video.videoWidth / 4;
        backCanvas.height = video.videoHeight / 4;
        backContext = backCanvas.getContext('2d');
        var w = 300 / 4 * 0.8,
            h = 270 / 4 * 0.8;
        comp[actualSide] = [{
            x: (video.videoWidth / 4 - w) / 2,
            y: (video.videoHeight / 4 - h) / 2,
            width: w,
            height: h
        }];
        intervalDrawGlasses[actualSide] = setInterval(function () {
            drawGlassesToCanvas(actualSide);
        }, 16);
    }

    if (typeof video.mozSrcObject != 'undefined') {
        video.mozSrcObject = document.getElementById('vid' + actualSide).mozSrcObject;
        video.play();
    }
    else {
        video.src = document.getElementById('vid' + actualSide).src;
        video.play();
    }
}

function removeUserFromCube(object) {
    object.on('child_removed', function (snapshot) {
        for (var i = 0; i < 6; i++) {
            if (cubeSides[i] == snapshot.val().id) {
                aktVid = 'vid' + i;
                aktTex = 'videoTex' + i;
                cubeSides[i] = -1;
                if (typeof document.getElementById('vid' + i).mozSrcObject != 'undefined') {
                    document.getElementById('vid' + i).mozSrcObject = null;
                    mediaElements[i].mozSrcObject = null;
                }
                break;
            }
        }
    });
}

function sepiaFilter() {
    uniforms[centerSide].filter.value = 1;
}

function noSepiaFilter() {
    uniforms[centerSide].filter.value = 0;
}

function onMotionTrackingClick() {
    if (motion[centerSide]) {
        motion[centerSide] = false;
        clearInterval(intervalDrawGlasses[centerSide]);
    } else {
        motion[centerSide] = true;
        startMotionTracking();
    }
}

