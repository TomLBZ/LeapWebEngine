import { matrixForTranslation } from './matrix.js';

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
        this.info = {}; //read only information.
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
        super(id, material, position, rotation, SDF_VERTEXES, SDF_INDEXES);
    }
}

export class GMeshBox extends GObject {
    constructor(size, id, material, position, rotation) {
        //TODO: gen vertexes and indexes. 
        //reference: http://www.opengl-tutorial.org/beginners-tutorials/tutorial-8-basic-shading/#triangle-normals
        //TODO: normals.
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
            2, 1, 0, 3, 2, 0,//0, 1, 2, 0, 2, 3,
            6, 7, 4, 5, 6, 4,//4, 7, 6, 4, 6, 5,
            4, 0, 1, 5, 4, 1,//1, 0, 4, 1, 4, 5,
            7, 6, 2, 3, 7, 2,//2, 6, 7, 2, 7, 3,
            4, 3, 0, 7, 3, 4,//0, 3, 4, 4, 3, 7,
            7, 2, 3, 7, 6, 2//3, 2, 7, 2, 6, 7
        ];
        super(id, material, position, rotation, vertexes, indexes);
        this.info["size"] = size;
    }
}

export class GMeshSphere extends GObject {
    constructor(radius, id, material, position, rotation) {
        //TODO: gen vertexes and indexes.
        super(id, material, position, rotation, null, null);
        this.info["radius"] = radius;
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

export class GSDFWorld extends GSDFObject {
    constructor(rbinit, id, material, position, rotation) {
        super(id, material, position, rotation);
        this.rbinit = rbinit;
    }
}