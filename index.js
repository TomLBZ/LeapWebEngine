
import { readShaderSourcesAsync } from './lib/rendering/material.js';
import { Game } from './lib/Game.js';
import { DebugConsole } from './lib/debug.js';

"use strict";
(async function () {
    await readShaderSourcesAsync(); 
    let debugRoot = document.getElementById("console-root");
    let debugConsole = new DebugConsole(debugRoot);
    let canvas = document.querySelector("#leapSpace");
    var totaltime = 0.;
    let mygame = new Game(canvas, window);
    mygame.InitializeECS();
    if(mygame.DebugMode){
        //let debugConsole = mygame.myECS.Systems[3];
        debugConsole.activate();
        debugConsole.addLabel("canvas size", () => canvas.width.toString() + ", " + canvas.height.toString());
        // debugConsole.addLabel("renderer status", () => renderer.renderCount);
        // debugConsole.addLabel("scene object#", () => scene.objectKeys());
        // debugConsole.addLabel("camera pos", () =>  camera.pos);
        // debugConsole.addLabel("camera direction", () =>  camera.direction);
        // debugConsole.addLabel("camera up", () =>  camera.up);
        debugConsole.addLabel("fps", () => mygame.Fps);
        // debugConsole.addLabel("animationTimeField", () => renderer.animationTimeField);
    }

    mygame.SetWindowOrRoot(window);
    debugConsole.addCommands("Start / Stop", {
        "Start": () => {mygame.start();},
        "Stop": () => {mygame.stop();},
    });
    mygame.start();
})();