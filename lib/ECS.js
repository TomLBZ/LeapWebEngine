import {matrixLookAt, matrixProjection, vectorAdd, vectorMinus} from './matrix.js';
export function funcBind(obj, methodFunc){
    return function () {
      methodFunc.apply(obj, arguments);
    };
}
export function removeFromArray(array, startIndex, removeCount){
    let len = array.length;
    let removeLen = 0;
    if (startIndex >= len || removeCount === 0) return;
    removeCount = startIndex + removeCount > len ? (len - startIndex) : removeCount;
    removeLen = len - removeCount;
    for (let i = startIndex; i < len; i += 1) {
        array[i] = array[i + removeCount];
    }
    array.length = removeLen;
}
export function getWorldToViewMatrix(player) {
  return matrixLookAt(player.p, vectorAdd(player.p, player.dir), player.up);
}
export function getProjectionMatrix(player) {
  let right = Math.tan(player.fov / 2) * player.near;
  let top = right / player.ratio;
  return matrixProjection(right, top, player.near, player.far);
}
export function setLookTarget(player, pos, target, up) {
  player.pos = pos;
  player.direction = vectorMinus(target, player.pos);
  player.up = up;
}
export function setLookDirection(player, pos, direction, up) {
  player.pos = pos;
  player.direction = direction;
  player.up = up;
}
const MAX_SALTS = 10000;//prevent id collision over network
const MAX_ENTITY_PER_GENERATOR = Math.floor(Number.MAX_SAFE_INTEGER / MAX_SALTS) - 1;
let currentSalt = 0;
export class UIDGenerator{
  constructor(salt = 0) {
    this.Salt = salt;
    this.UidCounter = 0;
  }
  Next(){ //next id
    let nextUid = this.Salt + this.UidCounter * MAX_SALTS;
    if (++this.UidCounter >= MAX_ENTITY_PER_GENERATOR) {
      this.UidCounter = 0;
    }
    return nextUid;
  }
}
export class UID{
    constructor(startsalt){
        this.StartSalt = startsalt;
        this.CurrentSalt = startsalt;
        this.DefaultUIDGenerator = new UIDGenerator(this.CurrentSalt++);
    }
    IsSaltedBy(id,salt){return id % MAX_SALTS === salt;}
    NextSalt(){
        let salt = this.CurrentSalt;
        if(++this.CurrentSalt > MAX_SALTS - 1){this.CurrentSalt = this.StartSalt;}
        return salt;
    }
    NextGenerator(){return new UIDGenerator(this.NextSalt());}
}
const UID_Obj = new UID(0);
export class Entity{
    constructor(id, components = []){
        this.ID = null;
        if (typeof id === 'number'){this.ID = id;} 
        else if (id instanceof UIDGenerator) {this.ID = id.Next();} 
        else{this.ID = UID_Obj.DefaultUIDGenerator.Next();}
        this.Systems = [];
        this.SystemsDirty = false;//components changed, system need recheck
        this.Components = {};
        for (let i = 0, component; component = components[i]; i += 1){
            if (component.getDefaults){this.Components[component.name] = component.getDefaults();}
            else{this.Components[component.name] = Object.assign({},components[i].defaults);}
        }
        this.iAMRendered = false;
        this.ECS = null;
    }
    AddToECS(ecs) {
        this.ECS = ecs;
        this.SetSystemsDirty();
    }
    SetSystemsDirty(){//force re-check systems
        if (!this.SystemsDirty && this.ECS){
            this.SystemsDirty = true;
            this.ECS.entitiesSystemsDirty.push(this);
        }
    }
    AddSystem(system){ this.Systems.push(system);}
    RemoveSystem(system){
        let index = this.Systems.indexOf(system);
        if (index !== -1){removeFromArray(this.Systems, index, 1);}
    }
    AddComponent(name, data){
        this.Components[name] = data || {};
        this.SetSystemsDirty();
    }
    RemoveComponent(name){
        if (!this.Components[name]){return;}
        this.Components[name] = undefined;
        this.SetSystemsDirty();
    }
    UpdateComponent(name, data){
        let component = this.Components[name];
        if (!component){this.AddComponent(name, data);} 
        else{
            let keys = Object.keys(data);
            for (let i = 0, key; key = keys[i]; i += 1){
                component[key] = data[key];
            }
        }
    }
    UpdateComponents(componentsData){
        let components = Object.keys(componentsData);
        for (let i = 0, component; component = components[i]; i += 1){
            this.UpdateComponent(component, componentsData[component]);
        }
    }
    Dispose(){
        for (var i = 0, system; system = this.systems[0]; i += 1){system.RemoveEntity(this);}
    }
}
export class System{
    constructor(interval=1){
        this.UpdateInterval = interval;
        this.Entities = [];
    }
    AddEntity(entity){
        entity.AddSystem(this);
        this.Entities.push(entity);
        this.Enter(entity);
    }
    RemoveEntity(entity){
        let index = this.Entities.indexOf(entity);
        if (index !== -1){
            entity.RemoveSystem(this);
            removeFromArray(this.Entities, index, 1);
            this.Exit(entity);
        }
    }
    UpdateAll(elapsed){
        this.PreUpdate();
        for (let i = 0, entity; entity = this.Entities[i]; i += 1){
            this.Update(entity, elapsed);
        }
        this.PostUpdate();
    }
    Dispose(){
        for (let i = 0, entity; entity = this.Entities[i]; i += 1){
            entity.RemoveSystem(this);
            this.Exit(entity);
        }
    }
    PreUpdate(){}
    PostUpdate(){}
    IsEligible(entity){return false;}
    Enter(entity){}
    Exit(entity){}
    Update(entity) {}
}
export class ECS {
    constructor() {
      this.Entities = [];
      this.EntitiesSystemsDirty = [];
      this.Systems = [];
      this.UpdateCounter = 0;
      this.LastUpdate = 0.;
    }
    GetEntityById(id) {
      for (let i = 0, entity; entity = this.Entities[i]; i += 1) {
        if (entity.id === id) {
          return entity;
        }
      }
      return null;
    }
    AddEntity(entity) {
      this.Entities.push(entity);
      entity.AddToECS(this);
    }
    RemoveEntity(entity) {
      let index = this.Entities.indexOf(entity);
      let entityRemoved = null;
      if (index !== -1) {
        entityRemoved = this.Entities[index];  
        entity.Dispose();
        this.RemoveEntityIfDirty(entityRemoved);
        removeFromArray(this.Entities, index, 1);
      }
      return entityRemoved;
    }
    RemoveEntityById(entityId) {
      for (let i = 0, entity; entity = this.Entities[i]; i += 1) {
        if (entity.id === entityId) {
          entity.Dispose();
          this.RemoveEntityIfDirty(entity);
          removeFromArray(this.Entities, i, 1);
          return entity;
        }
      }
    }
    RemoveEntityIfDirty(entity) {
      let index = this.EntitiesSystemsDirty.indexOf(entity);
      if (index !== -1) {
        removeFromArray(this.Entities, index, 1);
      }
    }
    AddSystem(system) {
      this.Systems.push(system);
      for (let i = 0, entity; entity = this.Entities[i]; i += 1) {
        if (system.IsEligible(entity)) {
          system.AddEntity(entity);
        }
      }
    }
    RemoveSystem(system) {
      let index = this.Systems.indexOf(system);
      if (index !== -1) {
        removeFromArray(this.Systems, index, 1);
        system.Dispose();
      }
    }
    CleanDirtyEntities() {
      for (let i = 0, entity; entity = this.EntitiesSystemsDirty[i]; i += 1) {
        for (let s = 0, system; system = this.Systems[s]; s += 1) {
          let index = entity.Systems.indexOf(system);
          let entityTest = system.IsEligible(entity);
          if (index === -1 && entityTest) {
            system.AddEntity(entity);
          } else if (index !== -1 && !entityTest) {
            system.RemoveEntity(entity);
          }
        }
        entity.SystemsDirty = false;
      }
      this.EntitiesSystemsDirty = [];
    }
    Update(now) {
      let elapsed = now - this.LastUpdate;
      for (let i = 0, system; system = this.Systems[i]; i += 1) {
        if (this.UpdateCounter % system.UpdateInterval > 0) {
          break;
        }
        if (this.EntitiesSystemsDirty.length) {
          this.CleanDirtyEntities();
        }
        system.UpdateAll(elapsed);
      }
      this.UpdateCounter += 1;
      this.LastUpdate = now;
    }
  }