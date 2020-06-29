/**通用Component
GeneralComponents.js
- 各种具体通用组件的定义（非singleton）
  - transform组件（位置，角度）
  - rigidbody组件（质量，速度，角速度）
  - force组件（力，力矩）
  - render组件（shader ID，material对象）
  - sdfCollider组件（SDF函数）
  - sphereCollider组件（SDF函数）
- 各种具体通用组件定义（singleton）
  - input组件（各个按键的输入情况）
  - worldSDFCollider组件（整个世界的SDF）
  - worldGravityToPlane组件（整个世界的引力平面，引力大小）
 *//**游戏特定Component
CustomComponents.js
- 各种特殊用途组件定义（非singleton）
  - BallControl组件（力大小）
- 各种特殊用途组件定义（singleton）
  - gameStatus组件（引力平面状态，
 */
export class Component{
    constructor(compType){
        this.Type = compType;
    }h
}