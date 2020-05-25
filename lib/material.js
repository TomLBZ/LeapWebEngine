import {readTextAsync} from './file.js';

export const MatType = {
    SDF_BOX: "SDF_BOX",
    SDF_SPHERE: "SDF_SPHERE",
    MESH_DEFAULT: "MESH_DEFAULT"
}

export const VertexShaderFileByMatType = {
    SDF_BOX: "SDF",
    SDF_SPHERE: "SDF",
    MESH_DEFAULT:  "MESH"
};
export const FragmentShaderFileByMatType = {
    SDF_BOX: "SDF_BOX",
    SDF_SPHERE: "SDF_SPHERE",
    MESH_DEFAULT: "MESH"
};

export var VertexShaderCodeByFile = {};
export var FragmentShaderCodeByFile = {};

export async function readShaderSourcesAsync() {
    console.log("# readShaderSourcesAsync called.");
    let vertexShaderFiles = [];
    let fragmentShaderFiles = [];
    for(let mtype in MatType){
        vertexShaderFiles.push(VertexShaderFileByMatType[mtype]);
        fragmentShaderFiles.push(FragmentShaderFileByMatType[mtype]);
    }
    vertexShaderFiles = new Set(vertexShaderFiles);
    fragmentShaderFiles = new Set(fragmentShaderFiles);
    for (let vertexFile of vertexShaderFiles) {
        let source = await readTextAsync("./shaders/" + vertexFile + ".vert");
        VertexShaderCodeByFile[vertexFile] = source;
    }
    for (let fragmentFile of fragmentShaderFiles) {
        let source = await readTextAsync("./shaders/" + fragmentFile + ".frag");
        FragmentShaderCodeByFile[fragmentFile] = source;
    }
}

export class Material {
    constructor(type, diffuseColor){
        if(diffuseColor.length !== 4) console.error("# Material diffuseColor must have length 4.");
        this.type = type;
        this.diffuseColor = diffuseColor;
    }
}