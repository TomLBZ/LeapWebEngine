import {System} from './System.js';
import {COMP_GEN_TYPES} from '../component/GeneralComponents.js';

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
    constructor(){
        super();
        this.addParamSign(COMP_GEN_TYPES.INPUT); 
        this.addParamSign(COMP_GEN_TYPES.CAMERA);
        this.addParamSign(COMP_GEN_TYPES.TRANSFORM);  
    }
    update(inputComp) {
        
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