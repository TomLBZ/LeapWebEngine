import { vector3Cross, Mat3 } from './matrix.js';
export const KEY_VALUES = {
    BACKSPACE: 8,
    TAB:       9,
    RETURN:   13,
    LSHIFT:   16,
    LCTRL:    17,
    ESC:      27,
    SPACE:    32,
    PAGEUP:   33,
    PAGEDOWN: 34,
    END:      35,
    HOME:     36,
    LEFT:     37,
    UP:       38,
    RIGHT:    39,
    DOWN:     40,
    INSERT:   45,
    DELETE:   46,
    ZERO:     48, ONE: 49, TWO: 50, THREE: 51, FOUR: 52, FIVE: 53, SIX: 54, SEVEN: 55, EIGHT: 56, NINE: 57,
    A:        65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90,
    TILDA:    192
}
export const MOUSE_VALUES = {
    LEFT:   0,
    MIDDLE: 1,
    RIGHT:  2
}
export class Player{
    constructor(window, camera, bobject, canvas){
        this.BaseWindow = window;
        this.Eye = camera;
        this.BoundingObj = bobject;
        this.Position = this.Eye.pos;
        this.LookingAt = this.Eye.direction;
        this.Head = this.Eye.up;
        this.Speed = 0.002;
        this.AngularSpeed = 0.001;
        this.RotMatX = Mat3.RotMatX(0.);
        this.RotMatY = Mat3.RotMatY(0.);
        this.RotationalMatrix = this.RotMatX.MultMat(this.RotMatY);
        this.Canvas = canvas;
        this.KeyInput = {Left: false, Right: false, Up: false, Down: false, 
                In: false, Out: false, Pause: false, Start: false, Control: false};
        this.MouseInput = {Left: false, Right: false, Middle: false};
        this.Canvas.requestPointerLock = this.Canvas.requestPointerLock || this.Canvas.mozRequestPointerLock;
        document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
        this.Canvas.onclick = function() {canvas.requestPointerLock();}
        document.addEventListener('pointerlockchange', this.lockChangeAlert.bind(this), false);
        document.addEventListener('mozpointerlockchange', this.lockChangeAlert.bind(this), false);
        this.BaseWindow.addEventListener("mousemove", this.RedirectMousemoveEvent.bind(this));
        this.BaseWindow.addEventListener("mousedown", this.RedirectMousedownEvent.bind(this));
        this.BaseWindow.addEventListener("mouseup", this.RedirectMouseupEvent.bind(this));
        this.BaseWindow.addEventListener("keydown", this.RedirectKeydownEvent.bind(this));
        this.BaseWindow.addEventListener("keyup", this.RedirectKeyupEvent.bind(this));
    }
    lockChangeAlert() {
        var that = this;
        if(document.pointerLockElement === this.Canvas ||
        document.mozPointerLockElement === this.Canvas) {
            console.log('The pointer lock status is now locked');
            document.addEventListener("mousemove", that.RedirectMousemoveEvent.bind(that), false);
        } else {
            console.log('The pointer lock status is now unlocked');  
            document.removeEventListener("mousemove", that.RedirectMousemoveEvent.bind(that), false);
        }
    }
    RedirectMousemoveEvent(event){
        var dx = event.movementX || event.mozMovementX || 0;
        var dy = event.movementY || event.mozMovementY ||  0;
        var rot_abt_y = dx / this.BaseWindow.innerWidth * Math.PI;
        var rot_abt_x = dy / this.BaseWindow.innerHeight * Math.PI;
        var angleX = rot_abt_x;//= x * this.AngularSpeed * Math.PI / 180;
        var angleY = rot_abt_y;//= y * this.AngularSpeed * Math.PI / 180;
        this.RotMatX = Mat3.RotMatX(angleX);
        this.RotMatY = Mat3.RotMatY(angleY);
    }
    RedirectMousedownEvent(event){
        var rect = this.Canvas.getBoundingClientRect(),
            x = event.clientX - rect.left,
            y = event.clientY - rect.top;
        return this.RedirectMouseEvents(event, true);
    }
    RedirectMouseupEvent(event){
        var rect = this.Canvas.getBoundingClientRect(),
            x = event.clientX - rect.left,
            y = event.clientY - rect.top;
        return this.RedirectMouseEvents(event, false);
    }
    RedirectMouseEvents(event, isdown){
        switch (event.button) {
            case MOUSE_VALUES.LEFT:
                this.MouseInput.Left = isdown;
                break;
            case MOUSE_VALUES.RIGHT:
                this.MouseInput.Right = isdown;
                break;
            case MOUSE_VALUES.MIDDLE:
                this.MouseInput.Middle = isdown;
                break;
            default:
                break;
        }
    }
    RedirectKeydownEvent(event){
        event.preventDefault();
        return this.RedirectKeyEvents(event, true);
    }
    RedirectKeyupEvent(event){
        event.preventDefault();
        return this.RedirectKeyEvents(event, false);
    }
    RedirectKeyEvents(event, isdown){
        switch (event.keyCode) {
            case KEY_VALUES.UP:
                this.KeyInput.Up = isdown;
                break;
            case KEY_VALUES.DOWN:
                this.KeyInput.Down = isdown;
                break;
            case KEY_VALUES.LEFT:
                this.KeyInput.Left = isdown;
                break;
            case KEY_VALUES.RIGHT:
                this.KeyInput.Right = isdown;
                break;
            case KEY_VALUES.W:
                this.KeyInput.Up = isdown;
                break;
            case KEY_VALUES.S:
                this.KeyInput.Down = isdown;
                break;
            case KEY_VALUES.A:
                this.KeyInput.Left = isdown;
                break;
            case KEY_VALUES.D:
                this.KeyInput.Right = isdown;
                break;
            case KEY_VALUES.Z:
                this.Speed *= 0.999;
                break;
            case KEY_VALUES.X:
                this.Speed *= 1.001;
                break;
            case KEY_VALUES.LSHIFT:
                this.KeyInput.In = isdown;
                break;
            case KEY_VALUES.SPACE:
                this.KeyInput.Out = isdown;
                break;
            case KEY_VALUES.ESC:
                this.KeyInput.Pause = true;
                this.KeyInput.Start = false;
                break;
            case KEY_VALUES.RETURN:
                this.KeyInput.Start = isdown;
                this.KeyInput.Pause = false;
                break;
            case KEY_VALUES.LCTRL:
                this.KeyInput.Control = isdown;
                break;
            default:
                break;
        }
    }
    noop(){}
    Lookat(newdirection){
        var right = vector3Cross(this.Eye.up, this.Eye.direction);

    }
    MoveTo(newposition){

    }
    MoveBy(vectdirection){

    }
}