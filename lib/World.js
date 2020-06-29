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
        this.__time = 0; //temp trick
    }
    AddSystem(sys){
        this.Systems.push(sys);
    }
    AddEntity(en){
        this.Entities.push(en);
    }
    AddSingletonComponent(singComp) {
        let singCompType = singComp.Type;
        this.singletonComponents[singCompType] = singComp;
    }
    // RemoveSystem(sys){}
    // RemoveEntity(en){}
    Update(){
        console.log("# World.Update called.");

        //temp trick
        this.__time += 0.01;
        this.singletonComponents["WORLD_SDF_RENDERER"].uniformData['time'] = this.__time;

        for(let i = 0; i < this.Systems.length; i++) {
            let sys = this.Systems[i];
            let sign = sys.Sign;
            console.log("# sign:", sign);
            let params = [];
            for (let paramSign of sign) {
                params.push(this.singletonComponents[paramSign]);
            }
            sys.update(...params);
        }
    }
}