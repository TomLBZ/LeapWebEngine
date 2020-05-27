import { GSDFWorld, GSDFBox } from './lib/gobject.js';
import { Scene } from './lib/scene.js';
import { WebGLRenderer } from './lib/renderer.js';
import { readShaderSourcesAsync, Material, RENDER_TYPE } from './lib/material.js';
import { Camera } from './lib/camera.js';
import { GAME_DEFAULTS, Game } from './Game.js';
import { DebugConsole } from './lib/debug.js';
import { matrixToString } from './lib/matrix.js';

"use strict";
(async function () {
    await readShaderSourcesAsync(); 
    let debugRoot = document.getElementById("console-root");
    let debugConsole = new DebugConsole(debugRoot);
    debugConsole.activate();
    let canvas = document.querySelector("#leapSpace");
    let renderer = new WebGLRenderer(canvas, 600, 400);
    debugConsole.addLabel("canvas size", () => renderer.width.toString() + ", " + renderer.height.toString());
    debugConsole.addLabel("renderer status", () => renderer.renderCount);
    let scene = new Scene();
    debugConsole.addLabel("scene object#", () => scene.objectKeys());
    scene.addObject(
        new GSDFWorld(
            "world",
            new Material(RENDER_TYPE.SDF_WORLD, [0.5,0.5,1.,0.7]),
            [0,0,0],
            [0,0,0]
        )
    );
    scene.addObject(
        new GSDFBox(
            [20, 20, 30],
            "sbox1",
            new Material(RENDER_TYPE.SDF_BOX, [0.6, 0.2, 0.8, 1]),
            [-50, -50, 0],
            [0, 0, 0]
        )
    );
    let camera = new Camera(Math.PI * 0.5, 600 / 400, 1, 1000);
    camera.setLookDirection([0, 0, 105], [0, 0, -1], [0, 1, 0]);
    let mygame = new Game();
    debugConsole.addLabel("camera pos", () =>  camera.pos);
    debugConsole.addLabel("camera direction", () =>  camera.direction);
    debugConsole.addLabel("camera up", () =>  camera.up);
    debugConsole.addLabel("fps", () => mygame.Fps);
    //function update(campos, camangle){

    //}
    function draw(){
        renderer.renderScene(scene, camera);    
    }
    //function end(){
        
    //}
    mygame.windowOrRoot = window;
    //renderer.renderScene(scene, camera);   
    mygame.setDraw(draw);
    mygame.start();
    
})();