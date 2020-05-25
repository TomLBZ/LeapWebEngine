import {matrixIdentity} from './matrix.js';

export class Camera {
    constructor(pos, at, up){
        this.pos = pos;
        this.at = at;
        this.up = up;
    }
    getWorldToViewMatrix() {
        return matrixIdentity();
    }
}