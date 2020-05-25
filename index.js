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
            [50, 50, 50],
            "mbox1",
            new Material(MatType.MESH_DEFAULT),
            [-20, 0, 0],
            [0, 0, 0]
        )
    );

    scene.addObject(
        new GMeshBox(
            [30, 80, 30],
            "mbox2",
            new Material(MatType.MESH_DEFAULT),
            [40, 0, 0],
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
    let camera = new Camera(Math.PI * 0.5, 600 / 400, 1, 1000);
    camera.setLookDirection([0, 0, 105], [0, 0, -1], [0, 1, 0]);
    debugConsole.addLabel("camera matrix", () =>  matrixToString(camera.getWorldToViewMatrix()));
    debugConsole.addLabel("camera pos", () =>  camera.pos);
    debugConsole.addLabel("camera direction", () =>  camera.direction);
    debugConsole.addLabel("camera up", () =>  camera.up);

    let renderFunc = () => renderer.renderScene(scene, camera);
    debugConsole.addCommands("small step", {
        "←": () => {camera.pos[0] = camera.pos[0] - 1; renderFunc();},
        "→": () => {camera.pos[0] = camera.pos[0] + 1; renderFunc();},
        "↑": () => {camera.pos[1] = camera.pos[1] + 1; renderFunc();},
        "↓": () => {camera.pos[1] = camera.pos[1] - 1; renderFunc();},
        "forward(-)": () => {camera.pos[2] = camera.pos[2] - 1; renderFunc();},
        "backward(+)": () => {camera.pos[2] = camera.pos[2] + 1; renderFunc();}
    });
    debugConsole.addCommands("big step", {
        "←": () => {camera.pos[0] = camera.pos[0] - 10; renderFunc();},
        "→": () => {camera.pos[0] = camera.pos[0] + 10; renderFunc();},
        "↑": () => {camera.pos[1] = camera.pos[1] + 10; renderFunc();},
        "↓": () => {camera.pos[1] = camera.pos[1] - 10; renderFunc();},
        "→↓": () => {camera.pos[0] = camera.pos[0] + 10; camera.pos[1] = camera.pos[1] - 10; renderFunc();},
        "←↑": () => {camera.pos[0] = camera.pos[0] - 10; camera.pos[1] = camera.pos[1] + 10; renderFunc();},
        "→↑": () => {camera.pos[0] = camera.pos[0] + 10; camera.pos[1] = camera.pos[1] + 10; renderFunc();},
        "←↓": () => {camera.pos[0] = camera.pos[0] - 10; camera.pos[1] = camera.pos[1] - 10; renderFunc();},
        "forward(-)": () => {camera.pos[2] = camera.pos[2] - 10; renderFunc();},
        "backward(+)": () => {camera.pos[2] = camera.pos[2] + 10; renderFunc();}
    });
    debugConsole.addCommands("camera direction x", {
        "←": () => {camera.direction[0] = camera.direction[0] - 0.1; renderFunc();},
        "→": () => {camera.direction[0] = camera.direction[0] + 0.1; renderFunc();},
    });
    debugConsole.addCommands("camera up x", {
        "←": () => {camera.up[0] = camera.up[0] - 0.1; renderFunc();},
        "→": () => {camera.up[0] = camera.up[0] + 0.1; renderFunc();},
    });
    renderFunc();
})();

