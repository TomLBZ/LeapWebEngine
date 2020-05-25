import {
    MatType,
    FragmentShaderFileByMatType,
    VertexShaderFileByMatType,
    FragmentShaderCodeByFile,
    VertexShaderCodeByFile
} from './material.js';

export class Renderer {
    constructor(canvas, width, height) {
        this.canvas = canvas;
        canvas.width = width;
        canvas.height = height;
        this.width = width;
        this.height = height;
    }
    renderScene(scene, camera) {
        console.error("# renderScene not implemented by child class.", scene, camera);
    }
}
 
export class WebGLRenderer extends Renderer {
    constructor(canvas, width, height) {
        super(canvas, width, height);
        this.gl = canvas.getContext("webgl");

        //vert/index buffer
        this.vertexBufferObj = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBufferObj);
        this.indexBufferObj = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBufferObj);

        //map file --> shader
        this.vertexShaderByFile = {};
        this.fragmentShaderByFile = {};
        for (let file in VertexShaderCodeByFile) {
            console.log("# compile vertex shader:", file);
            var vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
            this.gl.shaderSource(vertexShader, VertexShaderCodeByFile[file]);
            this.gl.compileShader(vertexShader);
            if (!this.gl.getShaderParameter(vertexShader, this.gl.COMPILE_STATUS)) {
                alert("vertexShader compilation failed. " + this.gl.getShaderInfoLog(vertexShader));
            } else {
                this.vertexShaderByFile[file] = vertexShader;
            }
        }
        for (let file in FragmentShaderCodeByFile) {
            console.log("# compile fragment shader:", file);
            var fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
            this.gl.shaderSource(fragmentShader, FragmentShaderCodeByFile[file]);
            this.gl.compileShader(fragmentShader);
            if (!this.gl.getShaderParameter(fragmentShader, this.gl.COMPILE_STATUS)) {
                alert("fragmentShader compilation failed. " + this.gl.getShaderInfoLog(fragmentShader));
            } else {
                this.fragmentShaderByFile[file] = fragmentShader;
            }
        }

        //map mattype --> shader
        this.vertexShaderByMatType = {};
        this.fragmentShaderByMatType = {};
        for (let matType in MatType) {
            let vfile = VertexShaderFileByMatType[matType];
            this.vertexShaderByMatType[matType] = this.vertexShaderByFile[vfile];
            let ffile = FragmentShaderFileByMatType[matType];
            this.fragmentShaderByMatType[matType] = this.fragmentShaderByFile[ffile];
        }
        console.log("# vertexShaderByMatType:", this.vertexShaderByMatType);
        console.log("# fragmentShaderByMatType:", this.fragmentShaderByMatType);

        //map mattype --> program
        this.programByMatType = {};
        this.uniformLocationsByMatType = {};
        for (let matType in MatType) {
            console.log("# link program for", matType);
            let vshader = this.vertexShaderByMatType[matType];
            let fshader = this.fragmentShaderByMatType[matType];
            let program = this.gl.createProgram();
            this.gl.attachShader(program, vshader);
            this.gl.attachShader(program, fshader);
            this.gl.linkProgram(program);
            if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
                alert("Could not link program.");
            } else {
                this.programByMatType[matType] = program;
                this.uniformLocationsByMatType[matType] = {
                    "objectToWorldMatrix": this.gl.getUniformLocation(program, 'objectToWorldMatrix'),
                    "worldToViewMatrix": this.gl.getUniformLocation(program, 'worldToViewMatrix'),
                    "screenSize": this.gl.getUniformLocation(program, 'screenSize')
                };
                for(let key in this.uniformLocationsByMatType[matType]) {
                    if (this.uniformLocationsByMatType[matType][key] === null) {
                        console.warn("# uniform location not found (spell check if you use those vars):", key);
                    }
                }
                console.log("locations", this.uniformLocationsByMatType);
            }
        }
        console.log("# mapping material type to program & uniform locations DONE.");
        // get uniform locations   
    }
    
    _checkGlError(msg) {
        console.log("# " + msg, this.gl.getError());
    }

    _groupSceneObjectsByMaterials(scene) {
        let objectDict = scene.sceneObjectDict;
        let objectsGroups = [];
        for (let objectId in objectDict) {
            let obj = objectDict[objectId];
            let isSameMaterialFound = false;
            for (let i = 0; i < objectsGroups.length; i++) {
                if (objectsGroups[i][0].material === obj.material) {
                    objectsGroups[i].push(obj);
                    isSameMaterialFound = true;
                } 
            }
            if (!isSameMaterialFound) {
                objectsGroups.push([obj]);
            }
        }
        return objectsGroups;
    }
    
    renderScene(scene, camera) {
        console.log("# WebGLRenderer renderScene called.", scene);
        let objectGroups = this._groupSceneObjectsByMaterials(scene);
        console.log("# [renderScene] objectGroups", objectGroups);
        let worldToViewMatrix = camera.getWorldToViewMatrix();
        
        //reset
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.viewport(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);

        //drawcalls
        for (let i = 0; i < objectGroups.length; i++) {
            let group = objectGroups[i];
            let matType = group[0].material.type;
            let program = this.programByMatType[matType];
            console.log("# [renderScene] switch program:", matType);
            this.gl.useProgram(program);
            for (let j = 0; j < group.length; j++) {
                let obj = group[j];
                console.log("# [renderScene] bind buffer:", obj.id);
                
                if (!obj._vertexes_array_buffer) {
                    console.log("# [renderScene] create _vertexes_array_buffer for:", obj.id);
                    let vertexBufferObj = this.gl.createBuffer();
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBufferObj);
                    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(obj.vertexes), this.gl.STATIC_DRAW);
                    obj._vertexes_array_buffer = vertexBufferObj;
                }
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, obj._vertexes_array_buffer);

                if (!obj._indexes_array_buffer) {
                    console.log("# [renderScene] create _indexes_array_buffer for:", obj.id);
                    let indexBufferObj = this.gl.createBuffer();
                    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBufferObj);
                    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(obj.indexes), this.gl.STATIC_DRAW);    
                    obj._indexes_array_buffer = indexBufferObj;
                } 
                this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, obj._indexes_array_buffer);
                
                //index format and position
                var coord = this.gl.getAttribLocation(program, "aVertexPosition");
                this.gl.vertexAttribPointer(coord, 3, this.gl.FLOAT, false, 0, 0);
                this.gl.enableVertexAttribArray(coord);

                //fill uniform data
                let screenSizeUniformLocation = this.uniformLocationsByMatType[matType]['screenSize'];
                let objectToWorldMatrixUniformLocation = this.uniformLocationsByMatType[matType]['objectToWorldMatrix'];
                let worldToViewMatrixUniformLocation = this.uniformLocationsByMatType[matType]['worldToViewMatrix'];
                this.gl.uniform2fv(screenSizeUniformLocation, [this.width, this.height]);
                this.gl.uniformMatrix4fv(objectToWorldMatrixUniformLocation, false, obj.getObjectToWorldMatrix());
                this.gl.uniformMatrix4fv(worldToViewMatrixUniformLocation, false, worldToViewMatrix);

                console.log("# [renderScene] drawcall:", obj.id);
                this.gl.drawElements(this.gl.TRIANGLES, obj.indexes.length, this.gl.UNSIGNED_SHORT, 0);
            }
        }
    }
}
