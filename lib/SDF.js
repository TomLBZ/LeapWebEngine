import { Vec3 } from "./matrix.js";
export class SDF_Evaluator{
    constructor(){
        this.SDF_List = [];
        this.SDF_List['sphere'] = function Sphere(entity, p){
            return new Vec3(p).Length() - entity.Components.r;
        }
        this.SDF_List['box'] = function Box(p, b){
            let q = new Vec3(p).Abs().Minus(b);
            return q.SetLowerThreshold(0.0).Length() + Math.min(q.MaxTerm(),0.0);
        }
    }
}