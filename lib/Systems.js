import { ECS, System, setLookDirection, setLookTarget } from './ECS.js';
import { Keyboard, Mouse } from './Input.js';
import { vector3Cross, Vec3, Mat3 } from './matrix.js';
import { _player, _structure } from "./EntitiesDefinition.js";
import { SDF_Evaluator } from "./SDF.js";
import {
    RENDER_TYPE,
    RENDER_PARAMS_BY_RENDER_TYPE,
    FRAGMENT_SHADER_FILE_BY_RENDER_TYPE,
    VERTEX_SHADER_FILE_BY_RENDER_TYPE,
    FRAGMENT_SHADER_CODE_BY_FILE,
    VERTEX_SHADER_CODE_BY_FILE
} from './material.js';
export class ControlSystem extends System {
    constructor(window, canvas){ 
        super();
        this.KeyInput = new Keyboard(window);
        this.MouseInput = new Mouse(window, canvas);
    }
    IsEligible(entity){
        return entity.Components.label == 'player';
    }
    Update(entity, elapsed = 1.0) {
        if (this.IsEligible(entity)){
            let {c} = entity.Components;
            let k = this.KeyInput;
            let m = this.MouseInput;
            if(m.Locked){
                c.yaw += m.degYaw * c.w * elapsed / m.degRange;
                c.pitch += m.degPitch * c.w * elapsed / m.degRange;
            }
            c.yaw *= c.rot_decay;
            c.pitch *= c.rot_decay;
            let p = false;
            if (k.Start) { c.movable = true; c.turnable = true;}
            if (k.Pause) { c.movable = false; c.turnable = false;}
            if (k.Control) { c.p = [0., 0., 0.]; }
            if (k.Left) { c.F[0] -= c.drive * elapsed; p = true; }
            if (k.Right) { c.F[0] += c.drive * elapsed; p = true; }
            if (k.Up) { c.F[2] += c.drive * elapsed; p = true; }
            if (k.Down) { c.F[2] -= c.drive * elapsed; p = true;} 
            if (k.In) { c.F[1] -= c.drive * elapsed; p = true; }
            if (k.Out) { c.F[1] += c.drive * elapsed; p = true; }
            if (!p) {
                let cf = new Vec3(c.f);
                c.F = cf.Minus(cf.Scale(c.trans_decay - 1.0)).Elements;
            }
        }
    }
}
export class PhysicsSystem extends System{
    constructor(){
        super();
        this.Eval = new SDF_Evaluator();
    }
    IsEligible(entity){
        return entity.Components.label == 'player';
    }
    Update(entity, elapsed = 1.0){
        if(this.IsEligible(entity)){
            let {c} = entity.Components;
            let a = new Vec3(c.F).Scale(1./m);
            let cv = new Vec3(c.v).Add(a.Scale(elapsed)).Elements;
            let cp = new Vec3(c.p).Add(new Vec3(cv).Scale(elapsed)).Elements;
            let selfindex = this.Entities.indexOf(entity);
            let force = new Vec3([0,0,0]);
            for (let i = 0; i < this.Entities.length; i++) {
                let e = this.Entities[i];
                if (i !== selfindex && e.Components.collision) {
                    let dist = this.Eval.SDF_List[e.Components.label](e, cp) - c.r;
                    if(dist < 0) {
                        let dir = new Vec3(e.p).Minus(new Vec3(cp)).Norm();
                        force = force.Add(dir.Scale(dist).Add(force.Scale(-1.0)));
                    }
                }
            }
        }
    }
}
export class RenderingSystem extends System {
    constructor(canvas, width, height) {
        super();
        this.canvas = canvas;
        canvas.width = width;
        canvas.height = height;
        this.width = width;
        this.height = height;
        this.renderCount = 0;
        this.gl = canvas.getContext("webgl");
        this.animationTimeField = 0.;
        this.available_extensions = this.gl.getSupportedExtensions();
        console.log("# available_extensions:", this.available_extensions);
        let frag_depth_ext = this.gl.getExtension('EXT_frag_depth');
        console.log("# enabling EXT_frag_depth:", frag_depth_ext);
        if (!frag_depth_ext) {
            alert("# Your browser doesn't support WebGL Extension EXT_frag_depth. SDF materials will fail.");
            console.error("# Not Supported Extension: EXT_frag_depth");
        }
        //map file --> shader
        this.vertexShaderByFile = {};
        this.fragmentShaderByFile = {};
        for (let file in VERTEX_SHADER_CODE_BY_FILE) {
            console.log("# compile vertex shader:", file);
            var vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
            this.gl.shaderSource(vertexShader, VERTEX_SHADER_CODE_BY_FILE[file]);
            this.gl.compileShader(vertexShader);
            if (!this.gl.getShaderParameter(vertexShader, this.gl.COMPILE_STATUS)) {
                alert("vertexShader compilation failed. " + this.gl.getShaderInfoLog(vertexShader));
            } else {
                this.vertexShaderByFile[file] = vertexShader;
            }
        }
        for (let file in FRAGMENT_SHADER_CODE_BY_FILE) {
            console.log("# compile fragment shader:", file);
            var fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
            this.gl.shaderSource(fragmentShader, FRAGMENT_SHADER_CODE_BY_FILE[file]);
            this.gl.compileShader(fragmentShader);
            if (!this.gl.getShaderParameter(fragmentShader, this.gl.COMPILE_STATUS)) {
                alert("fragmentShader compilation failed. " + this.gl.getShaderInfoLog(fragmentShader));
            } else {
                this.fragmentShaderByFile[file] = fragmentShader;
            }
        }
        //map RenderType --> shader
        this.vertexShaderByRenderType = {};
        this.fragmentShaderByRenderType = {};
        for (let renderType in RENDER_TYPE) {
            let vfile = VERTEX_SHADER_FILE_BY_RENDER_TYPE[renderType];
            this.vertexShaderByRenderType[renderType] = this.vertexShaderByFile[vfile];
            let ffile = FRAGMENT_SHADER_FILE_BY_RENDER_TYPE[renderType];
            this.fragmentShaderByRenderType[renderType] = this.fragmentShaderByFile[ffile];
        }
        console.log("# vertexShaderByRenderType:", this.vertexShaderByRenderType);
        console.log("# fragmentShaderByRenderType:", this.fragmentShaderByRenderType);
        //map RenderType --> program
        this.programByRenderType = {};
        this.uniformLocationsByRenderType = {};
        for (let renderType in RENDER_TYPE) {
            console.log("# link program for", renderType);
            let vshader = this.vertexShaderByRenderType[renderType];
            let fshader = this.fragmentShaderByRenderType[renderType];
            let program = this.gl.createProgram();
            this.gl.attachShader(program, vshader);
            this.gl.attachShader(program, fshader);
            this.gl.linkProgram(program);
            if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
                alert("Could not link program.");
            } else {//map RenderType to UniformLocations
                console.log("# mapping uniform locations:", renderType);
                this.programByRenderType[renderType] = program;
                this.uniformLocationsByRenderType[renderType] = {
                    "objectToWorldMatrix": this.gl.getUniformLocation(program, 'objectToWorldMatrix'),
                    "worldToViewMatrix": this.gl.getUniformLocation(program, 'worldToViewMatrix'),
                    "projectionMatrix": this.gl.getUniformLocation(program, 'projectionMatrix'),
                    "screenSize": this.gl.getUniformLocation(program, 'screenSize'),
                    "time": this.gl.getUniformLocation(program, 'time')
                };
                for(let paramName in RENDER_PARAMS_BY_RENDER_TYPE[renderType]) {
                    let location = this.gl.getUniformLocation(program, paramName);
                    this.uniformLocationsByRenderType[renderType][paramName] = location;
                }
                for(let key in this.uniformLocationsByRenderType[renderType]) {
                    if (this.uniformLocationsByRenderType[renderType][key] === null) {
                        console.warn("# uniform location not found (spell check if you use those vars):", key);
                    }
                }
            }
        }
        console.log("# all uniform locations", this.uniformLocationsByRenderType);
        console.log("# mapping material type to program & uniform locations DONE.");
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
        this.renderCount++;
        console.log("# WebGLRenderer renderScene called.", this.renderCount, scene);
        let objectGroups = this._groupSceneObjectsByMaterials(scene);
        console.log("# [renderScene] objectGroups", objectGroups);
        let worldToViewMatrix = camera.getWorldToViewMatrix();
        let projectionMatrix = camera.getProjectionMatrix();
        //reset
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.viewport(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
        //drawcalls
        for (let i = 0; i < objectGroups.length; i++) {
            let group = objectGroups[i];
            let renderType = group[0].material.type;
            let program = this.programByRenderType[renderType];
            console.log("# [renderScene] switch program:", renderType);
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
                for(let paramName in RENDER_PARAMS_BY_RENDER_TYPE[renderType]) {
                    let paramLocation = this.uniformLocationsByRenderType[renderType][paramName];
                    let paramType = RENDER_PARAMS_BY_RENDER_TYPE[renderType][paramName];
                    let paramValue = null;
                    if (paramName in obj) paramValue = obj[paramName];
                    else if (paramName in obj.material) paramValue = obj.material[paramName];
                    else console.error("# renderParam cannot be provided:", obj.id);
                    if (paramType === "float") this.gl.uniform1f(paramLocation, paramValue);
                    else if (paramType === "float[2]") this.gl.uniform2fv(paramLocation, paramValue);
                    else if (paramType === "float[3]") this.gl.uniform3fv(paramLocation, paramValue);
                    else if (paramType === "float[4]") this.gl.uniform4fv(paramLocation, paramValue);
                    else console.error("# renderParam type not supported:", paramType);
                }
                //draw call
                console.log("# [renderScene] drawcall:", obj.id);
                this.gl.drawElements(this.gl.TRIANGLES, obj.indexes.length, this.gl.UNSIGNED_SHORT, 0);
            }
        }
    }
    IsEligible(entity) {
        return entity.visible == true;
    }
    Enter(entity) {
        entity.iAmRendered = true;
    }
    Update(entity) {
        let {pos} = entity.components;
        this.ctx.fillRect(pos.x - 5, pos.y - 5, 10, 10);
    }
    Exit(entity) {
        entity.iAmRendered = false;
    }
}
export class DebugSystem extends System {
    constructor(divbox) {
        super();
        if (!divbox){ console.error("# DebugConsole divbox is invalid.");}
        this.divbox = divbox;
        this._trackingDict = {};
        this._timerId = null;
    }
    AddEntity(entity, func_reader){
        let {root, value} = this._createAppendConsoleElem(entity.Components.label);
        let updater = () => { value.innerText = func_reader().toString();};
        this._trackingDict[entity.ID] = {"uiUpdater": updater, "rootElement": root};
        entity.AddSystem(this);
        this.Entities.push(entity);
        this.Enter(entity);
    }
    AddLabel(name, func_reader){
        let {root, value} = this._createAppendConsoleElem(name);
        let updater = () => { value.innerText = func_reader().toString();};
        this._trackingDict[name] = {"uiUpdater": updater, "rootElement": root};
    }
    RemoveEntity(entity){
        let index = this.Entities.indexOf(entity);
        if (index !== -1){
            this.divbox.removeChild(this._trackingDict[entity.ID]['rootElement']);
            delete this._trackingDict[entity.ID];
            entity.RemoveSystem(this);
            removeFromArray(this.Entities, index, 1);
            this.Exit(entity);
        }
    }
    Enter(entity){console.log("# _addTracking for:", entity.Components.label);}
    Exit(entity){console.log("# _removeTracking for:", entity.Components.label);}
    _createAppendConsoleElem(text) {
        let root = document.createElement("div");
        root.className = "console-elem-root";
        let header = document.createElement("span");
        header.innerText = text;
        header.className = "console-elem-head";
        root.appendChild(header);
        let value = document.createElement("span");
        value.className = "console-elem-value";
        root.appendChild(value);
        this.divbox.appendChild(root);
        return {root:root, value:value};
    }
    AddCommands(entity, commandsDict) {
        let index = this.Entities.indexOf(entity);
        if (index == -1) {
            entity.AddSystem(this);
            this.Entities.push(entity);
            this.Enter(entity);    
        }
        let {root, value} = this._createAppendConsoleElem(entity.Components.label);
        for (let cmd in commandsDict) {
            let btn = document.createElement("button");
            btn.innerText = cmd;
            btn.addEventListener("click", commandsDict[cmd]);
            value.appendChild(btn);
        }
        this._trackingDict[entity.ID] = {"uiUpdater": ()=>{}, "rootElement": root};
    }
    activate() {
        if (this._timerId !== null) {
            console.warn("# DebugConsole is already activate.");
            return;
        }
        this._timerId = setInterval(() => {
            for(let key in this._trackingDict) {
                let updater = this._trackingDict[key]["uiUpdater"];
                updater();
            }
        }, 500);
        console.log("# DebugConsole activate.");
    }
    deactivate() {
        clearInterval(this._timerId);
        console.log("# DebugConsole deactivate.");
    }
}