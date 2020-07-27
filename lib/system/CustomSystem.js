import {System} from './System.js';
import {GENERAL_SIGNS, SINGLETON_SIGNS} from '../constants/SignTypes.js';
import {CAM_DEFAULTS} from '../constants/GameDefault.js';
import { VectorFunctions } from "../math/Vector.js";

export class PlayerUpdateSystem extends System{
    constructor(){
        super();
        this.addParamSign(SINGLETON_SIGNS.INPUT);
        //this.addParamSign(SINGLETON_SIGNS.GLOBAL_PHYSICS_PARAM);
        this.addParamSign(SINGLETON_SIGNS.CAMERA);
        //this.addParamSign(GENERAL_SIGNS.TRANSFORM);
        //this.addParamSign(GENERAL_SIGNS.RIGIDBODY);
        this.addParamSign(GENERAL_SIGNS.FORCES);
        this.Jumping = 0;
    }
    update(inputComp, cameraComp, forcesComp) {
        let keyState = inputComp.keyStates;
        let mouseState = inputComp.mouseStates;
        forcesComp.force = [0.,0.,0.];
        if (keyState["left"]){forcesComp.force[0] = CAM_DEFAULTS.CAM_DRIVE;}
        if (keyState["right"]){forcesComp.force[0] = -CAM_DEFAULTS.CAM_DRIVE;}
        if (keyState["up"]){forcesComp.force[2] = CAM_DEFAULTS.CAM_DRIVE;}
        if (keyState["down"]){forcesComp.force[2] = -CAM_DEFAULTS.CAM_DRIVE;}
        if (this.Jumping < CAM_DEFAULTS.CAM_JUMP_CYCLES){
            if(keyState["in"]){forcesComp.force[1] = CAM_DEFAULTS.CAM_JUMP;}
            if(keyState["out"]){forcesComp.force[1] = -CAM_DEFAULTS.CAM_JUMP;}
            this.Jumping++;
        }else{ if(!keyState["in"] && !keyState["out"]){this.Jumping = 0;}}
        console.log("# Foperator = ", VectorFunctions.vecLength(forcesComp.force));
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