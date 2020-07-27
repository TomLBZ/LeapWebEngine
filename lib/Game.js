import { World } from './World.js';
import { Entity } from './Entity.js';
import { SDF_ID } from './sdf.js';
import { Material } from './rendering/material.js';
import { Camera } from './rendering/camera.js';
import { WebGLSDFOnlyRenderer } from './rendering/WebGLSDFOnlyRenderer.js';
import { GAME_DEFAULTS } from './constants/GameDefault.js';
import GeneralSystem from "../lib/system/GeneralSystem.js";
import CustomSystem from "../lib/system/CustomSystem.js";
import GeneralComponents from "../lib/component/GeneralComponents.js";

export class Game {
    constructor(canvas, window = {}) {
        this.Base = window === {} ? this : window;
        this.windowOrRoot = this;
        this.simulationTimeStep = GAME_DEFAULTS.DEFAULT_SIMUL_TIMESTEP;
        this.frameDelta = GAME_DEFAULTS.DEFAULT_FRAME_DELTA;
        this.Fps = GAME_DEFAULTS.DEFAULT_FPS;
        this.fpsAlpha = GAME_DEFAULTS.DEFAULT_FPS_ALPHA;
        this.fpsUpdateInterval = GAME_DEFAULTS.DEFAULT_FPS_UPDATE_INT;
        this.minFrameDelay = GAME_DEFAULTS.DEFAULT_MIN_FRAME_DELAY;
        this.bailOut = GAME_DEFAULTS.DEFAULT_BAILOUOT;
        this.lastFrameTimeMs = 0;
        this.lastFpsUpdate = 0;
        this.framesSinceLastFpsUpdate = 0;
        this.numUpdateSteps = 0;
        this.running = false;
        this.started = false;
        this.panic = false;
        this.rafHandle;//id of current frame used for cancellation
        this._begin = this.noop;
        this._update = this.nooptrue;
        this._draw = this.noop;
        this._end = this.noop;
        this.world = new World();
        this.Canvas = canvas;
        this.DebugMode = true;
    }
    noop() { }//js trick, empty functions are faster than conditions
    nooptrue() { return true; }

    InitializeECS() {
        this.world.AddEntity(new Entity("PLAYER", [
            new GeneralComponents.SphereColliderComponent(20),
            new GeneralComponents.SDFRenderComponent(SDF_ID.SPHERE, { "radius": 20 }, new Material(null, [0.5, 0.5, 1., 0.7])),
            new GeneralComponents.TransformComponent([0, 0, 0], [0, 0, 0]),
            new GeneralComponents.RigitBodyComponent(1, [0, 0, 0], [0, 0, 0]),
            new GeneralComponents.ForcesComponent([0, 0, 0], [0, 0, 0])
        ]));
        this.world.AddEntity(new Entity("STATIC_BOX_1", [
            new GeneralComponents.SDFColliderComponent(SDF_ID.BOX, { "size": [20, 20, 20] }),
            new GeneralComponents.SDFRenderComponent(SDF_ID.BOX, { "size": [20, 20, 20] }, new Material(null, [0.6, 0.2, 0.2, 0.7])),
            new GeneralComponents.TransformComponent([0, 10, 0], [0, 0, 0]),
        ]));

        this.world.AddSingletonComponent(new GeneralComponents.CameraComponent(
            new Camera(
                Math.PI * 0.5, 600 / 400, 1, 1000
            ).setLookDirection(
                [0, 0, 105], [0, 0, -1], [0, 1, 0]
            )
        ));
        this.world.AddSingletonComponent(new GeneralComponents.InputComponent());
        this.world.AddSingletonComponent(new GeneralComponents.GlobalPhysicsParamComponent(this.simulationTimeStep));
        this.world.AddSingletonComponent(new GeneralComponents.WorldSDFRendererComponent());
        this.world.AddSingletonComponent(new GeneralComponents.WorldGravityPlaneComponent());

        let renderer = new WebGLSDFOnlyRenderer(this.Canvas, 720, 480);
        this.world.AddSystem(new GeneralSystem.InputSystem(this.Base, this.Canvas));
        this.world.AddSystem(new CustomSystem.PlayerUpdateSystem());
        this.world.AddSystem(new GeneralSystem.GravitationSystem());
        this.world.AddSystem(new GeneralSystem.RigidBodyUpdateSystem());
        this.world.AddSystem(new GeneralSystem.TransformUpdateSystem());
        this.world.AddSystem(new GeneralSystem.SphereCollisionTestingSystem());
        this.world.AddSystem(new GeneralSystem.WorldSDFRenderingSystem(
            renderer.renderUniformData.bind(renderer)
        ));
        this._update = (dt) => {
            this.world.Update(dt);
        }
    }

    SetWindowOrRoot(value) {
        this.windowOrRoot = typeof value === 'object' ? value : this.windowOrRoot;
    }
    SetParameters(simulationtimestep, framedelta, fps, fpsalpha,
        fpsupdateinterval, minframedelay, bailout) {
        this.simulationTimeStep = simulationtimestep || this.simulationTimeStep;
        this.frameDelta = framedelta || this.frameDelta;
        this.Fps = fps || this.Fps;
        this.fpsAlpha = fpsalpha || this.fpsAlpha;
        this.fpsUpdateInterval = fpsupdateinterval || this.fpsUpdateInterval;
        this.minFrameDelay = minframedelay || this.minFrameDelay;
        this.bailOut = bailout || this.bailOut;
    }
    getMaxAllowedFPS() { return 1000. / this.minFrameDelay; }
    setMaxAllowedFPS(fps) {
        if (typeof fps === 'undefined') { fps = Infinity; }
        if (fps === 0) { this.stop(); }
        else { this.minFrameDelay = 1000 / fps; }
        return this.minFrameDelay;
    }
    resetFrameDelta() {
        var oldFrameDelta = this.frameDelta;
        this.frameDelta = 0;
        return oldFrameDelta;
    }
    setBegin(fun) {//can process inputs, runs once per frame
        this._begin = fun || this._begin;
        return this;
    }
    // setUpdate(fun) {//can run multiple times, calculate time-dependant stuff
    //     this._update = fun || this._update;
    //     return this;
    // }
    // setDraw(fun) {//draw(timepassed/updateinterval). param as a percentage
    //     this._draw = fun || this._draw;
    //     return this;
    // }
    setEnd(fun) {//runs once. calculate time-independant stuff and clean up.
        this._end = fun || this._end;
        return this;
    }
    _start(timestamp) {
        this._draw(1);//draws the initial state before starting the loop
        this.running = true;
        this.lastFrameTimeMs = timestamp;
        this.lastFpsUpdate = timestamp;
        this.framesSinceLastFpsUpdate = 0;
        let animate = this.animateEnclosureGenerator();
        this.rafHandle = requestAnimationFrame(animate);//start main loop
    }
    start() {
        if (!this.started) {
            this.started = true;
            let starter = this._start.bind(this);
            this.rafHandle = requestAnimationFrame(starter);
        }
        return this;
    }
    stop() {
        this.running = false;
        this.started = false;
        cancelAnimationFrame(this.rafHandle);
        return this;
    }
    isRunning() { return this.running; }
    animateEnclosureGenerator() {
        let that = this;
        function _animate(timestamp) {
            that.rafHandle = requestAnimationFrame(_animate);//handle for cancellation
            if (timestamp < that.lastFrameTimeMs + that.minFrameDelay) { return; }//caps fps
            that.frameDelta += timestamp - that.lastFrameTimeMs;//total time passed
            that.lastFrameTimeMs = timestamp;//update lastframe timestamp
            that._begin(timestamp, that.frameDelta);
            if (timestamp > that.lastFpsUpdate + that.fpsUpdateInterval) {
                that.Fps = that.fpsAlpha * that.framesSinceLastFpsUpdate * 1000 / (timestamp - that.lastFpsUpdate)
                    + (1 - that.fpsAlpha) * that.Fps;
                that.lastFpsUpdate = timestamp;
                that.framesSinceLastFpsUpdate = 0;
            }
            that.framesSinceLastFpsUpdate++;
            that.numUpdateSteps = 0;
            let updated = false;
            while (that.frameDelta >= that.simulationTimeStep) {
                updated = that._update(that.simulationTimeStep);
                that.frameDelta -= that.simulationTimeStep;
                if (++that.numUpdateSteps >= that.bailOut) {
                    that.panic = true;
                    break;
                }
            }
            if (updated) { that._draw(that.frameDelta / that.simulationTimeStep); }
            that._end(that.Fps, that.panic);
            that.panic = false;
        }
        return _animate;
    }
}
