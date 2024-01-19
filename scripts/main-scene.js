var MainScene = pc.createScript('Main-Scene-Script');



var viewSphere, inputDownPos, inputMovePos, inputFurthestPos;
var inputHeld = false;


MainScene.prototype.initialize = function() {
    inputDownPos = {x: 0, y: 0};
    inputMovePos = {x: 0, y: 0};
    inputFurthestPos = {x: 0, y: 0};

    var touch = this.app.touch;
    handleTouch = touch != undefined;
    if(handleTouch){
        touch.on(pc.EVENT_TOUCHSTART, this.onInputDown, this);
        touch.on(pc.EVENT_TOUCHMOVE, this.onInputMove, this);
        touch.on(pc.EVENT_TOUCHEND, this.onInputUp, this);
        // app.graphicsDevice.maxPixelRatio = 2;
    } else {
        this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onInputDown, this);
        this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onInputMove, this);
        this.app.mouse.on(pc.EVENT_MOUSEUP, this.onInputUp, this);

        // this.app.keyboard.on(pc.EVENT_KEYDOWN, this.onKeyDown, this);
        // this.app.keyboard.on(pc.EVENT_KEYUP, this.onKeyUp, this);
        device.maxPixelRatio = window.devicePixelRatio;
    }

    const topText = new pc.Entity('toptext');
    topText.addComponent('element', {
        pivot: new pc.Vec2(0.5, 0.5),
        anchor: new pc.Vec4(0.5, 1, 0.5, 1),
        type: pc.ELEMENTTYPE_TEXT,
        font: assets.bpFont.resource,
        fontSize: 32,
        text: "Panoramic example for Lulu \n (drag to look around)",
        color: [0.9901,0.9901,0.9901],
        alignment: [0.5,0.5],
    });
    uiGroup.addChild(topText);
    topText.setLocalPosition(0,-105,0);

    //Device resize and orientation listeners
    window.addEventListener('resize', () => this.resizeMethod());
    window.addEventListener('orientationchange', () => this.resizeMethod());

    viewSphere = new pc.Entity();
    viewSphere.addComponent('render', {
        type: 'sphere'
    });
    app.root.addChild(viewSphere);
    viewSphere.setPosition(0,0,0);
    viewSphere.setLocalScale(10,10,10);
    viewSphere.setLocalEulerAngles(0,180,0);


    viewSphere.render.meshInstances[0].material = new pc.BasicMaterial();
    viewSphere.render.meshInstances[0].material.colorMap = assets.demoPanoramaTex.resource;
    viewSphere.render.meshInstances[0].material.cull = pc.CULLFACE_FRONT;

    // app.on('update', dt => viewSphere.rotate(0 * dt, 10 * dt, 0 * dt));

};

var viewPitch = 0;
MainScene.prototype.onInputDown = function(event) {
    let inputPos = {x: handleTouch ? event.touches[0].x : event.x, y: handleTouch ? event.touches[0].y : event.y};
    inputDownPos.x = inputPos.x; inputDownPos.y = inputPos.y;
    inputMovePos.x = inputPos.x; inputMovePos.y = inputPos.y;

    inputMovePreviousFrame.x = inputMoveCurrentFrame.x; inputMovePreviousFrame.y = inputMoveCurrentFrame.y;
    inputMoveCurrentFrame.x = inputMovePos.x;           inputMoveCurrentFrame.y = inputMovePos.y;

    inputHeld = true;
};

MainScene.prototype.onInputMove = function(event) {
    let inputPos = {x: handleTouch ? event.touches[0].x : event.x, y: handleTouch ? event.touches[0].y : event.y};
    inputMovePos.x = inputPos.x; inputMovePos.y = inputPos.y;
};

MainScene.prototype.onInputUp = function(event) {
    let inputPos = {x: handleTouch ? event.changedTouches[0].x : event.x, y: handleTouch ? event.changedTouches[0].y : event.y};
    inputDownPos.x = inputPos.x; inputDownPos.y = inputPos.y;
    inputMovePos.x = inputPos.x; inputMovePos.y = inputPos.y;
    if(!inputHeld) return;
    inputHeld = false;
};

var inputMoveCurrentFrame = {x:0,y:0}, inputMovePreviousFrame = {x:0,y:0};
MainScene.prototype.update = function(dt) {
    inputMovePreviousFrame.x = inputMoveCurrentFrame.x; inputMovePreviousFrame.y = inputMoveCurrentFrame.y;
    inputMoveCurrentFrame.x = inputMovePos.x;           inputMoveCurrentFrame.y = inputMovePos.y;

    
    let sens = 0.032;
    
    let xRot = (inputMovePreviousFrame.x - inputMoveCurrentFrame.x) * sens * 9.0;
    if(!inputHeld) xRot = 0;
    targetPivotY.rotate(0, xRot ,0);

    let yRot = (inputMovePreviousFrame.y - inputMoveCurrentFrame.y);
    if(!inputHeld) yRot = 0;
    viewPitch = clamp01(viewPitch + yRot * sens * 9.0, -89, 89);
    targetPivotX.setLocalEulerAngles(viewPitch,0,0);

    // targetXRot += (inputMovePreviousFrame.x - inputMoveCurrentFrame.x) * sens * 9.0;
    // targetXRot = clamp(targetXRot, -100, 100);
    // targetYRot += (inputMovePreviousFrame.y - inputMoveCurrentFrame.y) * sens * 9.0;
    // targetYRot = clamp(targetYRot, -cameraClampXY[1], cameraClampXY[1]);

    cameraPivot.setRotation(new pc.Quat().slerp(cameraPivot.getRotation(), targetPivotX.getRotation(), dt * 10));

    // console.log(inputMoveCurrentFrame);
};

MainScene.prototype.resizeMethod = function() {

};

MainScene.prototype.swap = function(old) {

};

function clamp01(number, min, max) {
	return Math.max(min, Math.min(number, max));
};