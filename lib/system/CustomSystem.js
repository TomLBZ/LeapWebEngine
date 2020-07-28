import {System} from './System.js';
import {GENERAL_SIGNS, SINGLETON_SIGNS} from '../constants/SignTypes.js';
import {CAM_DEFAULTS} from '../constants/GameDefault.js';
import { VectorFunctions } from "../math/Vector.js";
import { vector3Cross } from '../math/matrix.js';

export class PlayerUpdateSystem extends System{
    constructor(){
        super();
        this.addParamSign(SINGLETON_SIGNS.INPUT);
        this.addParamSign(SINGLETON_SIGNS.CAMERA);
        this.addParamSign(SINGLETON_SIGNS.WORLD_GRAVITY_TO_PLANE);
        this.addParamSign(GENERAL_SIGNS.FORCES);
        this.Jumping = 0;
    }
    update(inputComp, cameraComp, gravityPlaneComp, forcesComp) {
        let keyState = inputComp.keyStates;
        let mouseState = inputComp.mouseStates;
        forcesComp.force = [0.,0.,0.];
        let dir = VectorFunctions.vecNormalize(cameraComp.camera.direction);
        let camup = VectorFunctions.vecNormalize(cameraComp.camera.up);
        let right = VectorFunctions.vec3Cross(dir, camup);
        let up = VectorFunctions.vecNormalize(gravityPlaneComp.planeNormalDirection);
        let back = VectorFunctions.vecScale(dir, CAM_DEFAULTS.CAM_DRIVE);
        let left = VectorFunctions.vecScale(right, CAM_DEFAULTS.CAM_DRIVE);
        let down = VectorFunctions.vecScale(up, -CAM_DEFAULTS.CAM_JUMP); 
        dir = VectorFunctions.vecScale(dir, -CAM_DEFAULTS.CAM_DRIVE);
        right = VectorFunctions.vecScale(right, -CAM_DEFAULTS.CAM_DRIVE);
        up = VectorFunctions.vecScale(up, CAM_DEFAULTS.CAM_JUMP); 
        if (keyState["left"]){forcesComp.force = VectorFunctions.vecAdd(forcesComp.force, left);}
        if (keyState["right"]){forcesComp.force = VectorFunctions.vecAdd(forcesComp.force, right);}
        if (keyState["up"]){forcesComp.force = VectorFunctions.vecAdd(forcesComp.force,dir);}
        if (keyState["down"]){forcesComp.force = VectorFunctions.vecAdd(forcesComp.force, back);}
        if (this.Jumping < CAM_DEFAULTS.CAM_JUMP_CYCLES){
            if(keyState["in"]){forcesComp.force = VectorFunctions.vecAdd(forcesComp.force, up);}
            if(keyState["out"]){forcesComp.force = VectorFunctions.vecAdd(forcesComp.force, down);}
            this.Jumping++;
        }else{ if(!keyState["in"] && !keyState["out"]){this.Jumping = 0;}}
        if (keyState["control"]){
            gravityPlaneComp.planeReferencePoint = cameraComp.camera.pos;
            gravityPlaneComp.planeNormalDirection = cameraComp.camera.direction;
        }
        //console.log("# Foperator = ", VectorFunctions.vecLength(forcesComp.force));
        cameraComp.yaw = mouseState["yaw"] * CAM_DEFAULTS.ROT_DW;
        cameraComp.pitch = mouseState["pitch"] * CAM_DEFAULTS.ROT_DW;
    }
}

export default {
    PlayerUpdateSystem,
}