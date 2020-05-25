import {matrixForTranslation, matrixReverse, matrixProjection} from './matrix.js';

export class Camera {
    constructor(fov, ratio, near, far){
        this.fov = fov;
        this.ratio = ratio;
        this.near = near;
        this.far = far;
        this.right = Math.tan(fov / 2) * near;
        this.top = this.right / ratio;
        this.pos = [0, 0, 0];
        this.at = [0, 0, 1];
        this.up = [0, 1, 0];
    }
    setEye(pos, at, up) {
        this.pos = pos;
        this.at = at;
        this.up = up;
    }
    getWorldToViewMatrix() {
        let cameraToWorldMatrix = matrixForTranslation(this.pos);
        return matrixReverse(cameraToWorldMatrix);
    }
    getProjectionMatrix() {
        let projMatrix = matrixProjection(this.right, this.top, this.near, this.far);
        return projMatrix;
    }
}