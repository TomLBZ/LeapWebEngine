import { GENERAL_SIGNS, SINGLETON_SIGNS} from "./constants/SignTypes.js";
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
    Update(dt){
        console.log("# World.Update called.");
        this.__time += dt / 1000.;
        this.singletonComponents["WORLD_SDF_RENDERER"].uniformData['time'] = this.__time;
        for(let system of this.Systems){
            let sign = system.Sign;
            let sparams = [];
            let generalSigns = [];
            for(let sg of sign){
                if (sg in SINGLETON_SIGNS) sparams.push(this.singletonComponents[sg]);
                else generalSigns.push(sg);
            }
            let params = [...sparams];
            let broken = false;
            for(let entity of this.Entities){
                for(let s of generalSigns){
                    if(s in entity.components){
                        params.push(entity.components[s]);
                    }else{
                        broken = true;
                        break;
                    }
                }
                if(!broken) system.update(...params);
            }
        }
    }
}