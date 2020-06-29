export class Entity{
    constructor(id, components){
        this.id = id;
        this.components = {};
        for(let i = 0; i < components.length; i++) {
            this.addComponent(components[i]);
        }
    }
    addComponent(comp){
        let compType = comp.Type;
        this.components[compType] = comp;
    }
}