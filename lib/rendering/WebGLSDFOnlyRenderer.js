import {
    RENDER_TYPE,
    RENDER_PARAMS_BY_RENDER_TYPE,
    FRAGMENT_SHADER_FILE_BY_RENDER_TYPE,
    VERTEX_SHADER_FILE_BY_RENDER_TYPE,
    FRAGMENT_SHADER_CODE_BY_FILE,
    VERTEX_SHADER_CODE_BY_FILE
} from './material.js';

import Renderer from './Renderer.js';

let RENDER_TYPE_SDF_ONLY = RENDER_TYPE.SDF_ONLY;
let RENDER_PARAMS = RENDER_PARAMS_BY_RENDER_TYPE[RENDER_TYPE_SDF_ONLY];
let FRAGMENT_SHADER_FILE = FRAGMENT_SHADER_FILE_BY_RENDER_TYPE[RENDER_TYPE_SDF_ONLY];
let VERTEX_SHADER_FILE = VERTEX_SHADER_FILE_BY_RENDER_TYPE[RENDER_TYPE_SDF_ONLY];
let FRAGMENT_SHADER_CODE = FRAGMENT_SHADER_CODE_BY_FILE[FRAGMENT_SHADER_FILE];
let VERTEX_SHADER_CODE = VERTEX_SHADER_CODE_BY_FILE[VERTEX_SHADER_FILE];

let SDF_VERTEXES = [
    -1, 1, 0.0,
    -1, -1, 0.0,
    1, -1, 0.0,
    1, 1, 0.0
];
let SDF_INDEXES = [3, 2, 1, 3, 1, 0];

export class WebGLSDFOnlyRenderer extends Renderer {
    constructor(canvas, width, height) {
        super(canvas, width, height);
        this.gl = canvas.getContext("webgl");
        this.animationTimeField = 0.;
        
        //check extensions
        this.available_extensions = this.gl.getSupportedExtensions();
        console.log("# available_extensions:", this.available_extensions);
        let frag_depth_ext = this.gl.getExtension('EXT_frag_depth');
        console.log("# enabling EXT_frag_depth:", frag_depth_ext);
        if (!frag_depth_ext) {
            alert("# Not Supported. Your browser doesn't support WebGL Extension EXT_frag_depth. SDF materials will fail.");
            console.error("# Not Supported Extension: EXT_frag_depth");
        }

        //init fields
        this.vertexShader = null;
        this.fragmentShader = null;
        this.program = null;
        this.uniformLocations = {};

        //initialize shader
        this.initializeShader();   

        //create vertexes buffer & indexes buffer
        let vertexBufferObj = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBufferObj);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(SDF_VERTEXES), this.gl.STATIC_DRAW);
        this.vertexesArrayBuffer = vertexBufferObj;
        let indexBufferObj = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBufferObj);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(SDF_INDEXES), this.gl.STATIC_DRAW);
        this.indexesArrayBuffer = indexBufferObj;
    }

    initializeShader() {
        //compile shader
        console.log("# compile vertex shader:", VERTEX_SHADER_FILE);
        var vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.gl.shaderSource(vertexShader, VERTEX_SHADER_CODE);
        this.gl.compileShader(vertexShader);
        if (!this.gl.getShaderParameter(vertexShader, this.gl.COMPILE_STATUS)) {
            alert("vertexShader compilation failed. " + this.gl.getShaderInfoLog(vertexShader));
        } else {
            this.vertexShader = vertexShader;
        }
        console.log("# compile fragment shader:", FRAGMENT_SHADER_FILE);
        var fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(fragmentShader, FRAGMENT_SHADER_CODE);
        this.gl.compileShader(fragmentShader);
        if (!this.gl.getShaderParameter(fragmentShader, this.gl.COMPILE_STATUS)) {
            alert("fragmentShader compilation failed. " + this.gl.getShaderInfoLog(fragmentShader));
        } else {
            this.fragmentShader = fragmentShader;
        }

        //link program & find uniform locations
        console.log("# link program for", RENDER_TYPE_SDF_ONLY);
        let vshader = this.vertexShader;
        let fshader = this.fragmentShader;
        let program = this.gl.createProgram();
        this.gl.attachShader(program, vshader);
        this.gl.attachShader(program, fshader);
        this.gl.linkProgram(program);
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            alert("Could not link program.");
        } else {
            //map RenderType to UniformLocations
            console.log("# mapping uniform locations:", renderType);
            this.program = program;
            this.uniformLocations = {
                "objectToWorldMatrix": this.gl.getUniformLocation(program, 'objectToWorldMatrix'),
                "worldToViewMatrix": this.gl.getUniformLocation(program, 'worldToViewMatrix'),
                "projectionMatrix": this.gl.getUniformLocation(program, 'projectionMatrix'),
                "screenSize": this.gl.getUniformLocation(program, 'screenSize'),
                "time": this.gl.getUniformLocation(program, 'time')
            };
            for (let paramName in RENDER_PARAMS) {
                let location = this.gl.getUniformLocation(program, paramName);
                this.uniformLocations[paramName] = location;
            }
            for (let key in this.uniformLocations) {
                if (this.uniformLocations[key] === null) {
                    console.warn("# uniform location not found:", key);
                }
            }
            console.log("# all uniform locations", this.uniformLocations);
            console.log("# initialize shader DONE.");
        }
    }

    renderScene(uniformData,camera) {
        this.renderCount++;
        console.log("# WebGLRenderer renderScene called.", this.renderCount);
        let worldToViewMatrix = camera.getWorldToViewMatrix();
        let projectionMatrix = camera.getProjectionMatrix();

        //reset
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.viewport(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);

        //drawcall
        this.gl.useProgram(this.program);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexesArrayBuffer);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexesArrayBuffer);

        //index format and position
        var coord = this.gl.getAttribLocation(program, "aVertexPosition");
        this.gl.vertexAttribPointer(coord, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(coord);

        //fill common uniform data
        let objectToWorldMatrixUniformLocation = this.uniformLocationsByRenderType[renderType]['objectToWorldMatrix'];
        let worldToViewMatrixUniformLocation = this.uniformLocationsByRenderType[renderType]['worldToViewMatrix'];
        let projectionMatrixUniformLocation = this.uniformLocationsByRenderType[renderType]['projectionMatrix'];
        let screenSizeUniformLocation = this.uniformLocationsByRenderType[renderType]['screenSize'];
        let timeUniformLocation = this.uniformLocationsByRenderType[renderType]['time'];
        this.gl.uniformMatrix4fv(objectToWorldMatrixUniformLocation, false, obj.getObjectToWorldMatrix());
        this.gl.uniformMatrix4fv(worldToViewMatrixUniformLocation, false, worldToViewMatrix);
        this.gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);
        this.gl.uniform2fv(screenSizeUniformLocation, [this.width, this.height]);
        this.gl.uniform1f(timeUniformLocation, this.animationTimeField);

        //fill custom uniform data
        for (let paramName in RENDER_PARAMS) {
            let paramLocation = this.uniformLocations[paramName];
            let paramType = RENDER_PARAMS[paramName];
            let paramValue = null;

            if (paramName in uniformData) paramValue = uniformData[paramName];
            else console.error("# renderParam cannot be provided:", uniformData);

            if (paramType === "float") this.gl.uniform1f(paramLocation, paramValue);
            else if (paramType === "float[2]") this.gl.uniform2fv(paramLocation, paramValue);
            else if (paramType === "float[3]") this.gl.uniform3fv(paramLocation, paramValue);
            else if (paramType === "float[4]") this.gl.uniform4fv(paramLocation, paramValue);
            else console.error("# renderParam type not supported:", paramType);
        }

        //draw call
        console.log("# [renderScene] drawcall.");
        this.gl.drawElements(this.gl.TRIANGLES, SDF_INDEXES.length, this.gl.UNSIGNED_SHORT, 0);
    }
}
