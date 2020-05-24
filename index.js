import { GSDFBox, GSDFSphere } from './lib/gobject.js';
import { Scene } from './lib/scene.js';
import { WebGLRenderer } from './lib/renderer.js';
import { readShaderSourcesAsync, Material, MatType } from './lib/material.js';
import { Camera } from './lib/camera.js';

(async function () {
    await readShaderSourcesAsync();
    let scene = new Scene();
    scene.addObject(
        new GSDFBox(
            [20, 30, 20],
            "box1",
            new Material(MatType.SDF_BOX),
            [0, 0, 0],
            [0, 0, 0]
        )
    );
    scene.addObject(
        new GSDFSphere(
            30,
            "sph1",
            new Material(MatType.SDF_SPHERE),
            [0, 0, 0],
            [0, 0, 0]
        )
    );

    let canvas = document.querySelector("#leapSpace");
    let renderer = new WebGLRenderer(canvas, 600, 400);
    let camera = new Camera([0, 0, -50], [0, 0, 1], [0, 1, 0]);
    renderer.renderScene(scene, camera);
})();

