import { GSDFWorld, GSDFBox } from './lib/gobject.js';
import { Scene } from './lib/scene.js';
import { WebGLRenderer } from './lib/renderer.js';
import { readShaderSourcesAsync, Material, RENDER_TYPE } from './lib/material.js';
import { Camera } from './lib/camera.js';
import { Game } from './Game.js';
import { DebugConsole } from './lib/debug.js';
import { Vec3 } from './lib/matrix.js';
//import { IMAGE_SETTINGS, StereoProcessor} from './lib/images.js';
import { Player } from './lib/player.js';

"use strict";
(async function () {
    await readShaderSourcesAsync(); 
    let debugRoot = document.getElementById("console-root");
    let debugConsole = new DebugConsole(debugRoot);
    let canvas = document.querySelector("#leapSpace");
    let renderer = new WebGLRenderer(canvas, 600, 400);
    let scene = new Scene();
    let world = new GSDFWorld(
                    //[27, 113, 57],
                    [10,20,30],
                    "world",
                    new Material(RENDER_TYPE.SDF_WORLD, [0.5,0.5,1.,0.7]),
                    [0,0,0],
                    [0,0,0]
                );
    let pobj = new GSDFBox(
                    [20, 40, 20],
                    "bounding",
                    new Material(RENDER_TYPE.SDF_BOX, [0.2,1.,0.5,0.3]),
                    [0,0,0],
                    [0,0,0]
                );
    scene.addObject(world);
    debugConsole.activate();
    debugConsole.addLabel("canvas size", () => renderer.width.toString() + ", " + renderer.height.toString());
    debugConsole.addLabel("renderer status", () => renderer.renderCount);
    debugConsole.addLabel("scene object#", () => scene.objectKeys());
    var camera = new Camera(Math.PI * 0.5, 600 / 400, 1, 1000);
    camera.setLookDirection([0, 0, 105], [0, 0, -1], [0, 1, 0]);
    var defaultpos = camera.pos;
    var totaltime = 0.;
    debugConsole.addLabel("camera pos", () =>  camera.pos);
    debugConsole.addLabel("camera direction", () =>  camera.direction);
    debugConsole.addLabel("camera up", () =>  camera.up);
    let mygame = new Game();
    var player = new Player(window, camera, pobj, canvas);
    debugConsole.addLabel("fps", () => mygame.Fps);
    debugConsole.addLabel("animationTimeField", () => renderer.animationTimeField);
    function update(timestep){
        renderer.animationTimeField = totaltime;
        totaltime += timestep * 0.001;
        let up3 = new Vec3(camera.up);
        let dir3 = new Vec3(camera.direction);
        let newup = player.RotationalMatrix.MultVec(up3)
        let newdir = player.RotationalMatrix.MultVec(dir3);
        camera.setLookDirection(camera.pos, newdir.ToArray(), newup.ToArray());
        if (player.KeyInput.Start) { return true; }
        if (player.KeyInput.Pause) { return false; }
        if (player.KeyInput.Left) { camera.pos[0] -= player.Speed; }
        if (player.KeyInput.Right) { camera.pos[0] += player.Speed; }
        if (player.KeyInput.Up) { camera.pos[1] += player.Speed; }
        if (player.KeyInput.Down) { camera.pos[1] -= player.Speed; }
        if (player.KeyInput.In) { camera.pos[2] -= player.Speed; }
        if (player.KeyInput.Out) { camera.pos[2] += player.Speed; }
        if (player.KeyInput.Control) { camera.pos[0] = defaultpos; }
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