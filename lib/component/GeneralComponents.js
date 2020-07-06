import {Component} from './Component.js';
import {GENERAL_SIGNS, SINGLETON_SIGNS} from '../constants/SignTypes.js';
import {PHYSICS_DEFAULTS, CAM_DEFAULTS} from '../constants/GameDefault.js';
// GeneralComponents.js
// - 各种具体通用组件的定义（非singleton）
//   - transform组件（位置，角度）
//   - rigidbody组件（质量，速度，角速度）
//   - force组件（力，力矩）
//   - sdfRender组件（sdfID，material对象）
//   - sdfCollider组件（SDF函数）
//   - sphereCollider组件（半径）
// - 各种具体通用组件定义（singleton）
//   - input组件（各个按键的输入情况）
//   - worldSDFRenderer组件（整个世界的SDF）
//   - worldSDFCollider组件（整个世界的SDF）
//   - worldGravityToPlane组件（整个世界的引力平面，引力大小）
//   - globalRenderParam组件（全局渲染相关的参数：如已过时间）

export class TransformComponent extends Component {
    constructor(position, rotation) {
        super(GENERAL_SIGNS.TRANSFORM);
        this.position = position || [0., 0., 0.];
        this.rotation = rotation || [0., 0., 0.];//yaw, pitch, roll
    }
}

export class RigitBodyComponent extends Component{
    constructor(mass, velocity, w){
        super(GENERAL_SIGNS.RIGIDBODY);
        this.mass = mass || 0.;
        this.velocity = velocity || [0., 0., 0.];
        this.w = w || [0., 0., 0.];
    }
}

export class ForcesComponent extends Component {
    constructor(force, torque) {
        super(GENERAL_SIGNS.FORCES);
        this.force = force || [0.,0.,0.];
        this.torque = torque || [0.,0.,0.];
        }
}

export class SDFRenderComponent extends Component {
    constructor(sdfID, sdfParams, material) {
        super(GENERAL_SIGNS.SDF_RENDER);
        this.sdfID = sdfID;
        this.sdfParams = sdfParams;
        this.material = material;
    }
}

export class SDFColliderComponent extends Component {
    constructor(sdfID, sdfParams){
        super(GENERAL_SIGNS.SDF_COLLIDER);
        this.sdfID = sdfID;
        this.sdfParams = sdfParams;
    }
}

export class SphereColliderComponent extends Component {
    constructor(radius) {
        super(GENERAL_SIGNS.SPHERE_COLLIDER);
        this.radius = radius;
    }
}


///////////////////////////////// singleton /////////////////////////////////

export class InputComponent extends Component {
    constructor() {
        super(SINGLETON_SIGNS.INPUT);
        this.keyStates = {
            "left": false,
            "right": false,
            "up": false,
            "down": false,
            "in": false,
            "out": false,
            "pause": false,
            "start": false,
            "control": false,
        };
        this.mouseStates = {
            "left": false,
            "right": false,
            "middle": false,
            "yaw": 0.,
            "pitch": 0.,
        };
    }
}

export class WorldSDFRendererComponent extends Component {
    constructor(){
        super(SINGLETON_SIGNS.WORLD_SDF_RENDERER);
        this.uniformData = {};
    }
}

export class WorldSDFColliderComponent extends Component {
    constructor(){
        super(SINGLETON_SIGNS.WORLD_SDF_COLLIDER);
        this.sdfLists = [];
    }
}

export class WorldGravityPlaneComponent extends Component{
    constructor(pt, pos){
        super(SINGLETON_SIGNS.WORLD_GRAVITY_TO_PANE);
        this.gravityStrength = PHYSICS_DEFAULTS.G;
        this.planeNormalDirection = pos || [0.,1.,0.];
        this.planeReferencePoint = pt || [0.,0.,0.];
    }
}

export class GlobalRenderParamComponent extends Component {
    constructor() {
        super(SINGLETON_SIGNS.GLOBAL_RENDER_PARAM);
        //TODO: 需要哪些全局参数？
        this.lastRenderTime = 0;
    }
}

export class GlobalPhysicsParamComponent extends Component {
    constructor(deltaTime) {
        super(SINGLETON_SIGNS.GLOBAL_PHYSICS_PARAM);
        //TODO: 需要哪些全局参数？
        this.deltaTime = deltaTime / 1000. || 0.01;    }
}

export class CameraComponent extends Component{
    constructor(camera){
        super(SINGLETON_SIGNS.CAMERA);
        this.camera = camera;
        this.pitch = 0.;
        this.yaw = 0.;
    }
}

export default {
    TransformComponent,
    RigitBodyComponent,
    ForcesComponent,
    SDFRenderComponent,
    SDFColliderComponent,
    SphereColliderComponent,
    InputComponent,
    WorldSDFRendererComponent,
    WorldSDFColliderComponent,
    WorldGravityPlaneComponent,
    GlobalRenderParamComponent,
    GlobalPhysicsParamComponent,
    CameraComponent,
}