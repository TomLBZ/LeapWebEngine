import { VectorFunctions } from "./math/Vector.js";
export class SDF_Generalfuncs{
    constructor(){}
    static fract(f){return f - Math.floor(f);}
    static fract3(f3){return [this.fract(f3[0]),this.fract(f3[1]),this.fract(f3[2])];}
    static floor3(v3){return [Math.floor(v3[0]),Math.floor(v3[1]),Math.floor(v3[2])];}
    static pseudoRnd3(v3){
        let offset = [27,113,57];
        let p = this.floor3(v3);
        let doffset = VectorFunctions.vecDot(p,offset);
        let n = Math.sin(doffset);
        let large = [2097152,262144,32768];
        let slarge = VectorFunctions.vecScale(large,n);
        let fslarge = this.fract3(slarge);
        let sfslarge = VectorFunctions.vecScale(fslarge,0.16);
        return VectorFunctions.vecShift(sfslarge,-0.08);
    }
}
export class SDF_Wrapper{
    constructor(){    }
    static sdfInfiniteRoundedCubes(p){
        let rnd = SDF_Generalfuncs.pseudoRnd3(p);
        let sum = VectorFunctions.vecAdd(p,rnd);
        let fsum = SDF_Generalfuncs.fract3(sum);
        p = VectorFunctions.vecShift(fsum,-0.5);
        p = VectorFunctions.vecAbs(p); 
        return VectorFunctions.vecMaxTerm(p) - 0.2 + VectorFunctions.vecDot(p, p)*0.5;
    }
    static sdfSphere( s, p){return VectorFunctions.vecLength(p)-s;}
    static sdfBox( p, b){
      let q =VectorFunctions.vecMinus( VectorFunctions.vecAbs(p) , b);
      let q_trimup = VectorFunctions.vecTrimBelow(q,0.0);
      let lq_trimup = VectorFunctions.vecLength(q_trimup);
      let q_maxterm = VectorFunctions.vecMaxTerm(q);
      let adjustment = Math.min(q_maxterm,0.0);
      return lq_trimup + adjustment;
    }
//TODO: translate completed GLSL into js. to later if have time.
/*
    float sdfRoundBox(float r, vec3 p, vec3 b){
      vec3 q = abs(p) - b;
      return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
    }
    float sdfTorus(vec2 t, vec3 p){
      vec2 q = vec2(length(p.xz)-t.x,p.y);
      return length(q)-t.y;
    }
    float sdfCappedTorus(in float rb, in float ra, in vec2 sc, in vec3 p){
      p.x = abs(p.x);
      float k = (sc.y*p.x>sc.x*p.y) ? dot(p.xy,sc) : length(p.xy);
      return sqrt( dot(p,p) + ra*ra - 2.0*ra*k ) - rb;
    }
    float sdfLink(float le, float r1, float r2, vec3 p){
      vec3 q = vec3( p.x, max(abs(p.y)-le,0.0), p.z );
      return length(vec2(length(q.xy)-r1,q.z)) - r2;
    }
    float sdfInfiniteCylinder(vec3 p, vec3 c){return length(p.xz-c.xy)-c.z;}
    float sdfCone(float angle, float h, in vec3 p){
      vec2 q = h*vec2(tan(angle),-1.0);
      vec2 w = vec2( length(p.xz), p.y );
      vec2 a = w - q*clamp( dot(w,q)/dot(q,q), 0.0, 1.0 );
      vec2 b = w - q*vec2( clamp( w.x/q.x, 0.0, 1.0 ), 1.0 );
      float k = sign( q.y );
      float d = min(dot( a, a ),dot(b, b));
      float s = max( k*(w.x*q.y-w.y*q.x),k*(w.y-q.y)  );
      return sqrt(d)*sign(s);
    }
    float sdfApproxCone(float angle, float h, vec3 p){
      float q = length(p.xz);
      return max(dot(vec2(sin(angle),cos(angle)),vec2(q,p.y)),-h-p.y);
    }
    float sdfInfiniteCone(float angle, vec3 p){
        vec2 c = vec2(sin(angle),cos(angle));
        vec2 q = vec2( length(p.xz), -p.y );
        float d = length(q-c*max(dot(q,c), 0.0));
        return d * ((q.x*c.y-q.y*c.x<0.0)?-1.0:1.0);
    }
    float sdfPlane(float h, vec3 p, vec3 n){
      return dot(p,normalize(n)) + h;
    }
    float sdfHexagonalPrism(vec2 h, vec3 p){
      const vec3 k = vec3(-0.8660254, 0.5, 0.57735);
      p = abs(p);
      p.xy -= 2.0*min(dot(k.xy, p.xy), 0.0)*k.xy;
      vec2 d = vec2(
           length(p.xy-vec2(clamp(p.x,-k.z*h.x,k.z*h.x), h.x))*sign(p.y-h.x),
           p.z-h.y );
      return min(max(d.x,d.y),0.0) + length(max(d,0.0));
    }
    float sdfApproxTriangularPrism(vec2 h, vec3 p){
      vec3 q = abs(p);
      return max(q.z-h.y,max(q.x*0.866025+p.y*0.5,-p.y)-h.x*0.5);
    }
    float sdfHorizontalCapsuleLine(float r, vec3 p, vec3 a, vec3 b){
      vec3 pa = p - a, ba = b - a;
      float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
      return length( pa - ba*h ) - r;
    }
    float sdfVerticalCapsuleLine(float r, float h, vec3 p){
      p.y -= clamp( p.y, 0.0, h );
      return length( p ) - r;
    }
    float sdfCappedCylinder(float r, float h, vec3 p){
      vec2 d = abs(vec2(length(p.xz),p.y)) - vec2(h,r);
      return min(max(d.x,d.y),0.0) + length(max(d,0.0));
    }
    float sdfCapped2PtCylinder(float r, vec3 p, vec3 a, vec3 b){
      vec3  ba = b - a;
      vec3  pa = p - a;
      float baba = dot(ba,ba);
      float paba = dot(pa,ba);
      float x = length(pa*baba-ba*paba) - r*baba;
      float y = abs(paba-baba*0.5)-baba*0.5;
      float x2 = x*x;
      float y2 = y*y*baba;
      float d = (max(x,y)<0.0)?-min(x2,y2):(((x>0.0)?x2:0.0)+((y>0.0)?y2:0.0));
      return sign(d)*sqrt(abs(d))/baba;
    }
    float sdfRoundedCylinder(float ra, float rb, float h, vec3 p){
      vec2 d = vec2( length(p.xz)-2.0*ra+rb, abs(p.y) - h );
      return min(max(d.x,d.y),0.0) + length(max(d,0.0)) - rb;
    }
    float sdfCappedCone(float h, float r1, float r2, vec3 p){
      vec2 q = vec2( length(p.xz), p.y );
      vec2 k1 = vec2(r2,h);
      vec2 k2 = vec2(r2-r1,2.0*h);
      vec2 ca = vec2(q.x-min(q.x,(q.y<0.0)?r1:r2), abs(q.y)-h);
      vec2 cb = q - k1 + k2*clamp( dot(k1-q,k2)/dot2(k2), 0.0, 1.0 );
      float s = (cb.x<0.0 && ca.y<0.0) ? -1.0 : 1.0;
      return s*sqrt( min(dot2(ca),dot2(cb)) );
    }
    float sdfCapped2PtCone(float ra, float rb, vec3 p, vec3 a, vec3 b){
        float rba  = rb-ra;
        float baba = dot(b-a,b-a);
        float papa = dot(p-a,p-a);
        float paba = dot(p-a,b-a)/baba;
        float x = sqrt( papa - paba*paba*baba );
        float cax = max(0.0,x-((paba<0.5)?ra:rb));
        float cay = abs(paba-0.5)-0.5;
        float k = rba*rba + baba;
        float f = clamp( (rba*(x-ra)+paba*baba)/k, 0.0, 1.0 );
        float cbx = x-ra - f*rba;
        float cby = paba - f;
        float s = (cbx < 0.0 && cay < 0.0) ? -1.0 : 1.0;
        return s*sqrt( min(cax*cax + cay*cay*baba,
                           cbx*cbx + cby*cby*baba) );
    }
    float sdfSolidAngle(float angle, float ra, vec3 p){
      vec2 c = vec2(sin(angle),cos(angle));
      vec2 q = vec2( length(p.xz), p.y );
      float l = length(q) - ra;
      float m = length(q - c*clamp(dot(q,c),0.0,ra) );
      return max(l,m*sign(c.y*q.x-c.x*q.y));
    }
    float sdfRoundCone(float r1, float r2, float h, vec3 p){
      vec2 q = vec2( length(p.xz), p.y );  
      float b = (r1-r2)/h;
      float a = sqrt(1.0-b*b);
      float k = dot(q,vec2(-b,a));
      if( k < 0.0 ) return length(q) - r1;
      if( k > a*h ) return length(q-vec2(0.0,h)) - r2;  
      return dot(q, vec2(a,b) ) - r1;
    }
    float sdfRound2PtCone(float r1, float r2, vec3 p, vec3 a, vec3 b){
        vec3  ba = b - a;
        float l2 = dot(ba,ba);
        float rr = r1 - r2;
        float a2 = l2 - rr*rr;
        float il2 = 1.0/l2;
        vec3 pa = p - a;
        float y = dot(pa,ba);
        float z = y - l2;
        float x2 = dot2( pa*l2 - ba*y );
        float y2 = y*y*l2;
        float z2 = z*z*l2;
        float k = sign(rr)*rr*rr*x2;
        if( sign(z)*a2*z2 > k ) return  sqrt(x2 + z2)        *il2 - r2;
        if( sign(y)*a2*y2 < k ) return  sqrt(x2 + y2)        *il2 - r1;
                                return (sqrt(x2*a2*il2)+y*rr)*il2 - r1;
    }
    float sdfEllipsoid(vec3 p, vec3 r){
      float k0 = length(p/r);
      float k1 = length(p/(r*r));
      return k0*(k0-1.0)/k1;
    }
    float sdfRhombus(float la, float lb, float h, float ra, vec3 p){
      p = abs(p);
      vec2 b = vec2(la,lb);
      float f = clamp( (ndot(b,b-2.0*p.xz))/dot(b,b), -1.0, 1.0 );
      vec2 q = vec2(length(p.xz-0.5*b*vec2(1.0-f,1.0+f))*sign(p.x*b.y+p.z*b.x-b.x*b.y)-ra, p.y-h);
      return min(max(q.x,q.y),0.0) + length(max(q,0.0));
    }
    float sdfOctahedron(float s, vec3 p){
      p = abs(p);
      float m = p.x+p.y+p.z-s;
      vec3 q;
           if( 3.0*p.x < m ) q = p.xyz;
      else if( 3.0*p.y < m ) q = p.yzx;
      else if( 3.0*p.z < m ) q = p.zxy;
      else return m*0.57735027;
        
      float k = clamp(0.5*(q.z-q.y+s),0.0,s); 
      return length(vec3(q.x,q.y-s+k,q.z-k)); 
    }
    float sdfApproxOctahedron(float s, vec3 p){
      p = abs(p);
      return (p.x+p.y+p.z-s)*0.57735027;
    }
    float sdfPyramid(float h, vec3 p){
      float m2 = h*h + 0.25;
      p.xz = abs(p.xz);
      p.xz = (p.z>p.x) ? p.zx : p.xz;
      p.xz -= 0.5;
      vec3 q = vec3( p.z, h*p.y - 0.5*p.x, h*p.x + 0.5*p.y);
      float s = max(-q.x,0.0);
      float t = clamp( (q.y-0.5*p.z)/(m2+0.25), 0.0, 1.0 );
      float a = m2*(q.x+s)*(q.x+s) + q.y*q.y;
      float b = m2*(q.x+0.5*t)*(q.x+0.5*t) + (q.y-m2*t)*(q.y-m2*t);
      float d2 = min(q.y,-q.x*m2-q.y*0.5) > 0.0 ? 0.0 : min(a,b);
      return sqrt( (d2+q.z*q.z)/m2 ) * sign(max(q.z,-p.y));
    }
    float udfTriangle( vec3 p, vec3 a, vec3 b, vec3 c ){
      vec3 ba = b - a; vec3 pa = p - a;
      vec3 cb = c - b; vec3 pb = p - b;
      vec3 ac = a - c; vec3 pc = p - c;
      vec3 nor = cross( ba, ac );
      return sqrt(
        (sign(dot(cross(ba,nor),pa)) +
         sign(dot(cross(cb,nor),pb)) +
         sign(dot(cross(ac,nor),pc))<2.0)
         ?
         min( min(
         dot2(ba*clamp(dot(ba,pa)/dot2(ba),0.0,1.0)-pa),
         dot2(cb*clamp(dot(cb,pb)/dot2(cb),0.0,1.0)-pb) ),
         dot2(ac*clamp(dot(ac,pc)/dot2(ac),0.0,1.0)-pc) )
         :
         dot(nor,pa)*dot(nor,pa)/dot2(nor) );
    }
    float udfQuadrilateral( vec3 p, vec3 a, vec3 b, vec3 c, vec3 d ){
      vec3 ba = b - a; vec3 pa = p - a;
      vec3 cb = c - b; vec3 pb = p - b;
      vec3 dc = d - c; vec3 pc = p - c;
      vec3 ad = a - d; vec3 pd = p - d;
      vec3 nor = cross( ba, ad );
      return sqrt(
        (sign(dot(cross(ba,nor),pa)) +
         sign(dot(cross(cb,nor),pb)) +
         sign(dot(cross(dc,nor),pc)) +
         sign(dot(cross(ad,nor),pd))<3.0)
         ?
         min( min( min(
         dot2(ba*clamp(dot(ba,pa)/dot2(ba),0.0,1.0)-pa),
         dot2(cb*clamp(dot(cb,pb)/dot2(cb),0.0,1.0)-pb) ),
         dot2(dc*clamp(dot(dc,pc)/dot2(dc),0.0,1.0)-pc) ),
         dot2(ad*clamp(dot(ad,pd)/dot2(ad),0.0,1.0)-pd) )
         :
         dot(nor,pa)*dot(nor,pa)/dot2(nor) );
    }
*/

}

export class SDF_OpWrapper{
    constructor(){}
    static mix(x,y,a){return x * (1.0-a)+y*a;}
    static sdf_opUnion( f1,  f2){return Math.min(f1, f2);}
    static sdf_opIntersect( f1,  f2){return Math.max(f1, f2);}
    static sdf_opSubtract( f1,  f2){return Math.max(-f1, f2);}
    static sdf_opFuzzyUnion( f1,  f2,  k){
        let tmp = 0.5 + 0.5*(f2-f1)/k;
        let h = Math.max(0.0,tmp);
        h = Math.min(1.0,h);
        return SDF_OpWrapper.mix(f2, f1, h) - k*h*(1.0-h);
    }
    static sdf_opFuzzyIntersect( f1,  f2,  k){
        let tmp = 0.5 - 0.5*(f2-f1)/k;
        let h = Math.max(0.0,tmp);
        h = Math.min(1.0,h);
        return SDF_OpWrapper.mix(f2, f1, h) + k*h*(1.0-h);
    }
    static sdf_opFuzzySubtract( f1,  f2,  k) { 
        let tmp = 0.5 - 0.5*(f2+f1)/k;
        let h = Math.max(0.0,tmp);
        h = Math.min(1.0,h);
        return SDF_OpWrapper.mix(f2, -f1, h) + k*h*(1.0-h);
    }
}

export const SDF_DICT = {
    SPHERE: SDF_Wrapper.sdfSphere,
    BOX: SDF_Wrapper.sdfBox,
    INF_CUBES: SDF_Wrapper.sdfInfiniteRoundedCubes
}

export const SDF_ID = {
    SPHERE: "SPHERE",
    BOX: "BOX",
    INF_CUBES: "INF_CUBES"
}