export var GOTypes = {
    UNKNOWN: "UNKNOWN",
    MESH_BOX: "MESH_BOX",
    MESH_SPHERE: "MESH_SPHERE"
}

export class GObject {
    constructor(id, type, material, position, rotation) {
        this.id = id;
        this.material = material;
        this.position = position;
        this.rotation = rotation;
        this.type = type;
    }
}

export class GObjectMeshBox extends GObject {
    constructor(size, id, material, position, rotation) {
        super(id, GOTypes.MESH_BOX, material, position, rotation);
        this.size = size;
    }
}

export class GObjectMeshSphere extends GObject {
    constructor(radius, id, material, position, rotation) {
        super(id, GOTypes.MESH_SPHERE, material, position, rotation);
        this.radius = radius;
    }
}