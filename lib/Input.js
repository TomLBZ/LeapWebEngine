import { Vec3 } from './matrix.js';
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
export class Keyboard{
    constructor(window){
        this.BaseWindow = window;
        this.Left = false;
        this.Right = false;
        this.Up = false;
        this.Down = false;
        this.In = false;
        this.Out = false;
        this.Pause = false;
        this.Start = false;
        this.Control = false;
        this.BaseWindow.addEventListener("keydown", this.RedirectKeydownEvent.bind(this));
        this.BaseWindow.addEventListener("keyup", this.RedirectKeyupEvent.bind(this));
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
                this.Up = isdown;
                break;
            case KEY_VALUES.DOWN:
                this.Down = isdown;
                break;
            case KEY_VALUES.LEFT:
                this.Left = isdown;
                break;
            case KEY_VALUES.RIGHT:
                this.Right = isdown;
                break;
            case KEY_VALUES.W:
                this.Up = isdown;
                break;
            case KEY_VALUES.S:
                this.Down = isdown;
                break;
            case KEY_VALUES.A:
                this.Left = isdown;
                break;
            case KEY_VALUES.D:
                this.Right = isdown;
                break;
            case KEY_VALUES.LSHIFT:
                this.In = isdown;
                break;
            case KEY_VALUES.SPACE:
                this.Out = isdown;
                break;
            case KEY_VALUES.ESC:
                this.Pause = true;
                this.Start = false;
                break;
            case KEY_VALUES.RETURN:
                this.Start = isdown;
                this.Pause = false;
                break;
            case KEY_VALUES.LCTRL:
                this.Control = isdown;
                break;
            default:
                break;
        }
    }
}
export const MOUSE_VALUES = {
    LEFT:   0,
    MIDDLE: 1,
    RIGHT:  2
}
export class Mouse{
    constructor(window, canvas){
        this.BaseWindow = window;
        this.Canvas = canvas;
        this.degYaw = 0.;
        this.degPitch = 0.;
        this.degRange = 90.;
        this.Left = false;
        this.Right = false;
        this.Middle = false;
        this.Locked = false;
        this.Canvas.requestPointerLock = this.Canvas.requestPointerLock || this.Canvas.mozRequestPointerLock;
        document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
        this.Canvas.onclick = function() {canvas.requestPointerLock();}
        document.addEventListener('pointerlockchange', this.lockChangeAlert.bind(this), false);
        document.addEventListener('mozpointerlockchange', this.lockChangeAlert.bind(this), false);
        this.BaseWindow.addEventListener("mousemove", this.RedirectMousemoveEvent.bind(this));
        this.BaseWindow.addEventListener("mousedown", this.RedirectMousedownEvent.bind(this));
        this.BaseWindow.addEventListener("mouseup", this.RedirectMouseupEvent.bind(this));
    }
    lockChangeAlert() {
        var that = this;
        if(document.pointerLockElement===this.Canvas||document.mozPointerLockElement===this.Canvas){
            console.log('The pointer lock status is now locked');
            this.Locked = true;
            document.addEventListener("mousemove", that.RedirectMousemoveEvent.bind(that), false);
        } else {
            console.log('The pointer lock status is now unlocked');  
            this.Locked = false;
            document.removeEventListener("mousemove", that.RedirectMousemoveEvent.bind(that), false);
        }
    }
    RedirectMousemoveEvent(event){
        var dx = event.movementX || event.mozMovementX || 0;
        var dy = event.movementY || event.mozMovementY || 0;
        this.degYaw = -dx * this.degRange / this.BaseWindow.innerHeight;
        this.degPitch = dy * this.degRange / this.BaseWindow.innerWidth;
    }
    RedirectMousedownEvent(event){return this.RedirectMouseEvents(event, true);}
    RedirectMouseupEvent(event){return this.RedirectMouseEvents(event, false);}
    RedirectMouseEvents(event, isdown){
        switch (event.button) {
            case MOUSE_VALUES.LEFT:
                this.Left = isdown;
                break;
            case MOUSE_VALUES.RIGHT:
                this.Right = isdown;
                break;
            case MOUSE_VALUES.MIDDLE:
                this.Middle = isdown;
                break;
            default:
                break;
        }
    }
}