import {GObjectMeshBox, GObjectMeshSphere} from './lib/gobject.js';
import {Scene} from './lib/scene.js';

let scene = new Scene();
scene.addObject(new GObjectMeshBox([20, 30, 20], "box1", null, [0, 0, 0], [0, 0, 0]));
scene.addObject(new GObjectMeshSphere(30, "sph1", null, [0, 0, 0], [0, 0, 0]));
console.log(scene);