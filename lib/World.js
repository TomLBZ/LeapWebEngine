/*World.js
- World对象
  - public
    - void AddSystem(System)  添加系统
    - void AddEntity(Entity)  添加Entity
    - void RemoveEntity(Entity)  移除Entity
    - void Update()  更新一次
  - private
*/
export class World{
    constructor(){
        this.Systems = [];
        this.Entities = [];
        this.singletonComponents = {};
    }
    AddSystem(sys){
        this.Systems.push(sys);
    }
    AddEntity(en){
        this.Entities.push(sys);
    }
    AddSingletonComponent(singComp) {
        this.
    }
    // RemoveSystem(sys){}
    // RemoveEntity(en){}
    Update(){

    }
}