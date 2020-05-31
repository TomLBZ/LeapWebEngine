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
    let renderer = new WebGLRenderer(canvas, 720, 480);
    let scene = new Scene();
    let world = new GSDFWorld(
                    //[27, 113, 57],
                    [10,50,100],
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
    camera.setLookDirection([0, 0, 0], [0, 0, 1], [0, 1, 0]);
    var defaultpos = new Vec3(camera.pos);
    var totaltime = 0.;
    debugConsole.addLabel("camera pos", () =>  camera.pos);
    debugConsole.addLabel("camera direction", () =>  camera.direction);
    debugConsole.addLabel("camera up", () =>  camera.up);
    let mygame = new Game();
    var player = new Player(window, camera, pobj, canvas);
    debugConsole.addLabel("fps", () => mygame.Fps);
    debugConsole.addLabel("animationTimeField", () => renderer.animationTimeField);
    debugConsole.addLabel("PlayerVelocity", () => player.Velocity.ToArray());
    var lx = 0., ly = 0.;
    function update(timestep){
        totaltime += timestep * 0.001;
        renderer.animationTimeField = totaltime;
        let up3 = new Vec3(camera.up);
        let dir3 = new Vec3(camera.direction);
        let pos3 = new Vec3(camera.pos);
        if(player.RotAngX != lx || player.RotAngY != ly){
            lx = player.RotAngX;
            ly = player.RotAngY;
        }else{
            player.RotAngX *= player.RotationalDecayFactor;
            player.RotAngY *= player.RotationalDecayFactor;
        }
        let RotMatAbtX = Mat3.RotMatAbtX(player.RotAngX * player.AngularSpeed);
        let RotMatAbtY = Mat3.RotMatAbtY(player.RotAngY * player.AngularSpeed);
        let RM = RotMatAbtX.MultMat(RotMatAbtY);
        let newup = RM.MultVec(up3).Norm();
        let newdir = RM.MultVec(dir3).Norm();
        let newright = newdir.Cross3(newup).Norm();
        camera.setLookDirection(camera.pos, newdir.ToArray(), newup.ToArray());
        let p = false;
        if (player.KeyInput.Start) { return true; }
        if (player.KeyInput.Pause) { return false; }
        if (player.KeyInput.Control) { camera.pos = defaultpos.ToArray(); }
        if (player.KeyInput.Left) { player.Velocity.X -= player.Accel; p = true; }
        if (player.KeyInput.Right) { player.Velocity.X += player.Accel; p = true; }
        if (player.KeyInput.Up) { player.Velocity.Z += player.Accel; p = true; }
        if (player.KeyInput.Down) { player.Velocity.Z -= player.Accel; p = true;} 
        if (player.KeyInput.In) { player.Velocity.Y -= player.Accel; p = true; }
        if (player.KeyInput.Out) { player.Velocity.Y += player.Accel; p = true; }
        if (!p) { let v = player.Velocity;
            player.Velocity = v.Scale(player.TranslationalDecayFactor); }
        camera.pos = pos3.Add( newdir.Scale(player.Velocity.Z) ).Add(
                                newup.Scale(player.Velocity.Y) ).Add(
                                newright.Scale(player.Velocity.X)).ToArray();
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