export class Scene {
    constructor(skybox, sunDirection){
        this.skybox = skybox;
        this.sunDirection = sunDirection;
        this.sceneObjectDict = {};
    }
    objectKeys() {
        let keys = [];
        for (let key in this.sceneObjectDict) {
            keys.push(key);
        }
        return keys;
    }
    addObject(gobj) {
        let id = gobj.id;
        if (id === undefined) console.error("# addObject error. id not valid.");
        if (id in this.sceneObjectDict) console.error("# addObject error. is duplicated.", id);
        this.sceneObjectDict[id] = gobj;
    }
}