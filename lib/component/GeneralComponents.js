import {Component} from './Component.js';

// GeneralComponents.js
// - 各种具体通用组件的定义（非singleton）
//   - transform组件（位置，角度）
//   - rigidbody组件（质量，速度，角速度）
//   - force组件（力，力矩）
//   - render组件（shader ID，material对象）
//   - sdfCollider组件（SDF函数）
//   - sphereCollider组件（半径）
// - 各种具体通用组件定义（singleton）
//   - input组件（各个按键的输入情况）
//   - worldSDFCollider组件（整个世界的SDF）
//   - worldGravityToPlane组件（整个世界的引力平面，引力大小）
//   - globalRenderParam组件（全局渲染相关的参数：如已过时间）

export const COMP_GEN_TYPES = {
    "TRANSFORM": "TRANSFORM",
    "RIGIDBODY": "RIGIDBODY",
    "FORCES": "FORCES",
    "RENDER": "RENDER",
    "SDF_COLLIDER": "SDF_COLLIDER",
    "SPHERE_COLLIDER": "SPHERE_COLLIDER",
    "INPUT": "INPUT",
    "WORLD_SDF_COLLIDER": "WORLD_SDF_COLLIDER",
    "WORLD_GRAVITY_TO_PANE": "WORLD_GRAVITY_TO_PLANE",
    "GLOBAL_RENDER_PARAM": "GLOBAL_RENDER_PARAM",
    "GLOBAL_PHYSICS_PARAM": "GLOBAL_PHYSICS_PARAM",
    "CAMERA": "CAMERA"
}

export class TransformComponent extends Component {
    constructor() {
        super(COMP_GEN_TYPES.TRANSFORM);
        this.position = [0., 0., 0.];
        this.rotation = [0., 0., 0.];
    }
}

export class RigitBodyComponent extends Component{
    constructor(){
        super(COMP_GEN_TYPES.RIGIDBODY);
        this.mass = 0.;
        this.velocity = [0., 0., 0.];
        this.w = [0., 0., 0.];
    }
}

export class ForcesComponent extends Component {
    constructor() {
        super(COMP_GEN_TYPES.FORCES);
        this.force = [0.,0.,0.];
        this.torque = [0.,0.,0.];
        }
}

export class RenderComponent extends Component {
    constructor(shaderID, material) {
        super(COMP_GEN_TYPES.RENDER);
        this.shaderID = shaderID;
        this.material = material;
    }
}

export class SDF_ColliderComponent extends Component {
    constructor(sdfID, sdfParams){
        super(COMP_GEN_TYPES.SDF_COLLIDER);
        this.sdfID = sdfID;
        this.sdfParams = sdfParams;
    }
}

export class SphereColliderComponent extends Component {
    constructor(radius) {
        super(COMP_GEN_TYPES.SPHERE_COLLIDER);
        this.radius = radius;
    }
}


///////////////////////////////// singleton /////////////////////////////////

export class InputComponent extends Component {
    constructor() {
        super(COMP_GEN_TYPES.INPUT);
        this.keyStates = {};
        this.mouseStates = {};
    }
}

export class WorldSDFColliderComponent extends Component {
    constructor(){
        super(COMP_GEN_TYPES.WORLD_SDF_COLLIDER);
        this.sdfLists = [];
    }
}

export class WorldGravityPlaneComponent extends Component{
    constructor(){
        super(COMP_GEN_TYPES.WORLD_GRAVITY_TO_PANE);
        this.gravityStrength = 9.81;
        this.planeNormalDirection = [0.,0.,0.];
        this.planeReferencePoint = [0.,0.,0.];
    }
}

export class GlobalRenderParamComponent extends Component {
    constructor() {
        super(COMP_GEN_TYPES.GLOBAL_RENDER_PARAM);
        //TODO: 需要哪些全局参数？
        this.lastRenderTime = 0;
    }
}

export class GlobalPhysicsParamComponent extends Component {
    constructor() {
        super(COMP_GEN_TYPES.GLOBAL_PHYSICS_PARAM);
        //TODO: 需要哪些全局参数？
        this.deltaTime = 0.01;
    }
}

export class CameraComponent extends Component{
    constructor(){
        super(COMP_GEN_TYPES.CAMERA);
        this.camera = null;
        // this.fov = 0.;
        // this.ratio = ratio;
        // this.near = near;
        // this.far = far;
        // this.right = Math.tan(fov / 2) * near;
        // this.top = this.right / ratio;
        // this.pos = [0, 0, 0];
        // this.direction = [0, 0, -1]; //look at forward -z (right x, up y.)
        // this.up = [0, 1, 0];
    }
}
