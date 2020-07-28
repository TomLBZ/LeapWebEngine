import {System} from './System.js';
import {GENERAL_SIGNS, SINGLETON_SIGNS} from '../constants/SignTypes.js';
import { KEYS } from "../constants/Keys.js";
import { MOUSE_BUTTON } from "../constants/Mouse.js";
import {VectorFunctions, MatrixFunctions} from "../math/Vector.js";
import { CAM_DEFAULTS, PHYSICS_DEFAULTS } from '../constants/GameDefault.js';
import { SDF_DICT, SDF_ID, SDF_OpWrapper, SDF_Wrapper, SDF_Generalfuncs } from "../sdf.js";
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

export class GravitationSystem extends System{
    constructor(){
        super();
        this.addParamSign(SINGLETON_SIGNS.WORLD_GRAVITY_TO_PLANE);
        this.addParamSign(GENERAL_SIGNS.FORCES);
        this.addParamSign(GENERAL_SIGNS.TRANSFORM);
    }
    update(gplaneComp, forcesComp, transformComp){
        let pos = transformComp.position;
        let norm = VectorFunctions.vecNormalize(gplaneComp.planeNormalDirection);
        let rpt = gplaneComp.planeReferencePoint;
        let disp = VectorFunctions.vecMinus(rpt, pos);
        let dot = VectorFunctions.vecDot(disp, norm);
        let coeff = SDF_Generalfuncs.sigmoid(dot, 0.0, 4.0);
        let gforce = VectorFunctions.vecScale(norm, coeff * PHYSICS_DEFAULTS.G);
        forcesComp.force = VectorFunctions.vecAdd(forcesComp.force, gforce);
        //console.log("# G = ", VectorFunctions.vecLength(gforce));
    }
}

export class TransformUpdateSystem extends System{
    constructor(){
        super();
        this.addParamSign(GENERAL_SIGNS.RIGIDBODY);
        this.addParamSign(GENERAL_SIGNS.TRANSFORM);
        this.addParamSign(SINGLETON_SIGNS.GLOBAL_PHYSICS_PARAM);
        this.addParamSign(SINGLETON_SIGNS.CAMERA);
    }
    update(globalPhysicsComp, cameraComp, rigidbodyComp, transformComp) {
        //向量运算，更新transform
        let M = MatrixFunctions.YawPitchMat4(transformComp.rotation[0],transformComp.rotation[1]);
        let v = VectorFunctions.vec4To3(MatrixFunctions.mat4MultVec(M,VectorFunctions.vec3To4(rigidbodyComp.velocity,0)));
        transformComp.position = VectorFunctions.vecAdd(transformComp.position,VectorFunctions.vecScale(v,globalPhysicsComp.deltaTime));
        transformComp.position = VectorFunctions.vecAdd(transformComp.position,VectorFunctions.vecScale(rigidbodyComp.velocity,globalPhysicsComp.deltaTime));
        cameraComp.camera.pos = transformComp.position;
        transformComp.rotation[0] = cameraComp.yaw;
        transformComp.rotation[1] = cameraComp.pitch;
        cameraComp.camera.yawPitch(transformComp.rotation[0],transformComp.rotation[1]);
    }
}

export class RigidBodyUpdateSystem extends System{
    constructor(){
        super();
        this.addParamSign(GENERAL_SIGNS.FORCES);
        this.addParamSign(GENERAL_SIGNS.RIGIDBODY);
        this.addParamSign(SINGLETON_SIGNS.GLOBAL_PHYSICS_PARAM);
    }
    update(globalPhysicsComp, forcesComp, rigidbodyComp) {
        let lastv = VectorFunctions.vecLength(rigidbodyComp.velocity);
        let f_mag = 0.0;
        if(lastv > CAM_DEFAULTS.LINEAR_V){
            f_mag = lastv * lastv * CAM_DEFAULTS.CAM_DRAG;//quadratic drag
        } else if (lastv > CAM_DEFAULTS.MIN_V){
            f_mag = lastv * CAM_DEFAULTS.CAM_DRAG;//linear drag
        } else{
            let tmpa = lastv * (1.0 - CAM_DEFAULTS.TRANS_DECAY) / globalPhysicsComp.deltaTime;//exponential decay
            f_mag = rigidbodyComp.mass * tmpa;
        }
        let dir = lastv == 0 ? [0.,0.,0.]: VectorFunctions.vecNormalize(rigidbodyComp.velocity);
        let f = VectorFunctions.vecScale(dir, -f_mag);//create f opposite of v
        let F = VectorFunctions.vecMinus(forcesComp.force, f);
        let a = VectorFunctions.vecScale(F, 1./rigidbodyComp.mass);
        rigidbodyComp.velocity = VectorFunctions.vecAdd(rigidbodyComp.velocity, VectorFunctions.vecScale(a, globalPhysicsComp.deltaTime));
        //console.log("# F = ", VectorFunctions.vecLength(F));
        //console.log("# f = ", VectorFunctions.vecLength(f));
        console.log("# v = ", VectorFunctions.vecLength(rigidbodyComp.velocity));
        console.log("# force and friction added to the body.");
    }
}

export class BuildWorldSDFColliderSystem extends System{
    constructor(){
        super();
        this.addParamSign(GENERAL_SIGNS.SDF_COLLIDER);
        this.addParamSign(SINGLETON_SIGNS.WORLD_SDF_COLLIDER);
    }
    update(worldSdfColliderComp, sdfColliderComp) {
        //将SDF加入worldSDF集合
        worldSdfColliderComp.sdfLists.push(sdfColliderComp);
    }
}


export class SphereCollisionTestingSystem extends System{
    constructor(){
        super();
        this.addParamSign(SINGLETON_SIGNS.WORLD_SDF_COLLIDER);
        this.addParamSign(SINGLETON_SIGNS.GLOBAL_PHYSICS_PARAM);
        this.addParamSign(GENERAL_SIGNS.SPHERE_COLLIDER);
        this.addParamSign(GENERAL_SIGNS.TRANSFORM);
        this.addParamSign(GENERAL_SIGNS.RIGIDBODY);
        this.addParamSign(GENERAL_SIGNS.FORCES);
    }

    update(worldColComp, globalPhysicsComp, sphereColComp, transformComp, rigidbodyComp, forceComp) {
        let ds = VectorFunctions.vecScale(rigidbodyComp.velocity, globalPhysicsComp.deltaTime);
        let nextpos = VectorFunctions.vecAdd(transformComp.position, ds);
        for (const str of worldColComp.sdfLists) {
            var func = SDF_DICT[str];
            let intersection = func(nextpos) - sphereColComp.radius;
            console.log("# id = ", str, "sdf_intersection = ", intersection);
            if (intersection < 0.0) {
                //pyramidal normal algorithm:
                let h = PHYSICS_DEFAULTS.SDF_NORMAL_HSTEP;
                let tmp1 = VectorFunctions.vecAdd(VectorFunctions.vecScale([1,-1,-1],h),transformComp.position);
                let tmp2 = VectorFunctions.vecAdd(VectorFunctions.vecScale([-1,-1,1],h),transformComp.position);
                let tmp3 = VectorFunctions.vecAdd(VectorFunctions.vecScale([-1,1,-1],h),transformComp.position);
                let tmp4 = VectorFunctions.vecAdd(VectorFunctions.vecScale([1, 1, 1],h),transformComp.position);
                let val1 = VectorFunctions.vecScale([1,-1,-1],func(tmp1));
                let val2 = VectorFunctions.vecScale([-1,-1,1],func(tmp2));
                let val3 = VectorFunctions.vecScale([-1,1,-1],func(tmp3));
                let val4 = VectorFunctions.vecScale([1, 1, 1],func(tmp4));
                let fdir = SDF_Generalfuncs.reflect3d(rigidbodyComp.velocity, VectorFunctions.vecSum([val1,val2,val3,val4]));
                console.log("# fdir = ", fdir);
                switch (str) {
                    case SDF_ID.INF_CUBES://rubber bouncy action
                        let fn_mag = Math.abs(intersection) * sphereColComp.stiffness;
                        forceComp.force = [0.,0.,0.];
                        rigidbodyComp.velocity = VectorFunctions.vecScale(fdir, fn_mag);
                        break;
                    case SDF_ID.TUNNEL://stopping action with slightest bounce
                        forceComp.force = [0.,0.,0.];
                        let v = VectorFunctions.vecLength(rigidbodyComp.velocity);
                        rigidbodyComp.velocity = VectorFunctions.vecScale(fdir, v);
                        break;
                    default:
                        forceComp.force = [0.,0.,0.];
                        rigidbodyComp.velocity = [0.,0.,0.];
                        break;
                }
                console.log("# v = ", rigidbodyComp.velocity);
            }  
        }
    }
}

export class ResetWorldSDFColliderSystem extends System{
    constructor(){
        super();
        //this.addParamSign(SINGLETON_SIGNS.WORLD_SDF_COLLIDER);   
    }
    update(worldSDFColComp) {
        worldSDFColComp.sdfLists.splice(0);
    }
}


export class WorldSDFRenderingSystem extends System{
    constructor(renderingCallback){ //renderingCallback: (uniformData, camera) -> void
        super();
        this.addParamSign(SINGLETON_SIGNS.CAMERA);  
        this.addParamSign(SINGLETON_SIGNS.WORLD_SDF_RENDERER);   
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
        this.addParamSign(SINGLETON_SIGNS.INPUT); 
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
        this.Yaw = 0.;
        this.Pitch = 0.;
        this.degRange = CAM_DEFAULTS.CAM_TURN_RANGE;
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
            case MOUSE_BUTTON.LEFT:
                this.LeftButton = isdown;
                break;
            case MOUSE_BUTTON.RIGHT:
                this.RightButton = isdown;
                break;
            case MOUSE_BUTTON.MIDDLE:
                this.MiddleButton = isdown;
                break;
            default:
                break;
        }
    }
    //update once input fields
    update(inputComp) {
        this.degPitch *= CAM_DEFAULTS.ROT_DECAY;
        this.degYaw *= CAM_DEFAULTS.ROT_DECAY;
        this.Pitch += this.degPitch;
        this.Yaw += this.degYaw;
        if(this.Pitch < -this.degRange) this.Pitch += 2 * this.degRange;
        else if (this.Pitch > this.degRange) this.Pitch -= 2 * this.degRange;
        if(this.Yaw < -this.degRange) this.Yaw += 2 * this.degRange;
        else if (this.Yaw > this.degRange) this.Yaw -= 2 * this.degRange;
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
        mouseState["yaw"] = this.Yaw;
        mouseState["pitch"] = -this.Pitch;
        mouseState["dyaw"] = this.degYaw;
        mouseState["dpitch"] = -this.degPitch;
    }
}

export default {
    GravitationSystem,
    TransformUpdateSystem,
    RigidBodyUpdateSystem,
    BuildWorldSDFColliderSystem,
    SphereCollisionTestingSystem,
    ResetWorldSDFColliderSystem,
    WorldSDFRenderingSystem,
    InputSystem,
}