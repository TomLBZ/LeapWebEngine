import {System} from './System.js';
import {COMP_GEN_TYPES} from '../component/GeneralComponents.js';
import { KEYS } from "../constants/Keys.js";

// TransformUpdateSystem.js 继承 System
// - 签名 (rigidbody组件，transform组件*)
// RigidBodyUpdateSystem.js 继承 System
// - 签名 (force组件，rigidbody组件*)
// BuildWorldSDFColliderSystem.js 继承 System
// - 签名 (sdfCollider组件, worldSDFCollider组件*)
// https://github.com/flecs-hub/flecs-systems-physics/blob/master/src/physics.c
// SphereCollisionTestingSystem.js 继承 System
// - 签名 (sphereCollider组件, worldSDFCollider组件, transform组件*, rigidbody组件*, force组件*)
// ResetWorldSDFColliderSystem.js 继承 System
// - 签名 (worldSDFCollider组件*)
// WorldSDFRenderingSystem.js 继承 System
// - 签名 (worldSDFRenderer组件)
// BatchingWorldSDFRenderSystem 继承 system
// - 签名 (sdfRender组件, worldSDFRenderer组件*)
// InputSystem.js 继承 System
// - 签名 (input组件)

export class TransformUpdateSystem extends System{
    constructor(){
        super();
        this.addParamSign(COMP_GEN_TYPES.RIGIDBODY);
        this.addParamSign(COMP_GEN_TYPES.TRANSFORM);
        this.addParamSign(COMP_GEN_TYPES.GLOBAL_PHYSICS_PARAM);
    }
    update(rigidbodyComp, transformComp, globalPhysicsComp) {
        //向量运算，更新transform
        transformComp.position += globalPhysicsComp.deltaTime * rigidbodyComp.velocity;
        
    }
}

export class RigidBodyUpdateSystem extends System{
    constructor(){
        super();
        this.addParamSign(COMP_GEN_TYPES.FORCE);
        this.addParamSign(COMP_GEN_TYPES.RIGIDBODY);
    }
    update(forceComp, rigidbodyComp, deltaTime) {
        //向量运算，更新rigidbody
    }
}

export class BuildWorldSDFColliderSystem extends System{
    constructor(){
        super();
        this.addParamSign(COMP_GEN_TYPES.SDF_COLLIDER);
        this.addParamSign(COMP_GEN_TYPES.WORLD_SDF_COLLIDER);
    }
    update(sdfColliderComp, worldSdfColliderComp) {
        //将SDF加入worldSDF集合
        worldSdfColliderComp.sdfLists.push(sdfColliderComp);
    }
}


export class SphereCollisionTestingSystem extends System{
    constructor(){
        super();
        this.addParamSign(COMP_GEN_TYPES.SPHERE_COLLIDER);
        this.addParamSign(COMP_GEN_TYPES.WORLD_SDF_COLLIDER);
        this.addParamSign(COMP_GEN_TYPES.TRANSFORM);
        this.addParamSign(COMP_GEN_TYPES.RIGIDBODY);
        this.addParamSign(COMP_GEN_TYPES.FORCE);
    }

    update(sphereColComp, worldColComp, transformComp, rigidbodyComp, forceComp) {
        let {radius} = sphereColComp;
        let {position, rotation} = transformComp;
        let {mass, velocity, w} = rigidbodyComp;
        let {force, torque} = forceComp;
        //TODO: 
        // 1. 计算position处的SDF，与radius相比，看是否相交；
        // 2. 若相交，求position处SDF的微分，此处应当为碰撞点法向；
        // 3. 看速度与法向，是否构成反弹，若构成反弹，更新速度；
        // 4. 看角速度与法向，更新摩擦力和力矩；
        // 5. 看相交深度和速度方向，更新位置。   
    }
}

export class ResetWorldSDFColliderSystem extends System{
    constructor(){
        super();
        //this.addParamSign(COMP_GEN_TYPES.WORLD_SDF_COLLIDER);   
    }
    update(worldSDFColComp) {
        worldSDFColComp.sdfLists.splice(0);
    }
}


export class WorldSDFRenderingSystem extends System{
    constructor(renderingCallback){ //renderingCallback: (uniformData, camera) -> void
        super();
        this.addParamSign(COMP_GEN_TYPES.CAMERA);  
        this.addParamSign(COMP_GEN_TYPES.WORLD_SDF_RENDERER);   
        this.renderingCallback = renderingCallback;
    }
    update(cameraComp, worldSDFRenderComp) {
        console.log("# WorldSDFRenderingSystem update.");
        let uniformData = worldSDFRenderComp.uniformData;
        let camera = cameraComp.camera;
        this.renderingCallback(uniformData, camera);
    }
}

export class InputSystem extends System{
    constructor(window, canvas){
        super();
        this.addParamSign(COMP_GEN_TYPES.INPUT); 
        //keyboard listener
        window.addEventListener("keydown", this.RedirectKeydownEvent.bind(this));
        window.addEventListener("keyup", this.RedirectKeyupEvent.bind(this));
        this.Left = false;
        this.Right = false;
        this.Up = false;
        this.Down = false;
        this.In = false;
        this.Out = false;
        this.Pause = false;
        this.Start = false;
        this.Control = false;
        //mouse listener
        this.degYaw = 0.;
        this.degPitch = 0.;
        this.degRange = 90.;
        this.LeftButton = false;
        this.RightButton = false;
        this.MiddleButton = false;
        this.Locked = false;
        this.BaseWindow = window;
        this.Canvas = canvas;
        this.Canvas.requestPointerLock = this.Canvas.requestPointerLock || this.Canvas.mozRequestPointerLock;
        document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
        this.Canvas.onclick = function() {canvas.requestPointerLock();}
        document.addEventListener('pointerlockchange', this.lockChangeAlert.bind(this), false);
        document.addEventListener('mozpointerlockchange', this.lockChangeAlert.bind(this), false);
        this.BaseWindow.addEventListener("mousemove", this.RedirectMousemoveEvent.bind(this));
        this.BaseWindow.addEventListener("mousedown", this.RedirectMousedownEvent.bind(this));
        this.BaseWindow.addEventListener("mouseup", this.RedirectMouseupEvent.bind(this));
    }
    //keyboard events
    RedirectKeydownEvent(event){
        event.preventDefault();
        return this.RedirectKeyEvents(event, true);
    }
    RedirectKeyupEvent(event){
        event.preventDefault();
        return this.RedirectKeyEvents(event, false);
    }
    RedirectKeyEvents(event, isdown){
        switch (event.keyCode) {
            case KEYS.UP:
                this.Up = isdown;
                break;
            case KEYS.DOWN:
                this.Down = isdown;
                break;
            case KEYS.LEFT:
                this.Left = isdown;
                break;
            case KEYS.RIGHT:
                this.Right = isdown;
                break;
            case KEYS.W:
                this.Up = isdown;
                break;
            case KEYS.S:
                this.Down = isdown;
                break;
            case KEYS.A:
                this.Left = isdown;
                break;
            case KEYS.D:
                this.Right = isdown;
                break;
            case KEYS.LSHIFT:
                this.In = isdown;
                break;
            case KEYS.SPACE:
                this.Out = isdown;
                break;
            case KEYS.ESC:
                this.Pause = true;
                this.Start = false;
                break;
            case KEYS.RETURN:
                this.Start = isdown;
                this.Pause = false;
                break;
            case KEYS.LCTRL:
                this.Control = isdown;
                break;
            default:
                break;
        }
    }
    //mouse events
    lockChangeAlert() {
        var that = this;
        if(document.pointerLockElement===this.Canvas||document.mozPointerLockElement===this.Canvas){
            console.log('The pointer lock status is now locked');
            this.Locked = true;
            document.addEventListener("mousemove", that.RedirectMousemoveEvent.bind(that), false);
        } else {
            console.log('The pointer lock status is now unlocked');  
            this.Locked = false;
            document.removeEventListener("mousemove", that.RedirectMousemoveEvent.bind(that), false);
        }
    }
    RedirectMousemoveEvent(event){
        var dx = event.movementX || event.mozMovementX || 0;
        var dy = event.movementY || event.mozMovementY || 0;
        this.degYaw = -dx * this.degRange / this.BaseWindow.innerHeight;
        this.degPitch = dy * this.degRange / this.BaseWindow.innerWidth;
    }
    RedirectMousedownEvent(event){return this.RedirectMouseEvents(event, true);}
    RedirectMouseupEvent(event){return this.RedirectMouseEvents(event, false);}
    RedirectMouseEvents(event, isdown){
        switch (event.button) {
            case MOUSE_VALUES.LEFT:
                this.LeftButton = isdown;
                break;
            case MOUSE_VALUES.RIGHT:
                this.RightButton = isdown;
                break;
            case MOUSE_VALUES.MIDDLE:
                this.MiddleButton = isdown;
                break;
            default:
                break;
        }
    }
    //update once input fields
    update(inputComp) {
        let keyState = inputComp.keyStates;
        let mouseState = inputComp.mouseStates;
        keyState["left"] = this.Left;
        keyState["right"] = this.Right;
        keyState["up"] = this.Up;
        keyState["down"] = this.Down;
        keyState["in"] = this.In;
        keyState["out"] = this.Out;
        keyState["pause"] = this.Pause;
        keyState["start"] = this.Start;
        keyState["control"] = this.Control;
        mouseState["left"] = this.LeftButton;
        mouseState["right"] = this.RightButton;
        mouseState["middle"] = this.MiddleButton;
        mouseState["yaw"] = this.degYaw;
        mouseState["pitch"] = this.degPitch;
    }
}

export default {
    TransformUpdateSystem,
    RigidBodyUpdateSystem,
    BuildWorldSDFColliderSystem,
    SphereCollisionTestingSystem,
    ResetWorldSDFColliderSystem,
    WorldSDFRenderingSystem,
    InputSystem,
}