import { Entity } from "./ECS.js";
import { Vec3 } from './matrix.js';

const _player = {
    name: 'player',
    defaults:{
        //for render system:
        p: [0.,0.,0.], //centre of mass position and cam centre
        dir: [0,0,-1], //cam facing
        up: [0,1,0], //cam up
        fov: 0., //cam fov
        ratio:1., //cam aspect ratio
        near:0., //cam near dist
        far:0., //cam far dist
        w: 1., //cam turn angular speed
        yaw: 0., //cam yaw
        pitch: 0., //cam pitch
        rot_decay: 0.8, //rotational damping
        sdf_name: 'sphere', //shape of sdf
        visible: false, //render or not
        color: [0,0,255], //color
        transparency: 0.5, //transparency
        reflective: 0.25, //reflection strength, 0 being non-reflective
        refractive: 0.1, //refractive strength, 0 being non-refractive
        //for physics system:
        m: 1., //mass
        r: 10., //radius
        drive: 0.01, //drive force magnitude
        v: [0.,0.,0.], //velocity
        F: [0.,0.,0.], //force vector 
        trans_decay: 0.9, //translational damping
        movable: true, //does it move
        turnable: true, //can it be turned
        collision: true, //does it collide
        label: 'player', //label text
    }
};

const _structure = {
    name: 'structure',
    defaults:{
        //for render system:
        sdf_name: 'box',
        visible: true,
        color: [0,0,255], 
        transparency: 0.5, 
        reflective: 0.25, 
        refractive: 0.1, 
        //for physics system:
        movable: false,
        turnable: false,
        collision: true,
        label: 'structure'
    }
}

const _box = {
    name: 'box',
    defaults:{
        //for render system:
        p: [0.,0.,0.], //centre of mass position
        sdf_name: 'box',
        visible: true,
        color: [125,200,50], 
        transparency: 0.2, 
        reflective: 0.7, 
        refractive: 0.2, 
        //for physics system:
        m: 1., //mass
        drive: 0.01, //drive force magnitude
        F: [0.,0.,0.], //force vector 
        T: [0.,0.,0.], //torque vector
        trans_decay: 0.9, //translational damping
        rot_decay: 0.8, //rotational damping
        movable: true, //does it move
        turnable: true, //does it turn
        collision: true, //does it collide
        label: 'box', //label text
    }
}

const _laser = {
    name: 'laser',
    defaults:{
        //for render system:
        p: [0.,0.,0.], //centre of mass position
        sdf_name: 'cylinder',
        visible: true,
        color: [255,0,50], 
        transparency: 0.1, 
        reflective: 0, 
        refractive: 0, 
        //for physics system:
        m: 1., //mass
        drive: 0.01, //drive force magnitude
        F: [0.,0.,0.], //force vector 
        T: [0.,0.,0.], //torque vector
        trans_decay: 0, //translational damping
        rot_decay: 0, //rotational damping
        movable: true, //does it move
        turnable: true, //does it turn
        collision: true, //does it collide
        label: 'laser', //label text
    }
}

export {_player, _structure, _box, _laser};