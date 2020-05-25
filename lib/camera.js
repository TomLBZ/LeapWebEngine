import {matrixIdentity, matrixForTranslation, matrixReverse} from './matrix.js';

export class Camera {
    constructor(pos, at, up){
        this.pos = pos;
        this.at = at;
        this.up = up;
    }
    getWorldToViewMatrix() {
        let cameraToWorldMatrix = matrixForTranslation(this.pos);
        return matrixReverse(cameraToWorldMatrix);
    }
}