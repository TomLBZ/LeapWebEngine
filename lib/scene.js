export class Scene {
    constructor(skybox, sunDirection){
        this.skybox = skybox;
        this.sunDirection = sunDirection;
        this.sceneObjectDict = {};
    }
    addObject(gobj) {
        let id = gobj.id;
        if (id === undefined) console.error("# addObject error. id not valid.");
        if (id in this.sceneObjectDict) console.error("# addObject error. is duplicated.", id);
        this.sceneObjectDict[id] = gobj;
    }
}