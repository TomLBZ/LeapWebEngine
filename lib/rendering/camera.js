import {matrixLookAt, matrixProjection, vectorAdd, vectorMinus} from '../math/matrix.js';
import { VectorFunctions, MatrixFunctions } from "../math/Vector.js";
import { CAM_DEFAULTS } from "../constants/GameDefault.js"
export class Camera {
    constructor(fov, ratio, near, far){
        this.fov = fov;
        this.ratio = ratio;
        this.near = near;
        this.far = far;
        this.right = Math.tan(fov / 2) * near;
        this.top = this.right / ratio;
        this.pos = CAM_DEFAULTS.POS;
        this.direction = CAM_DEFAULTS.DIR;
        this.up = CAM_DEFAULTS.UP;
        this.yawPitch.bind(this);
    }
    setLookTarget(pos, target, up) {
        this.pos = pos;
        this.direction = vectorMinus(target, this.pos);
        this.up = up;
        return this;
    }
    setLookDirection(pos, direction, up) {
        this.pos = pos;
        this.direction = direction;
        this.up = up;
        return this;
    }
    yawPitch(degYaw, degPitch){
        let M = MatrixFunctions.YawPitchMat4(degYaw,degPitch);
        this.direction = VectorFunctions.vec4To3(MatrixFunctions.mat4MultVec(M,CAM_DEFAULTS.DIR4));
        this.up = VectorFunctions.vec4To3(MatrixFunctions.mat4MultVec(M,CAM_DEFAULTS.UP4));
    }
    getWorldToViewMatrix() {
        return matrixLookAt(this.pos, vectorAdd(this.pos, this.direction), this.up);
    }
    getProjectionMatrix() {
        let projMatrix = matrixProjection(this.right, this.top, this.near, this.far);
        return projMatrix;
    }
}