import {System} from './System.js';
import {COMP_GEN_TYPE} from '../component/GeneralComponent.js';

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
// RenderingSystem.js 继承 System
// - 签名 (render组件)
// InputSystem.js 继承 System
// - 签名 (input组件)

export class TransformUpdateSystem extends System{
    constructor(){
        super();
        this.addParamSign(COMP_GEN_TYPE.RIGIDBODY);
        this.addParamSign(COMP_GEN_TYPE.TRANSFORM);
        this.addParamSign(COMP_GEN_TYPE.GLOBAL_PHYSICS_PARAM);
    }
    update(rigidbodyComp, transformComp, globalPhysicsComp) {
        //向量运算，更新transform
        transformComp.position += globalPhysicsComp.deltaTime * rigidbodyComp.velocity;
        
    }
}

export class RigidBodyUpdateSystem extends System{
    constructor(){
        super();
        this.addParamSign(COMP_GEN_TYPE.FORCE);
        this.addParamSign(COMP_GEN_TYPE.RIGIDBODY);
    }
    update(forceComp, rigidbodyComp, deltaTime) {
        //向量运算，更新rigidbody
    }
}

export class BuildWorldSDFColliderSystem extends System{
    constructor(){
        super();
        this.addParamSign(COMP_GEN_TYPE.SDF_COLLIDER);
        this.addParamSign(COMP_GEN_TYPE.WORLD_SDF_COLLIDER);
    }
    update(sdfColliderComp, worldSdfColliderComp) {
        //将SDF加入worldSDF集合
        worldSdfColliderComp.sdfLists.push(sdfColliderComp);
    }
}


export class SphereCollisionTestingSystem extends System{
    constructor(){
        super();
        this.addParamSign(COMP_GEN_TYPE.SPHERE_COLLIDER);
        this.addParamSign(COMP_GEN_TYPE.WORLD_SDF_COLLIDER);
        this.addParamSign(COMP_GEN_TYPE.TRANSFORM);
        this.addParamSign(COMP_GEN_TYPE.RIGIDBODY);
        this.addParamSign(COMP_GEN_TYPE.FORCE);
    }

    update(sphereColComp, worldColComp, transformComp, rigidbodyComp, forceComp) {
        let {radius} = sphereColComp;
        let {position, rotation} = transformComp;
        let 
mass, velocity, w  = rigidbodyComp;
        let {force, torque} = forceComp;
        //TODO: 
        // 1. 计算position处的SDF，与radius相比，看是否相交；
        // 2. 若相交，求position处SDF的微分，此处应当为碰撞点法向；
        // 3. 看速度与法向，是否构成反弹，若构成反弹，更新速度；
        // 4. 看角速度与法向，更新摩擦力和力矩；
        // 5. 看相交深度和速度方向，更新位置。   }
}

export class ResetWorldSDFColliderSystem extends System{
    constructor(){
        super();
        //this.addParamSign(COMP_GEN_TYPE.WORLD_SDF_COLLIDER);   }
}
    update(worldSDFColComp) {
        worldSDFColComp.sdfLists.splice(0);
    }


xport class RenderingSystem extends System{
    constructor(){
        super();
        //this.addParamSign(COMP_GEN_TYPE.RENDER);   }
}
    update(renderComp) {

    }

export class InputSystem extends System{
    constructor(){
        super();
        //this.addParamSign(COMP_GEN_TYPE.INPUT);   }
}
    update(inputComp) {
        
    }