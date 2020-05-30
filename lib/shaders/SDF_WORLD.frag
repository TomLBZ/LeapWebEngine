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
precision mediump float;
uniform mat4 objectToWorldMatrix;
uniform mat4 worldToViewMatrix;
uniform mat4 projectionMatrix;
uniform vec4 diffuseColor;
uniform vec2 screenSize;
uniform float time;
uniform vec3 rbinit;
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
    float n = sin(dot(floor(p), vec3(27, 113, 57)));//vec3(27, 113, 57)
    vec3 rnd = fract(vec3(2097152, 262144, 32768)*n)*.16 - .08;//pseudo rnd
    p = fract(p + rnd) - .5;
    p = abs(p); 
    return max(p.x, max(p.y, p.z)) - 0.2 + dot(p, p)*0.5;
}
float sdf_scene(vec3 p){//sdf for the scene
    vec3 obj_p = (viewToObjectMatrix * vec4(p, 1.)).xyz;
	return min(sdf_tunnel(obj_p), min(sdf_ribbon(obj_p), sdf_infinite_cubes(obj_p)));
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
vec3 getNormal( in vec3 p ){// Tetrahedral normal by IQ.
    vec2 e = vec2(NORMAL_SAMPLING_NUDGE, -NORMAL_SAMPLING_NUDGE); 
    return normalize(
        e.xyy * sdf_scene(p + e.xyy) + 
        e.yyx * sdf_scene(p + e.yyx) + 
        e.yxy * sdf_scene(p + e.yxy) + 
        e.xxx * sdf_scene(p + e.xxx));
}
vec3 pallette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )
{
    return a + b * cos(6.28318 * (c * t + d));
}
vec3 getObjectColor(vec3 p){//use vect position to generate color pallet
    vec3 intp = floor(p);
    float factor = 43758.5453;
    float rnd = fract(sin(dot(intp, vec3(27.17, 112.61, 57.53)))*factor);//pseudo rnd
    vec3 col = (fract(dot(intp, vec3(.5))) > .001)? 
         .5 + .45 * cos(mix(3., 4., rnd) + vec3(.9 , .45, 1.5)) //vec3(.6, .3, 1.)
         : vec3(.7 + .3 * rnd);
    if(fract(rnd * 1183.5437 + .42) > .65) col = col.zyx;
    return col;
}
vec3 colorInfiniteCubes(in vec3 surfacePos, in vec3 rayDirection, in vec3 surfaceNormal, in vec3 lightPos, float t){
    vec3 colpal = pallette(time * 0.05, vec3(0.5,0.5,0.5),vec3(0.5,0.5,0.5),vec3(1.0,1.0,1.0),vec3(0.0,0.10,0.20));
    vec3 lightDirection = lightPos - surfacePos; // Light direction vector.
    float lDist = max(length(lightDirection), .001); // Light to surface distance.
    lightDirection /= lDist; // Normalizing the light vector.
    float atten = 1. / (1. + lDist * .2 + lDist * lDist * .1);// Attenuating the light based on distance.
    float diff = max(dot(surfaceNormal, lightDirection), 0.);// Standard diffuse term.
    float spec = pow(max( dot( reflect(-lightDirection, surfaceNormal), -rayDirection ), 0.), 8.);// Standard specualr term.
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
void mainImage( out vec4 fragColor, in vec2 fragCoord ){
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
void main(){
    vec4 fragColor;
    mainImage(fragColor, gl_FragCoord.xy);
    gl_FragColor = fragColor;
}