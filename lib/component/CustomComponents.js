import { Component } from "./Component.js";
// CustomComponents.js
// - 各种特殊用途组件定义（非singleton）
//   - BallControl组件（力大小）
// - 各种特殊用途组件定义（singleton）
//   - gameStatus组件（引力平面状态，游戏计分，暂停状态）
export class BallControlComponent extends Component{
    constructor(){
        this.force = [0.,0.,0.];
    }
}


export class GameStatusComponent extends Component {
    constructor(){
        super(COMP_CUSTOM_TYPES.GAME_STATUS);
        this.timeElapsed = 0;
        this.isPaused = false;
    }
}