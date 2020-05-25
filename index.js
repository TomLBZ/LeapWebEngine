import { GSDFBox, GSDFSphere, GMeshBox, GMeshSphere } from './lib/gobject.js';
import { Scene } from './lib/scene.js';
import { WebGLRenderer } from './lib/renderer.js';
import { readShaderSourcesAsync, Material, MatType } from './lib/material.js';
import { Camera } from './lib/camera.js';
import { DebugConsole } from './lib/debug.js';

import { runTests } from './test.js';
import { matrixToString } from './lib/matrix.js';

"use strict";
(async function () {
    // runTests();
    
    //get source files.
    await readShaderSourcesAsync();
    
    //initialize debugConsole.
    let debugRoot = document.getElementById("console-root");
    let debugConsole = new DebugConsole(debugRoot);
    debugConsole.activate();

    //initialize renderer.
    let canvas = document.querySelector("#leapSpace");
    let renderer = new WebGLRenderer(canvas, 600, 400);
    debugConsole.addLabel("canvas size", () => renderer.width.toString() + ", " + renderer.height.toString());
    debugConsole.addLabel("renderer status", () => renderer.renderCount);

    //create scene.
    let scene = new Scene();
    debugConsole.addLabel("scene object#", () => scene.objectKeys());

    scene.addObject(
        new GMeshBox(
            [40, 50, 130],
            "mbox1",
            new Material(MatType.MESH_DEFAULT),
            [0, 0, 0],
            [0, 0, 0]
        )
    );

    // scene.addObject(
    //     new GSDFBox(
    //         [20, 30, 20],
    //         "box1",
    //         new Material(MatType.SDF_BOX),
    //         [0, 0, 0],
    //         [0, 0, 0]
    //     )
    // );

    // scene.addObject(
    //     new GSDFSphere(
    //         30,
    //         "sph1",
    //         new Material(MatType.SDF_SPHERE),
    //         [0, 0, 0],
    //         [0, 0, 0]
    //     )
    // );

    //create camera.
    let camera = new Camera([0, 0, 50], [0, 0, 1], [0, 1, 0]);
    debugConsole.addLabel("camera matrix", () =>  matrixToString(camera.getWorldToViewMatrix()));
    debugConsole.addLabel("camera pos", () =>  camera.pos);

    let renderFunc = () => renderer.renderScene(scene, camera);
    debugConsole.addCommands("small step", {
        "←": () => {camera.pos[0] = camera.pos[0] - 1; renderFunc();},
        "→": () => {camera.pos[0] = camera.pos[0] + 1; renderFunc();},
        "↑": () => {camera.pos[1] = camera.pos[1] + 1; renderFunc();},
        "↓": () => {camera.pos[1] = camera.pos[1] - 1; renderFunc();},
        "move forward": () => {camera.pos[2] = camera.pos[2] + 1; renderFunc();},
        "move backward": () => {camera.pos[2] = camera.pos[2] - 1; renderFunc();}
    });
    debugConsole.addCommands("big step", {
        "←": () => {camera.pos[0] = camera.pos[0] - 5; renderFunc();},
        "→": () => {camera.pos[0] = camera.pos[0] + 5; renderFunc();},
        "↑": () => {camera.pos[1] = camera.pos[1] + 5; renderFunc();},
        "↓": () => {camera.pos[1] = camera.pos[1] - 5; renderFunc();},
        "→↓": () => {camera.pos[0] = camera.pos[0] + 5; camera.pos[1] = camera.pos[1] - 5; renderFunc();},
        "←↑": () => {camera.pos[0] = camera.pos[0] - 5; camera.pos[1] = camera.pos[1] + 5; renderFunc();},
        "→↑": () => {camera.pos[0] = camera.pos[0] + 5; camera.pos[1] = camera.pos[1] + 5; renderFunc();},
        "←↓": () => {camera.pos[0] = camera.pos[0] - 5; camera.pos[1] = camera.pos[1] - 5; renderFunc();},
        "move forward": () => {camera.pos[2] = camera.pos[2] + 5; renderFunc();},
        "move backward": () => {camera.pos[2] = camera.pos[2] - 5; renderFunc();}
    });
    renderFunc();
})();

