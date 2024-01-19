var MainScene = pc.createScript('Main-Scene-Script');


var viewSphere, inputDownPos, inputMovePos, inputFurthestPos;
var inputHeld = false, hoveringZone = false, isTransitioning = false, handleTouch = false;
var transitionTime = 0, transitionSpeed = 3.0, currentViewIndex = 0, hoverID = 0;
var allZones = [], allImages = [];

var currentTex, transitionTex;

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
        text: "(drag to look around)",
        color: [0.9901,0.9901,0.9901],
        alignment: [0.5,0.5],
    });
    uiGroup.addChild(topText);
    topText.setLocalPosition(0,-105,0);

    //Device resize and orientation listeners
    window.addEventListener('resize', () => this.resizeMethod());
    window.addEventListener('orientationchange', () => this.resizeMethod());

    currentTex = assets.demoPanoramaTex.resource;
    transitionTex = assets.demoTransitionTex.resource;

    var shaderDefinition = {
        attributes: {
            vVertex: pc.SEMANTIC_POSITION,
            vNormal: pc.SEMANTIC_NORMAL,
            vTexCoord: pc.SEMANTIC_TEXCOORD0
        },
        vshader: assets.vs.resource,
        fshader: assets.fs.resource
    };
    viewShader = new pc.Shader(device, shaderDefinition);

    // viewSphere = new pc.Entity('view-sphere');
    // viewSphere.addComponent('render', {
    //     type: 'sphere'
    // });

    viewSphere = assets.viewSphereGLB.resource.instantiateRenderEntity({});

    app.root.addChild(viewSphere);
    viewSphere.setPosition(0,0,0);
    viewSphere.setLocalScale(100,100,100);
    viewSphere.setLocalEulerAngles(0,0,0);


    viewSphere.render.meshInstances[0].material = new pc.Material();
    viewSphere.render.meshInstances[0].material.shader = viewShader;
    viewSphere.render.meshInstances[0].material.setParameter('uMainMap', currentTex);
    viewSphere.render.meshInstances[0].material.setParameter('uTransitionMap', transitionTex);
    // viewSphere.render.meshInstances[0].material.colorMap = assets.demoPanoramaTex.resource;
    viewSphere.render.meshInstances[0].material.cull = pc.CULLFACE_FRONT;

    // app.on('update', dt => viewSphere.rotate(0 * dt, 10 * dt, 0 * dt));

    templateZone = new pc.Entity('template-zone');
    templateZone.addComponent('render', {
        type: 'plane'
    });

    for (let i = 0; i < 10; i++) {
        const newZone = templateZone.clone();

        newZone.render.meshInstances[0].material = new pc.BasicMaterial();
        newZone.render.meshInstances[0].material.colorMap = assets.zoneTex.resource;
        newZone.render.meshInstances[0].material.blendType = pc.BLEND_NORMAL;
        newZone.render.meshInstances[0].material.color = new pc.Color(1.0,1.0,1.0,0.5);

        newZone.setPosition(i * (i % 2 == 0 ? 1:-1),-1,-i);

        allZones.push(newZone);
        app.root.addChild(newZone);
    }

    
    allImages.push(assets.wp0.resource);
    allImages.push(assets.wp1.resource);
    allImages.push(assets.wp2.resource);
    // console.log(sceneJSON);

    this.startTransition(9);
};

var viewPitch = 0;
MainScene.prototype.onInputDown = function(event) {
    let inputPos = {x: handleTouch ? event.touches[0].x : event.x, y: handleTouch ? event.touches[0].y : event.y};
    inputDownPos.x = inputPos.x; inputDownPos.y = inputPos.y;
    inputMovePos.x = inputPos.x; inputMovePos.y = inputPos.y;
    inputFurthestPos.x = 0.0; inputFurthestPos.y = 0.0;

    inputMovePreviousFrame.x = inputMoveCurrentFrame.x; inputMovePreviousFrame.y = inputMoveCurrentFrame.y;
    inputMoveCurrentFrame.x = inputMovePos.x;           inputMoveCurrentFrame.y = inputMovePos.y;

    inputHeld = true;
};

MainScene.prototype.onInputMove = function(event) {
    let inputPos = {x: handleTouch ? event.touches[0].x : event.x, y: handleTouch ? event.touches[0].y : event.y};
    inputMovePos.x = inputPos.x; inputMovePos.y = inputPos.y;

    if(Math.abs(inputMovePos.x - inputDownPos.x) >= Math.abs(inputFurthestPos.x)) inputFurthestPos.x = (inputMovePos.x - inputDownPos.x);
    if(Math.abs(inputMovePos.y - inputDownPos.y) >= Math.abs(inputFurthestPos.y)) inputFurthestPos.y = (inputMovePos.y - inputDownPos.y);
};

MainScene.prototype.onInputUp = function(event) {
    let inputPos = {x: handleTouch ? event.changedTouches[0].x : event.x, y: handleTouch ? event.changedTouches[0].y : event.y};
    
    if(Math.abs(inputFurthestPos.y) < 10) { // Clicked
        if(hoveringZone){
            this.startTransition(1);
        }
    }
    inputDownPos.x = inputPos.x; inputDownPos.y = inputPos.y;
    inputMovePos.x = inputPos.x; inputMovePos.y = inputPos.y;
    inputFurthestPos.x = 0.0; inputFurthestPos.y = 0.0;
    if(!inputHeld) return;
    inputHeld = false;
};

var inputMoveCurrentFrame = {x:0,y:0}, inputMovePreviousFrame = {x:0,y:0};
MainScene.prototype.update = function(dt) {
    inputMovePreviousFrame.x = inputMoveCurrentFrame.x; inputMovePreviousFrame.y = inputMoveCurrentFrame.y;
    inputMoveCurrentFrame.x = inputMovePos.x;           inputMoveCurrentFrame.y = inputMovePos.y;

    
    let sens = handleTouch ? -0.02 : -0.0132;
    
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

    cameraPivot.setRotation(new pc.Quat().slerp(cameraPivot.getRotation(), targetPivotX.getRotation(), dt * 15));

    
    let hasHitZone = false;
    for (let i = 0; i < allZones.length; i++) {
        let zoneScreenPos = new pc.Vec3();
        let zonePos = allZones[i].getPosition();
        if(zonePos.y < -100) continue;
        camera.camera.worldToScreen(zonePos, zoneScreenPos);
        
        let underCursor = getDistance(inputMovePos, zoneScreenPos) < 60;
        if(underCursor){
            hasHitZone = true;
            hoverID = i;
        }
    }
    hoveringZone = hasHitZone;


    if(hoveringZone)
        document.body.style.cursor = "pointer";
    else
        document.body.style.cursor = inputHeld ? "grabbing" : "grab";

    if(isTransitioning){
        transitionTime += dt * transitionSpeed;
        if(transitionTime >= 1.0){
            currentTex = transitionTex;
            viewSphere.render.meshInstances[0].material.setParameter('uMainMap', currentTex);
            viewSphere.render.meshInstances[0].material.setParameter('uTransitionMap', transitionTex);
            isTransitioning = false;
        }
    }else{
        transitionTime = 0.0;
    }
    viewSphere.render.meshInstances[0].material.setParameter('transitionMix', transitionTime);
};

MainScene.prototype.placeSpots = function() {

};

MainScene.prototype.startTransition = function(speed) {
    if(isTransitioning) return;
    transitionSpeed = speed * 3.0;

    let hasSetNewID = false;
    let newViewIndex = 0;
    for (let i = 0; i < sceneJSON.length; i++) {
        if(sceneJSON[i].image_id != currentViewIndex) continue;
        for (let k = 0; k < allZones.length; k++){
            if(k == hoverID && !hasSetNewID){
                newViewIndex = sceneJSON[i].clickable_zones[hoverID].destination_id;
                transitionTex = allImages[newViewIndex];
                viewSphere.render.meshInstances[0].material.setParameter('uTransitionMap', transitionTex);
                hasSetNewID = true;
                console.log("New view ID: " + newViewIndex);
            }
        }
        for (let j = 0; j < allZones.length; j++) {
            if(j > sceneJSON[newViewIndex].clickable_zones.length - 1){
                allZones[j].setPosition(0,-200,0);
            }else{
                allZones[j].setPosition(
                    sceneJSON[i].clickable_zones[j].x,
                    sceneJSON[i].clickable_zones[j].y-1,
                    sceneJSON[i].clickable_zones[j].z);
            }
        }
    }
    currentViewIndex = newViewIndex;

    isTransitioning = true;

    console.log("Transition");
};

MainScene.prototype.resizeMethod = function() {

};

MainScene.prototype.swap = function(old) {

};

function clamp01(number, min, max) {
	return Math.max(min, Math.min(number, max));
}
function getDistance(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}