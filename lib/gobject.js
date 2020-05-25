import {matrixIdentity} from './matrix.js';

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
        return matrixIdentity(); //TODO
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
        super(id, material, position, rotation, null, null);
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