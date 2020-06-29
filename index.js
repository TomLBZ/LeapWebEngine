import { GSDFWorld, GSDFBox } from './lib/gobject.js';
import { Scene } from './lib/scene.js';
import { WebGLRenderer } from './lib/renderer.js';
import { readShaderSourcesAsync, Material, RENDER_TYPE } from './lib/material.js';
import { Camera } from './lib/camera.js';
import { Game } from './lib/Game.js';
import { DebugConsole } from './lib/debug.js';
import { Vec3, Mat3 } from './lib/matrix.js';
//import { IMAGE_SETTINGS, StereoProcessor} from './lib/images.js';
import { Player } from './lib/player.js';

"use strict";
(async function () {
    await readShaderSourcesAsync(); 
    let debugRoot = document.getElementById("console-root");
    let debugConsole = new DebugConsole(debugRoot);
    let canvas = document.querySelector("#leapSpace");
    let scene = new Scene();
    let world = new GSDFWorld(
                    //[27, 113, 57],
                    [10,50,100],
                    "world",
                    new Material(RENDER_TYPE.SDF_WORLD, [0.5,0.5,1.,0.7]),
                    [0,0,0],
                    [0,0,0]
                );
    scene.addObject(world);
    var camera = new Camera(Math.PI * 0.5, 600 / 400, 1, 1000);
    camera.setLookDirection([0, 0, 0], [0, 0, 1], [0, 1, 0]);
    var defaultpos = new Vec3(camera.pos);
    var totaltime = 0.;
    let mygame = new Game(canvas, window);
    mygame.ECS_Initialize();
    let renderer = new WebGLRenderer(canvas, 720, 480);
    if(mygame.DebugMode){
        //let debugConsole = mygame.myECS.Systems[3];
        debugConsole.activate();
        debugConsole.addLabel("canvas size", () => renderer.width.toString() + ", " + renderer.height.toString());
        debugConsole.addLabel("renderer status", () => renderer.renderCount);
        debugConsole.addLabel("scene object#", () => scene.objectKeys());
        debugConsole.addLabel("camera pos", () =>  camera.pos);
        debugConsole.addLabel("camera direction", () =>  camera.direction);
        debugConsole.addLabel("camera up", () =>  camera.up);
        debugConsole.addLabel("fps", () => mygame.Fps);
        debugConsole.addLabel("animationTimeField", () => renderer.animationTimeField);
    }
    function update(timestep){
        totaltime += timestep * 0.001;
        renderer.animationTimeField = totaltime;
        mygame.myECS.Update(totaltime);
        return true;
    }
    function draw(){
        renderer.renderScene(scene, camera);    
    }
    //function end(){
        
    //}
    mygame.SetWindowOrRoot(window);
    mygame.setUpdate(update);
    mygame.setDraw(draw);
    debugConsole.addCommands("Start / Stop", {
        "Start": () => {mygame.start();},
        "Stop": () => {mygame.stop();},
    });
    mygame.start();
})();