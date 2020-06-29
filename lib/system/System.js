/*System.js
- System对象
TransformUpdateSystem.js 继承 System
- 签名 (rigidbody组件，transform组件*)
RigidBodyUpdateSystem.js 继承 System
- 签名 (force组件，rigidbody组件*)
BuildWorldSDFColliderSystem.js 继承 System
- 签名 (sdfCollider组件, worldSDFCollider组件*)
https://github.com/flecs-hub/flecs-systems-physics/blob/master/src/physics.c
SphereCollisionTestingSystem.js 继承 System
- 签名 (sphereCollider组件, worldSDFCollider组件, rigidbody组件*)
ResetWorldSDFColliderSystem.js 继承 System
- 签名 (worldSDFCollider组件*)
RenderingSystem.js 继承 System
- 签名 (render组件)
InputSystem.js 继承 System
- 签名 (input组件)
 */

export class System{
    constructor(){
        this.Sign = [];
    }
    addParamSign(sign) {
        this.Sign.push(sign);
    }
    update() {}
}

export class TransformUpdateSystem extends System{
    constructor(){
        super();
        this.addParamSign();
        //this.
    }
}

export class RigidBodyUpdateSystem extends System{
    constructor(){
        super();
        //this.
    }
}

export class BuildWorldSDFColliderSystem extends System{
    constructor(){
        super();
        //this.
    }
}

export class SphereCollisionTestingSystem extends System{
    constructor(){
        super();
        //this.
    }
}

export class ResetWorldSDFColliderSystem extends System{
    constructor(){
        super();
        //this.
    }
}

export class RenderingSystem extends System{
    constructor(){
        super();
        //this.
    }
}

export class InputSystem extends System{
    constructor(){
        super();
        //this.
    }
}