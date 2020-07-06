import {System} from './System.js';
import {GENERAL_SIGNS, SINGLETON_SIGNS} from '../constants/SignTypes.js';
import {CAM_DEFAULTS} from '../constants/GameDefault.js';

export class PlayerUpdateSystem extends System{
    constructor(){
        super();
        this.addParamSign(SINGLETON_SIGNS.INPUT);
        //this.addParamSign(SINGLETON_SIGNS.GLOBAL_PHYSICS_PARAM);
        this.addParamSign(SINGLETON_SIGNS.CAMERA);
        //this.addParamSign(GENERAL_SIGNS.TRANSFORM);
        this.addParamSign(GENERAL_SIGNS.RIGIDBODY);
    }
    update(inputComp, cameraComp, rigidbodyComp) {
        let keyState = inputComp.keyStates;
        let mouseState = inputComp.mouseStates;
        if (keyState["left"]){rigidbodyComp.velocity[0] -= CAM_DEFAULTS.TRANS_DV;}
        if (keyState["right"]){rigidbodyComp.velocity[0] += CAM_DEFAULTS.TRANS_DV;}
        if (keyState["up"]){rigidbodyComp.velocity[2] -= CAM_DEFAULTS.TRANS_DV;}
        if (keyState["down"]){rigidbodyComp.velocity[2] += CAM_DEFAULTS.TRANS_DV;}
        if (keyState["in"]){rigidbodyComp.velocity[1] -= CAM_DEFAULTS.TRANS_DV;}
        if (keyState["out"]){rigidbodyComp.velocity[1] += CAM_DEFAULTS.TRANS_DV;}
        rigidbodyComp.velocity[0] *= CAM_DEFAULTS.TRANS_DECAY;
        rigidbodyComp.velocity[1] *= CAM_DEFAULTS.TRANS_DECAY;
        rigidbodyComp.velocity[2] *= CAM_DEFAULTS.TRANS_DECAY;
        cameraComp.yaw = mouseState["yaw"] * CAM_DEFAULTS.ROT_DW;
        cameraComp.pitch = mouseState["pitch"] * CAM_DEFAULTS.ROT_DW;
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