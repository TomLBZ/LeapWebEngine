#extension GL_EXT_frag_depth : enable
#define MAX_STEPS                           96
#define REFLECTED_MAX_STEPS                 48
#define MIN_DIST                            1e-3
#define REFLECTED_MIN_DIST                  2e-3
#define MAX_STEPLEN                         30.
#define STEPLEN_SCALEDOWN_FACTOR            .75
#define SHADOW_MAX_ITERATIONS               24
#define SHADOW_ENLIGHTEN                    .25
#define NORMAL_SAMPLING_NUDGE               .0015
#define SCENE_TRANSITION_TIME               1.
#define SCENE_WELCOME_TIME                  3.
precision mediump float;
uniform mat4 objectToWorldMatrix;
uniform mat4 worldToViewMatrix;
uniform mat4 projectionMatrix;
uniform vec4 diffuseColor;
uniform vec2 screenSize;
uniform float time;
uniform vec3 rbinit;
//--------------------experimenting voxels
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
vec4 texcube(in vec3 p, in vec3 n){
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
    f  = 0.5000*noise(p*1.00 + vec3(0.0,1.0,0.0)*spe*time);
    f += 0.2500*noise(p*2.02 + vec3(0.0,2.0,0.0)*spe*time);
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
	for(int i=0; i<128; i++) 
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
float max3compv4(in vec4 v){
    return max(max(v.x,v.y), max(v.z,v.w));
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
        col *= 0.5 + 0.5*texcube(0.5*pos, nor).x;
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
mat4 inverse(mat4 m) {
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
mat4 viewToObjectMatrix;
float sdf_tunnel(vec3 p)
{
	return cos(p.x)+cos(p.y*1.5)+cos(p.z)+cos(p.y*20.)*.05;
}
float sdf_ribbon(vec3 p)
{
	return length(max(abs(p-vec3(cos(p.z*1.5)*.3,-.5+cos(p.z)*.2,.0))-vec3(.125,.02,time+3.),vec3(.0)));
}
float sdf_infinite_cubes(vec3 p){//sdf for the rounded box
    vec3 rnd = pseudoRnd3(p);
    p = fract(p + rnd) - .5;
    p = abs(p); 
    return max(p.x, max(p.y, p.z)) - 0.2 + dot(p, p)*0.5;
}
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
float sdf_scene(vec3 p){//sdf for the scene
    vec3 obj_p = (viewToObjectMatrix * vec4(p, 1.)).xyz;
    float fuzziness = 0.5;
    float rtn = sdf_opFuzzyUnion(sdf_tunnel(obj_p), sdf_infinite_cubes(obj_p),fuzziness);
	return sdf_opUnion(rtn, sdf_ribbon(obj_p));
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
    float dc = sdf_infinite_cubes(obj_lo);
    float dt = sdf_tunnel(obj_lo);
    float dr = sdf_ribbon(obj_lo);
    float nearest = min(dr, min(dc, dt));
    float fogF = smoothstep(0., .95, t / MAX_STEPLEN);// Fog factor based on the distance from the camera.
    if(nearest == dt) return mix(tunnel, vec3(0), fogF);
    else if (nearest == dr) return mix(ribbon, vec3(0), fogF);
    else return mix(cubes, vec3(0), fogF);
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
void mainImage(out vec4 fragColor, in vec2 fragCoord){
    viewToObjectMatrix = inverse(objectToWorldMatrix) * inverse(worldToViewMatrix);
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
void LoadProcedure(out vec4 fragColor, in vec2 fragCoord, vec3 rbfade, float tcrit, float tfade){
    vec4 fc;
    vec4 outputc = vec4((rbfade+.5)/256.,1.);
    if (time < tcrit){
        mainVoxelImage(fc, fragCoord);
        if(time < tfade){outputc += time/tfade*(fc - outputc);}
        else if(time > tcrit - tfade){outputc=fc+(time+tfade-tcrit)/tfade*(outputc-fc);}
        else outputc = fc;
    }else{
        mainImage(fc, fragCoord);
        if(time < tcrit + tfade){outputc += (time-tcrit)/tfade*(fc - outputc);}
        else outputc = fc;
    }
    fragColor = outputc;
}
void main(){
    LoadProcedure(gl_FragColor, gl_FragCoord.xy, rbinit, SCENE_WELCOME_TIME, SCENE_TRANSITION_TIME);
}