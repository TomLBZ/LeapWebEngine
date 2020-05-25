import { matrixIdentity, matrixForTranslation } from './matrix.js';

export var GOTypes = {
    UNKNOWN: "UNKNOWN",
    MESH_BOX: "MESH_BOX",
    MESH_SPHERE: "MESH_SPHERE"
}

const SDF_VERTEXES = [
    -1, 1, 0.0,
    -1, -1, 0.0,
    1, -1, 0.0,
    1, 1, 0.0
];
const SDF_INDEXES = [3, 2, 1, 3, 1, 0];

export class GObject {
    constructor(id, material, position, rotation, vertexes, indexes) {
        this.id = id;
        this.material = material;
        this.position = position;
        this.rotation = rotation;
        this.vertexes = vertexes;
        this.indexes = indexes;
    }
    getObjectToWorldMatrix() {
        return matrixForTranslation(this.position); //TODO
    }
}

export class GMeshObject extends GObject {
    constructor(id, material, position, rotation, vertexes, indexes) {
        super(id, material, position, rotation, vertexes, indexes);
    }
}

export class GSDFObject extends GObject {
    constructor(id, material, position, rotation) {
        super(id, material, position, rotation);
        this.vertexes = SDF_VERTEXES;
        this.indexes = SDF_INDEXES;
    }
}

export class GMeshBox extends GObject {
    constructor(size, id, material, position, rotation) {
        //TODO: gen vertexes and indexes.
        let x = size[0] / 2, y = size[1] / 2, z = size[2] / 2;
        //      * ----- *    1   0
        //   * ------ * |  5   4
        //   |  * --- | *    2   3
        //   * ------ *    6   7
        let vertexes = [
            x, y, z, x, -y, z, -x, -y, z, -x, y, z,
            x, y, -z, x, -y, -z, -x, -y, -z, -x, y, -z
        ];
        let indexes = [
            0, 1, 2, 0, 2, 3,
            4, 7, 6, 4, 6, 5,
            1, 0, 4, 1, 4, 5,
            2, 6, 7, 2, 7, 3,
            0, 3, 4, 4, 3, 7,
            3, 2, 7, 2, 6, 7
        ];
        super(id, material, position, rotation, vertexes, indexes);
        this.size = size;
    }
}

export class GMeshSphere extends GObject {
    constructor(radius, id, material, position, rotation) {
        //TODO: gen vertexes and indexes.
        super(id, material, position, rotation, null, null);
        this.radius = radius;
    }
}

export class GSDFBox extends GSDFObject {
    constructor(size, id, material, position, rotation) {
        super(id, material, position, rotation);
        this.size = size;
    }
}

export class GSDFSphere extends GSDFObject {
    constructor(radius, id, material, position, rotation) {
        super(id, material, position, rotation);
        this.radius = radius;
    }
}