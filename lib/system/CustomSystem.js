import {System} from './System.js';
import {COMP_CUSTOM_TYPES} from '../component/CustomComponents.js';
import {COMP_GEN_TYPES} from '../component/GeneralComponents.js';

export class PlayerUpdateSystem extends System{
    constructor(){
        super();
        this.addParamSign(COMP_GEN_TYPES.INPUT);
        this.addParamSign(COMP_GEN_TYPES.TRANSFORM);
        this.addParamSign(COMP_GEN_TYPES.GLOBAL_PHYSICS_PARAM);
        this.addParamSign(COMP_GEN_TYPES.CAMERA);
    }
    update(inputComp, transformComp, globalPhysicsComp, cameraComp) {
        let keyState = inputComp.keyStates;
        let mouseState = inputComp.mouseStates;
        if (keyState["left"]){transformComp.position[0] -= globalPhysicsComp.deltaTime * 1.;}
        if (keyState["right"]){transformComp.position[0] += globalPhysicsComp.deltaTime * 1.;}
        if (keyState["up"]){transformComp.position[1] += globalPhysicsComp.deltaTime * 1.;}
        if (keyState["down"]){transformComp.position[1] -= globalPhysicsComp.deltaTime * 1.;}
        if (keyState["in"]){transformComp.position[2] -= globalPhysicsComp.deltaTime * 1.;}
        if (keyState["out"]){transformComp.position[2] += globalPhysicsComp.deltaTime * 1.;}
        transformComp.rotation[0] = mouseState["yaw"];
        transformComp.rotation[1] = mouseState["pitch"];
        cameraComp.camera.pos = transformComp.position;
        cameraComp.yaw(mouseState["yaw"]);
        cameraComp.pitch(mouseState["pitch"]);
        if (keyState["pause"]){}
        if (keyState["start"]){}
        if (keyState["control"]){}
        if (mouseState["left"]){}
        if (mouseState["right"]){}
        if (mouseState["middle"]){}
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

export default {
    PlayerUpdateSystem,
}