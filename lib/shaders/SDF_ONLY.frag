#extension GL_EXT_frag_depth : enable
#define MAX_STEPS                       256
#define REFLECTED_MAX_STEPS             128
#define MIN_DIST                        1e-3
#define REFLECTED_MIN_DIST              2e-3
#define MAX_STEPLEN                     50.
#define STEPLEN_SCALEDOWN_FACTOR        .75
#define SHADOW_MAX_ITERATIONS           24
#define SHADOW_ENLIGHTEN                .25
#define NORMAL_SAMPLING_NUDGE           .0015
#define SCENE_OFFSET_TIME               1.
#define SCENE_FADE_TIME                 1.
#define SCENE_LOAD_TIME                 3. //at least >2 times of SCENE_FADE_TIME
#define MAX_PRIMITIVE_PARAM             5
precision mediump float;
uniform mat4 objectToWorldMatrix;
uniform mat4 worldToViewMatrix;
uniform mat4 projectionMatrix;
uniform vec4 diffuseColor;
uniform vec2 screenSize;
uniform float time;
//----------------general purpose functions------------
float dot2( in vec2 v ) { return dot(v,v); }
float dot2( in vec3 v ) { return dot(v,v); }
float ndot( in vec2 a, in vec2 b ) { return a.x*b.x - a.y*b.y; }
float max3compv4(in vec4 v){return max(max(v.x,v.y), max(v.z,v.w));}
float hash( float n ) { return fract(sin(n)*753.5453123); }
vec4 noise_with_derivatives( in vec3 x ){
    vec3 p = floor(x);
    vec3 w = fract(x);
	vec3 u = w*w*(3.0-2.0*w);
    vec3 du = 6.0*w*(1.0-w);
    float n = p.x + p.y*157.0 + 113.0*p.z;
    float a = hash(n+  0.0);
    float b = hash(n+  1.0);
    float c = hash(n+157.0);
    float d = hash(n+158.0);
    float e = hash(n+113.0);
	float f = hash(n+114.0);
    float g = hash(n+270.0);
    float h = hash(n+271.0);
    float k0 =   a;
    float k1 =   b - a;
    float k2 =   c - a;
    float k3 =   e - a;
    float k4 =   a - b - c + d;
    float k5 =   a - c - e + g;
    float k6 =   a - b - e + f;
    float k7 = - a + b + c - d + e - f - g + h;
    return vec4( k0 + k1*u.x + k2*u.y + k3*u.z + k4*u.x*u.y + k5*u.y*u.z + k6*u.z*u.x + k7*u.x*u.y*u.z, 
                 du * (vec3(k1,k2,k3) + u.yzx*vec3(k4,k5,k6) + u.zxy*vec3(k6,k4,k5) + k7*u.yzx*u.zxy ));
}
vec3 pseudoRnd3(vec3 p){
    float n = sin(dot(floor(p), vec3(27, 113, 57)));//vec3(27, 113, 57)
    return fract(vec3(2097152, 262144, 32768)*n)*.16 - .08;//pseudo rnd
}
float noise(in vec3 x){
    vec3 rnd = pseudoRnd3(x);
    vec3 p = floor(x);
    vec3 f = fract(x);
	f = f*f*(3.0-2.0*f);
	vec2 uv = (p.xy+vec2(37.0,17.0)*p.z) + f.xy;
	vec2 rg = pseudoRnd3(vec3(uv + 0.5, f.z+rnd.z)).yx;
	return mix(rg.x, rg.y, f.z);
}
mat4 mat4Inverse(mat4 m) {
  float
      a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3],
      a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3],
      a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3],
      a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3],
      b00 = a00 * a11 - a01 * a10,
      b01 = a00 * a12 - a02 * a10,
      b02 = a00 * a13 - a03 * a10,
      b03 = a01 * a12 - a02 * a11,
      b04 = a01 * a13 - a03 * a11,
      b05 = a02 * a13 - a03 * a12,
      b06 = a20 * a31 - a21 * a30,
      b07 = a20 * a32 - a22 * a30,
      b08 = a20 * a33 - a23 * a30,
      b09 = a21 * a32 - a22 * a31,
      b10 = a21 * a33 - a23 * a31,
      b11 = a22 * a33 - a23 * a32,
      det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  return mat4(
      a11 * b11 - a12 * b10 + a13 * b09,
      a02 * b10 - a01 * b11 - a03 * b09,
      a31 * b05 - a32 * b04 + a33 * b03,
      a22 * b04 - a21 * b05 - a23 * b03,
      a12 * b08 - a10 * b11 - a13 * b07,
      a00 * b11 - a02 * b08 + a03 * b07,
      a32 * b02 - a30 * b05 - a33 * b01,
      a20 * b05 - a22 * b02 + a23 * b01,
      a10 * b10 - a11 * b08 + a13 * b06,
      a01 * b08 - a00 * b10 - a03 * b06,
      a30 * b04 - a31 * b02 + a33 * b00,
      a21 * b02 - a20 * b04 - a23 * b00,
      a11 * b07 - a10 * b09 - a12 * b06,
      a00 * b09 - a01 * b07 + a02 * b06,
      a31 * b01 - a30 * b03 - a32 * b00,
      a20 * b03 - a21 * b01 + a22 * b00) / det;
}
vec3 screenToVec3(vec2 uniformPos){
    return vec3(uniformPos.x / projectionMatrix[0][0], 
                uniformPos.y / projectionMatrix[1][1], -1.);
}
float distanceToZBufferDepth(float distance) {
    float A = projectionMatrix[2].z;
    float B = projectionMatrix[3].z;
    return 0.5*(-A*distance + B) / distance + 0.5;
}
//----------------------sdf primitives-------------------------
float sdfSphere(float s,vec3 p){return length(p)-s;}
float sdfBox(vec3 p, vec3 b){
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}
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
//--------------------2d sdfs-------------------
//to be added
//--------------------sdf operations-------------
float sdf_opUnion(float f1, float f2){return min(f1, f2);}
float sdf_opIntersect(float f1, float f2){return max(f1, f2);}
float sdf_opSubtract(float f1, float f2){return max(-f1, f2);}
float sdf_opFuzzyUnion(float f1, float f2, float k){
    float h = clamp(0.5 + 0.5*(f2-f1)/k, 0.0, 1.0);
    return mix(f2, f1, h) - k*h*(1.0-h);
}
float sdf_opFuzzyIntersect(float f1, float f2, float k){
    float h = clamp(0.5 - 0.5*(f2-f1)/k, 0.0, 1.0);
    return mix(f2, f1, h) + k*h*(1.0-h);
}
float sdf_opFuzzySubtract(float f1, float f2, float k) { 
    float h = clamp(0.5 - 0.5*(f2+f1)/k, 0.0, 1.0);
    return mix(f2, -f1, h) + k*h*(1.0-h);
}
vec4 sdf_opElongate_(in vec3 p, in vec3 h){
    vec3 q = abs(p)-h;
    return vec4( sign(p) * max(q,0.0), min(max(q.x,max(q.y,q.z)),0.0) );
}
float sdf_opRounding(float d, float rad){return d - rad;}
float sdf_opOnion( in float d, in float thickness ){return abs(d)-thickness;}
float sdf_op2DExtrusion( in vec3 p, in float d, in float h ){
    vec2 w = vec2( d, abs(p.z) - h );
  	return min(max(w.x,w.y),0.0) + length(max(w,0.0));
}
vec2 sdf_op2DRevolution_( in vec3 p, float w ){return vec2( length(p.xz) - w, p.y );}
float sdf_opMetricLength2( vec3 p ) { p=p*p; return sqrt( p.x+p.y+p.z); }
float sdf_opMetricLength6( vec3 p ) { p=p*p*p; p=p*p; return pow(p.x+p.y+p.z,1.0/6.0); }
float sdf_opMetricLength8( vec3 p ) { p=p*p; p=p*p; p=p*p; return pow(p.x+p.y+p.z,1.0/8.0); }
vec3 sdf_opTranslateAndRotate_( in vec3 p, in mat4 t){return (mat4Inverse(t)*vec4(p,1.)).xyz;}
vec3 sdf_opScale_( in vec3 p, in float s_multiply_back_to_dist_after_scaling){return p / s_multiply_back_to_dist_after_scaling;}
vec3 sdf_opSymX_( in vec3 p){
    p.x = abs(p.x);
    return p;
}
vec3 sdf_opSymXZ_( in vec3 p){
    p.xz = abs(p.xz);
    return p;
}
vec3 sdf_opInfiniteRepetition_(in vec3 p, in vec3 c){return mod(p+0.5*c,c)-0.5*c;}
vec3 sdf_opFiniteRepetition_(in vec3 p, in float c, in vec3 l){return p-c*clamp(floor(p/c+.5),-l,l);}
float sdf_opDisplaceSDF(in float prim_d_of_vec3p, in float displ_d){return prim_d_of_vec3p + displ_d;}
vec3 sdf_opTwistSDF_(in vec3 p, float k){
    float c = cos(k*p.y);//k may be 10.0 or anything
    float s = sin(k*p.y);
    mat2  m = mat2(c,-s,s,c);
    return vec3(m*p.xz,p.y);
}
vec3 sdf_opBendSDF_(in vec3 p, float k){
    float c = cos(k*p.x);//k may be 10.0 or anything
    float s = sin(k*p.x);
    mat2  m = mat2(c,-s,s,c);
    return vec3(m*p.xy,p.z);
}
//---------------------complicated sdf scenes------------------------
float sdfTunnel(vec3 p){return cos(p.x)+cos(p.y*1.5)+cos(p.z)+cos(p.y*20.)*.05;}
float sdfRibbon(vec3 p){
	return length(max(abs(p-vec3(cos(p.z*1.5)*.3,-.5+cos(p.z)*.2,.0))-vec3(.125,.02,time+3.),vec3(.0)));
}
float sdfInfiniteRoundedCubes(vec3 p){
    vec3 rnd = pseudoRnd3(p);
    p = fract(p + rnd) - .5;
    p = abs(p); 
    return max(p.x, max(p.y, p.z)) - 0.2 + dot(p, p)*0.5;
}
//--------------------primitive interface-----------------
struct Primitive{//for future parameterization.
    int NumFloatParams;
    int NumVec2Params;
    int NumVec3Params;
    int Type;
};
Primitive Sphere =                  Primitive(1,0,1,0);
Primitive Box =                     Primitive(0,0,2,1);
Primitive RoundBox =                Primitive(1,0,2,2);
Primitive Torus =                   Primitive(0,1,1,3);
Primitive CappedTorus =             Primitive(2,1,1,4);
Primitive Link =                    Primitive(3,0,1,5);
Primitive InfiniteCylinder =        Primitive(0,0,2,6);
Primitive Cone =                    Primitive(2,0,1,7);
Primitive ApproxCone =              Primitive(2,0,1,8);
Primitive InfiniteCone =            Primitive(1,0,1,9);
Primitive Plane =                   Primitive(1,0,2,10);
Primitive HexagonalPrism =          Primitive(0,1,1,11);
Primitive ApproxTriangularPrism =   Primitive(0,1,1,12);
Primitive HorizontalCapsuleLine =   Primitive(1,0,3,13);
Primitive VerticalCapsuleLine =     Primitive(2,0,1,14);
Primitive CappedCylinder =          Primitive(2,0,1,15);
Primitive Capped2PtCylinder =       Primitive(1,0,3,16);
Primitive RoundedCylinder =         Primitive(3,0,1,17);
Primitive CappedCone =              Primitive(3,0,1,18);
Primitive Capped2PtCone =           Primitive(2,0,3,19);
Primitive SolidAngle =              Primitive(2,0,1,20);
Primitive RoundCone =               Primitive(3,0,1,21);
Primitive Round2PtCone =            Primitive(2,0,3,22);
Primitive Ellipsoid =               Primitive(0,0,2,23);
Primitive Rhombus =                 Primitive(4,0,1,24);
Primitive Octahedron =              Primitive(1,0,1,25);
Primitive ApproxOctahedron =        Primitive(1,0,1,26);
Primitive Pyramid =                 Primitive(1,0,1,27);
Primitive Triangle =                Primitive(0,0,4,28);
Primitive Quadrilateral =           Primitive(0,0,5,29);
float primitive(Primitive prim, float[MAX_PRIMITIVE_PARAM] f,
            vec2[MAX_PRIMITIVE_PARAM] v2, vec3[MAX_PRIMITIVE_PARAM] v3){
    if     (prim.Type == 0) {return sdfSphere(f[0],v3[0]);}
    else if(prim.Type == 1) {return sdfBox(v3[0],v3[1]);}
    else if(prim.Type == 2) {return sdfRoundBox(f[0],v3[0],v3[1]);}
    else if(prim.Type == 3) {return sdfTorus(v2[0],v3[0]);}
    else if(prim.Type == 4) {return sdfCappedTorus(f[0],f[1],v2[0],v3[0]);}
    else if(prim.Type == 5) {return sdfLink(f[0],f[1],f[2],v3[0]);}
    else if(prim.Type == 6) {return sdfInfiniteCylinder(v3[0],v3[0]);}
    else if(prim.Type == 7) {return sdfCone(f[0],f[1],v3[0]);}
    else if(prim.Type == 8) {return sdfApproxCone(f[0],f[1],v3[0]);}
    else if(prim.Type == 9) {return sdfInfiniteCone(f[0],v3[0]);}
    else if(prim.Type == 10){return sdfPlane(f[0],v3[0],v3[1]);}
    else if(prim.Type == 11){return sdfHexagonalPrism(v2[0],v3[0]);}
    else if(prim.Type == 12){return sdfApproxTriangularPrism(v2[0],v3[0]);}
    else if(prim.Type == 13){return sdfHorizontalCapsuleLine(f[0],v3[0],v3[1],v3[2]);}
    else if(prim.Type == 14){return sdfVerticalCapsuleLine(f[0],f[1],v3[0]);}
    else if(prim.Type == 15){return sdfCappedCylinder(f[0],f[1],v3[0]);}
    else if(prim.Type == 16){return sdfCapped2PtCylinder(f[0],v3[0],v3[1],v3[2]);}
    else if(prim.Type == 17){return sdfRoundedCylinder(f[0],f[1],f[2],v3[0]);}
    else if(prim.Type == 18){return sdfCappedCone(f[0],f[1],f[2],v3[0]);}
    else if(prim.Type == 19){return sdfCapped2PtCone(f[0],f[1],v3[0],v3[1],v3[2]);}
    else if(prim.Type == 20){return sdfSolidAngle(f[0],f[1],v3[0]);}
    else if(prim.Type == 21){return sdfRoundCone(f[0],f[1],f[2],v3[0]);}
    else if(prim.Type == 22){return sdfRound2PtCone(f[0],f[1],v3[0],v3[1],v3[2]);}
    else if(prim.Type == 23){return sdfEllipsoid(v3[0],v3[1]);}
    else if(prim.Type == 24){return sdfRhombus(f[0],f[1],f[2],f[3],v3[0]);}
    else if(prim.Type == 25){return sdfOctahedron(f[0],v3[0]);}
    else if(prim.Type == 26){return sdfApproxOctahedron(f[0],v3[0]);}
    else if(prim.Type == 27){return sdfPyramid(f[0],v3[0]);}
    else if(prim.Type == 28){return udfTriangle(v3[0],v3[1],v3[2],v3[3]);}
    else if(prim.Type == 29){return udfQuadrilateral(v3[0],v3[1],v3[2],v3[3],v3[4]);}
}
//--------------------experimenting voxels---------------
vec4 getVoxelColor(in vec3 p, in vec3 n){
    vec3 rp = pseudoRnd3(p);
    vec3 rn = pseudoRnd3(n);
	return vec4(rp.x*rn.y, rp.y*rn.z, rp.z*rn.x, rp.z*rn.z);
}
float mapTerrain(vec3 p){
	p *= 0.1; 
	p.xz *= 0.6;
	float itime = 0.5 + 0.15*time;
	float ft = fract(itime);
	float it = floor(itime);
	ft = smoothstep(0.7, 1.0, ft);
	itime = it + ft;
	float spe = 1.4;
	float f;
    f  = 0.5000*noise(p*1.00 + vec3(0.0,1.0,0.0)*spe*itime);
    f += 0.2500*noise(p*2.02 + vec3(0.0,2.0,0.0)*spe*itime);
    f += 0.1250*noise(p*4.01);
	return 25.0*f-10.0;
}
vec3 gro = vec3(0.0);
float sdf_voxelmap(in vec3 c){
	vec3 p = c + 0.5;
	float f = mapTerrain(p) + 0.25*p.y;
    f = mix(f, 1.0, step(length(gro-p), 5.0));
	return step(f, 0.5);
}
vec3 lig = normalize(vec3(-0.4,0.3,0.7));
float castRay(in vec3 ro, in vec3 rd, out vec3 oVos, out vec3 oDir){
	vec3 pos = floor(ro);
	vec3 ri = 1.0/rd;
	vec3 rs = sign(rd);
	vec3 dis = (pos-ro + 0.5 + rs*0.5) * ri;
	float res = -1.0;
	vec3 mm = vec3(0.0);
	for(int i=0; i<MAX_STEPS; i++) 
	{
		if(sdf_voxelmap(pos)>0.5) { res=1.0; break; }
		mm = step(dis.xyz, dis.yzx) * step(dis.xyz, dis.zxy);
		dis += mm * rs * ri;
        pos += mm * rs;
	}
	vec3 nor = -mm*rs;
	vec3 vos = pos;
    // intersect the cube	
	vec3 mini = (pos-ro + 0.5 - 0.5*vec3(rs))*ri;
	float t = max (mini.x, max (mini.y, mini.z));
	oDir = mm;
	oVos = vos;
	return t*res;
}
vec3 path(float t, float ya){
    vec2 p  = 100.0*sin(0.02*t*vec2(1.0,1.2) + vec2(0.1,0.9));
	     p +=  50.0*sin(0.04*t*vec2(1.3,1.0) + vec2(1.0,4.5));
	return vec3(p.x, 18.0 + ya*4.0*sin(0.05*t), p.y);
}
mat3 setCamera(in vec3 ro, in vec3 ta, float cr){
	vec3 cw = normalize(ta-ro);
	vec3 cp = vec3(sin(cr), cos(cr),0.0);
	vec3 cu = normalize(cross(cw,cp));
	vec3 cv = normalize(cross(cu,cw));
    return mat3(cu, cv, -cw);
}
float isEdge(in vec2 uv, vec4 va, vec4 vb, vec4 vc, vec4 vd){
    vec2 st = 1.0 - uv;
    // edges
    vec4 wb = smoothstep(0.85, 0.99, vec4(uv.x,
                                           st.x,
                                           uv.y,
                                           st.y)) * (1.0 - va + va*vc);
    // corners
    vec4 wc = smoothstep(0.85, 0.99, vec4(uv.x*uv.y,
                                           st.x*uv.y,
                                           st.x*st.y,
                                           uv.x*st.y)) * (1.0 - vb + vd*vb);
    return max3compv4(max(wb,wc));
}
float calcOcc(in vec2 uv, vec4 va, vec4 vb, vec4 vc, vec4 vd){
    vec2 st = 1.0 - uv;
    // edges
    vec4 wa = vec4(uv.x, st.x, uv.y, st.y) * vc;
    // corners
    vec4 wb = vec4(uv.x*uv.y,
                   st.x*uv.y,
                   st.x*st.y,
                   uv.x*st.y)*vd*(1.0-vc.xzyw)*(1.0-vc.zywx);
    return wa.x + wa.y + wa.z + wa.w +
           wb.x + wb.y + wb.z + wb.w;
}
vec3 renderVoxels(in vec3 ro, in vec3 rd){
    vec3 col = vec3(0.0);
    // raymarch	
	vec3 vos, dir;
	float t = castRay(ro, rd, vos, dir);
	if(t>0.0)
	{
        vec3 nor = -dir*sign(rd);
        vec3 pos = ro + rd*t;
        vec3 uvw = pos - vos;
		vec3 v1  = vos + nor + dir.yzx;
	    vec3 v2  = vos + nor - dir.yzx;
	    vec3 v3  = vos + nor + dir.zxy;
	    vec3 v4  = vos + nor - dir.zxy;
		vec3 v5  = vos + nor + dir.yzx + dir.zxy;
        vec3 v6  = vos + nor - dir.yzx + dir.zxy;
	    vec3 v7  = vos + nor - dir.yzx - dir.zxy;
	    vec3 v8  = vos + nor + dir.yzx - dir.zxy;
	    vec3 v9  = vos + dir.yzx;
	    vec3 v10 = vos - dir.yzx;
	    vec3 v11 = vos + dir.zxy;
	    vec3 v12 = vos - dir.zxy;
 	    vec3 v13 = vos + dir.yzx + dir.zxy; 
	    vec3 v14 = vos - dir.yzx + dir.zxy ;
	    vec3 v15 = vos - dir.yzx - dir.zxy;
	    vec3 v16 = vos + dir.yzx - dir.zxy;
		vec4 vc = vec4(sdf_voxelmap(v1),  sdf_voxelmap(v2),  sdf_voxelmap(v3),  sdf_voxelmap(v4));
	    vec4 vd = vec4(sdf_voxelmap(v5),  sdf_voxelmap(v6),  sdf_voxelmap(v7),  sdf_voxelmap(v8));
	    vec4 va = vec4(sdf_voxelmap(v9),  sdf_voxelmap(v10), sdf_voxelmap(v11), sdf_voxelmap(v12));
	    vec4 vb = vec4(sdf_voxelmap(v13), sdf_voxelmap(v14), sdf_voxelmap(v15), sdf_voxelmap(v16));
		vec2 uv = vec2(dot(dir.yzx, uvw), dot(dir.zxy, uvw));
        // wireframe
        float www = 1.0 - isEdge(uv, va, vb, vc, vd);
        vec3 wir = smoothstep(0.4, 0.5, abs(uvw-0.5));
        float vvv = (1.0-wir.x*wir.y)*(1.0-wir.x*wir.z)*(1.0-wir.y*wir.z);
        col = 2.0*pseudoRnd3(pos); 
        col += 0.8*vec3(0.1,0.3,0.4);
        col *= 0.5 + 0.5*getVoxelColor(0.5*pos, nor).x;
        col *= 1.0 - 0.75*(1.0-vvv)*www;
        // lighting
        float dif = clamp(dot(nor, lig), 0.0, 1.0);
        float bac = clamp(dot(nor, normalize(lig*vec3(-1.0,0.0,-1.0))), 0.0, 1.0);
        float sky = 0.5 + 0.5*nor.y;
        float amb = clamp(0.75 + pos.y/25.0,0.0,1.0);
        float occ = 1.0;
        // ambient occlusion
        occ = calcOcc(uv, va, vb, vc, vd);
        occ = 1.0 - occ/8.0;
        occ = occ*occ;
        occ = occ*occ;
        occ *= amb;
        // lighting
        vec3 lin = vec3(0.0);
        lin += 2.5*dif*vec3(1.00,0.90,0.70)*(0.5+0.5*occ);
        lin += 0.5*bac*vec3(0.15,0.10,0.10)*occ;
        lin += 2.0*sky*vec3(0.40,0.30,0.15)*occ;
        // line glow	
        float lineglow = 0.0;
        lineglow += smoothstep(0.4, 1.0,     uv.x)*(1.0-va.x*(1.0-vc.x));
        lineglow += smoothstep(0.4, 1.0, 1.0-uv.x)*(1.0-va.y*(1.0-vc.y));
        lineglow += smoothstep(0.4, 1.0,     uv.y)*(1.0-va.z*(1.0-vc.z));
        lineglow += smoothstep(0.4, 1.0, 1.0-uv.y)*(1.0-va.w*(1.0-vc.w));
        lineglow += smoothstep(0.4, 1.0,      uv.y*      uv.x)*(1.0-vb.x*(1.0-vd.x));
        lineglow += smoothstep(0.4, 1.0,      uv.y* (1.0-uv.x))*(1.0-vb.y*(1.0-vd.y));
        lineglow += smoothstep(0.4, 1.0, (1.0-uv.y)*(1.0-uv.x))*(1.0-vb.z*(1.0-vd.z));
        lineglow += smoothstep(0.4, 1.0, (1.0-uv.y)*     uv.x)*(1.0-vb.w*(1.0-vd.w));
        vec3 linCol = 2.0*vec3(5.0,0.6,0.0);
        linCol *= (0.5+0.5*occ)*0.5;
        lin += 3.0*lineglow*linCol;
        col = col*lin;
        col += 8.0*linCol*vec3(1.0,2.0,3.0)*(1.0-www);//*(0.5+1.0*sha);
        col += 0.1*lineglow*linCol;
        col *= min(0.1,exp(-0.07*t));
        // blend to black & white		
        vec3 col2 = vec3(1.3)*(0.5+0.5*nor.y)*occ*www*(0.9+0.1*vvv)*exp(-0.04*t);;
        float mi = sin(-1.57+0.5*time);
        mi = smoothstep(0.70, 0.75, mi);
        col = mix(col, col2, mi);
	}
	// gamma	
	col = pow(col, vec3(0.45));
    return col;
}
void mainVoxelImage(out vec4 fragColor, in vec2 fragCoord){
    // inputs	
	vec2 q = fragCoord.xy / screenSize;
    vec2 p = -1.0 + 2.0*q;
    p.x *= screenSize.x/ screenSize.y;	
    vec2 mo =vec2(0.0);
	float itime = 2.0*time + 50.0*mo.x;
    // camera
	float cr = 0.2*cos(0.1*time);
	vec3 ro = path(itime+0.0, 1.0);
	vec3 ta = path(itime+5.0, 1.0) - vec3(0.0,6.0,0.0);
	gro = ro;
    mat3 cam = setCamera(ro, ta, cr);
	// build ray
    float r2 = p.x*p.x*0.32 + p.y*p.y;
    p *= (7.0-sqrt(37.5-11.5*r2))/(r2+1.0);
    vec3 rd = normalize(cam * vec3(p.xy,-2.5));
    vec3 col = renderVoxels(ro, rd);
	// vignetting	
	col *= 0.5 + 0.5*pow(16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y), 0.1);
	fragColor = vec4(col, 1.0);
}
//---------------------working code
mat4 viewToObjectMatrix;
float sdf_scene(vec3 p){//sdf for the scene
    vec3 obj_p = (viewToObjectMatrix * vec4(p, 1.)).xyz;
    float fuzziness = 0.5;
    float rtn = sdf_opFuzzyUnion(sdfTunnel(obj_p), sdfInfiniteRoundedCubes(obj_p),fuzziness);
	return sdf_opUnion(rtn, sdfRibbon(obj_p));
}
float trace(vec3 origin, vec3 direction){
    float steplen = 0., dist;
    for (int i = 0; i < MAX_STEPS; i++){
        dist = sdf_scene(origin + direction * steplen);
        if(abs(dist) < MIN_DIST || steplen > MAX_STEPLEN) break;        
        steplen += dist * STEPLEN_SCALEDOWN_FACTOR;
    }
    return steplen;
}
float traceReflection(vec3 origin, vec3 direction){
    float steplen = 0., dist;
    for (int i = 0; i < REFLECTED_MAX_STEPS; i++){
        dist = sdf_scene(origin + direction * steplen);
        if(abs(dist) < REFLECTED_MIN_DIST || steplen > MAX_STEPLEN) break;
        steplen += dist;
    }
    return steplen;
}
float softShadow(vec3 origin, vec3 pos, float hardness){
    vec3 direction = pos - origin;
    float shade = 1.;
    float mindist = REFLECTED_MIN_DIST;//0.002
    float end = max(length(direction), MIN_DIST);
    float stepDist = end / float(SHADOW_MAX_ITERATIONS);//const step
    direction /= end;
    for (int i = 0; i < SHADOW_MAX_ITERATIONS; i++){
        float dist = sdf_scene(origin + direction * mindist);
        shade = min(shade, smoothstep(0., 1., hardness * dist / mindist));
        mindist += clamp(dist, .02, .25);
        if (dist < 0. || mindist > end) break; 
    }
    return min(max(shade, 0.) + SHADOW_ENLIGHTEN, 1.); 
}
vec3 getNormal(in vec3 p){// Tetrahedral normal by IQ.
    vec2 e = vec2(NORMAL_SAMPLING_NUDGE, -NORMAL_SAMPLING_NUDGE); 
    return normalize(
        e.xyy * sdf_scene(p + e.xyy) + 
        e.yyx * sdf_scene(p + e.yyx) + 
        e.yxy * sdf_scene(p + e.yxy) + 
        e.xxx * sdf_scene(p + e.xxx));
}
vec3 pallette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d)
{
    return a + b * cos(6.28318 * (c * t + d));
}
vec3 colorInfiniteCubes(in vec3 surfacePos, in vec3 rayDirection, in vec3 surfaceNormal, in vec3 lightPos, float t){
    vec3 colpal = pallette(time * 0.05, vec3(0.5,0.5,0.5),vec3(0.5,0.5,0.5),vec3(1.0,1.0,1.0),vec3(0.0,0.10,0.20));
    vec3 lightDirection = lightPos - surfacePos; // Light direction vector.
    float lDist = max(length(lightDirection), .001); // Light to surface distance.
    lightDirection /= lDist; // Normalizing the light vector.
    float atten = 1. / (1. + lDist * .2 + lDist * lDist * .1);// Attenuating the light based on distance.
    float diff = max(dot(surfaceNormal, lightDirection), 0.);// Standard diffuse term.
    float spec = pow(max(dot(reflect(-lightDirection, surfaceNormal), -rayDirection), 0.), 8.);// Standard specualr term.
    vec3 sceneCol = (colpal*(diff + .15) + vec3(1., .6, .2)*spec*2.) * atten;// Combining the above terms
    float fogF = smoothstep(0., .95, t / MAX_STEPLEN);// Fog factor based on the distance from the camera.
    sceneCol = mix(sceneCol, vec3(0), fogF); // Applying the background fog.Just black
    return sceneCol;
}
vec3 colorTunnel(in vec3 surfacePos, in vec3 surfaceNormal, in vec3 lightOrigin){
    float f = length(surfacePos - lightOrigin) * 0.02;
    vec3 tc = (max(dot(surfaceNormal,vec3(.1,.1,.0)), .0) + 
        vec4(.3, cos(time*.5)*.5+.5, sin(time*.5)*.5+.5, 1.)*min(length(surfacePos-lightOrigin)*.04, 1.)).xyz;
    return ((tc+vec3(f))+(1.-min(surfacePos.y+1.9,1.))*vec3(1.,.8,.7))*min(time*.5,1.);
}
vec3 colorRibbon(){
    return vec4(cos(time*.3)*.5+.5,cos(time*.2)*.5+.5,sin(time*.3)*.5+.5,1.).xyz;
}
vec3 colorScene(in vec3 surfacePos, in vec3 rayDirection, in vec3 surfaceNormal, in vec3 lightPos, in vec3 lightOrigin, float t){
    vec3 cubes = colorInfiniteCubes(surfacePos, rayDirection, surfaceNormal, lightPos, t);
    vec3 tunnel = colorTunnel(surfacePos, surfaceNormal, lightOrigin);
    vec3 ribbon = colorRibbon();
    vec3 obj_lo = (viewToObjectMatrix * vec4(lightOrigin, 1.)).xyz;
    float dc = sdfInfiniteRoundedCubes(obj_lo);
    float dt = sdfTunnel(obj_lo);
    float dr = sdfRibbon(obj_lo);
    float nearest = min(dr, min(dc, dt));
    float fogF = smoothstep(0., .95, t / MAX_STEPLEN);// Fog factor based on the distance from the camera.
    if(nearest == dt) return mix(tunnel, vec3(0), fogF);
    else if (nearest == dr) return mix(ribbon, vec3(0), fogF);
    else return mix(cubes, vec3(0), fogF);
}
void mainImage(out vec4 fragColor, in vec2 fragCoord){
    viewToObjectMatrix = mat4Inverse(objectToWorldMatrix) * mat4Inverse(worldToViewMatrix);
    vec2 unitScreenPos = (fragCoord / screenSize - vec2(0.5, 0.5)) * 2.;
    vec3 raydir=normalize(screenToVec3(unitScreenPos));
    vec3 camO = vec3(0., 0., 0.);// Ray origin.
    vec3 lightPos = camO + vec3(0., 1., -.5);// Light position.
    float steplen = trace(camO, raydir);// FIRST PASS.
    gl_FragDepthEXT = distanceToZBufferDepth(steplen);//move to depth buffer
    camO += raydir * steplen;// Advancing camO to the new hit point.
    vec3 surfaceNormal = getNormal(camO);// normal at the hit point.
    vec3 sceneColor = colorScene(camO, raydir, surfaceNormal, lightPos, camO, steplen);// color at the hit point
    float shadow = softShadow(camO + surfaceNormal * .0015, lightPos, 16.);// Checking if the surface is in shadow
    raydir = reflect(raydir, surfaceNormal);// SECOND PASS - REFLECTED RAY
    steplen = traceReflection(camO + surfaceNormal * .003, raydir);//nudge the ray off of the surface
    camO += raydir * steplen;// Advancing camO to the reflected hit point.
    surfaceNormal = getNormal(camO);// normal at the reflected hit point.
    sceneColor += colorScene(camO, raydir, surfaceNormal, lightPos, camO, steplen) * .35;// Coloring the reflected hit point
    sceneColor *= shadow;// Multiply the shadow from the first pass by the final scene color.
	fragColor = vec4(sqrt(clamp(sceneColor, 0., 1.)), 1);// Clamping the scene color
}
void LoadProcedure(out vec4 fragColor, in vec2 fragCoord, float toffset, float tload, float tfade){
    vec4 fc;    // |--offset-->|--load(fade--persist--fade)-->|--main(fade--mainImage)
    vec4 outputc = vec4(0.2, 0.9, 0.5,1.);
    if (time < toffset + tload){
        if(time > toffset){
            mainVoxelImage(fc, fragCoord);
            if(time < toffset + tfade){
                outputc += (time - toffset) / tfade * (fc - outputc);
            }
            else if(time > toffset + tload - tfade){
                outputc = fc + (time-toffset - tload + tfade) / tfade*(outputc - fc);
            }
            else outputc = fc;
        }
    }else{
        mainImage(fc, fragCoord);
        if(time < toffset + tload + tfade){
            outputc += (time - toffset - tload) / tfade * (fc - outputc);
        }
        else outputc = fc;
    }
    fragColor = outputc;
}
void main(){
    LoadProcedure(gl_FragColor, gl_FragCoord.xy, SCENE_OFFSET_TIME, SCENE_LOAD_TIME, SCENE_FADE_TIME);
}