import {readTextAsync} from './file.js';

export const RENDER_TYPE = {
    SDF_BOX: "SDF_BOX",
    SDF_SPHERE: "SDF_SPHERE",
    MESH_DEFAULT: "MESH_DEFAULT"
}

export const RENDER_PARAMS_BY_RENDER_TYPE = {
    SDF_BOX: {
        size: "float[3]",
        diffuseColor: "float[4]"
    },
    SDF_SPHERE: {
        radius: "float",
        diffuseColor: "float[4]"
    },
    MESH_DEFAULT: {
        diffuseColor: "float[4]"
    }
}

export const VERTEX_SHADER_FILE_BY_RENDER_TYPE = {
    SDF_BOX: "SDF",
    SDF_SPHERE: "SDF",
    MESH_DEFAULT:  "MESH"
};
export const FRAGMENT_SHADER_FILE_BY_RENDER_TYPE = {
    SDF_BOX: "SDF_BOX",
    SDF_SPHERE: "SDF_SPHERE",
    MESH_DEFAULT: "MESH"
};

export var VERTEX_SHADER_CODE_BY_FILE = {};
export var FRAGMENT_SHADER_CODE_BY_FILE = {};

export async function readShaderSourcesAsync() {
    console.log("# readShaderSourcesAsync called.");
    let vertexShaderFiles = [];
    let fragmentShaderFiles = [];
    for(let mtype in RENDER_TYPE){
        vertexShaderFiles.push(VERTEX_SHADER_FILE_BY_RENDER_TYPE[mtype]);
        fragmentShaderFiles.push(FRAGMENT_SHADER_FILE_BY_RENDER_TYPE[mtype]);
    }
    vertexShaderFiles = new Set(vertexShaderFiles);
    fragmentShaderFiles = new Set(fragmentShaderFiles);
    for (let vertexFile of vertexShaderFiles) {
        let source = await readTextAsync("./shaders/" + vertexFile + ".vert");
        VERTEX_SHADER_CODE_BY_FILE[vertexFile] = source;
    }
    for (let fragmentFile of fragmentShaderFiles) {
        let source = await readTextAsync("./shaders/" + fragmentFile + ".frag");
        FRAGMENT_SHADER_CODE_BY_FILE[fragmentFile] = source;
    }
}

export class Material {
    constructor(type, diffuseColor){
        if(diffuseColor.length !== 4) console.error("# Material diffuseColor must have length 4.");
        this.type = type;
        this.diffuseColor = diffuseColor;
    }
}