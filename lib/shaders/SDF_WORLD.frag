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
uniform vec2 screenSize;
uniform float time;
uniform vec3 rbinit;

float sdfmap(vec3 p){//sdf for the rounded box
    p = (worldToViewMatrix * objectToWorldMatrix * vec4(p[0], p[1], p[2], -1)).xyz;
    float n = sin(dot(floor(p), vec3(27, 113, 57)));//vec3(27, 113, 57)
    vec3 rnd = fract(vec3(2097152, 262144, 32768)*n)*.16 - .08;//pseudo rnd
    p = fract(p + rnd) - .5;
    p = abs(p); 
    return max(p.x, max(p.y, p.z)) - 0.25 + dot(p, p)*0.5;
}
float trace(vec3 origin, vec3 direction){
    float steplen = 0., dist;
    for (int i = 0; i < MAX_STEPS; i++){
        dist = sdfmap(origin + direction * steplen);
        if(abs(dist) < MIN_DIST || steplen > MAX_STEPLEN) break;        
        steplen += dist * STEPLEN_SCALEDOWN_FACTOR;
    }
    return steplen;
}
float traceReflection(vec3 origin, vec3 direction){
    float steplen = 0., dist;
    for (int i = 0; i < REFLECTED_MAX_STEPS; i++){
        dist = sdfmap(origin + direction * steplen);
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
        float dist = sdfmap(origin + direction * mindist);
        shade = min(shade, smoothstep(0., 1., hardness * dist / mindist));
        mindist += clamp(dist, .02, .25);
        if (dist < 0. || mindist > end) break; 
    }
    return min(max(shade, 0.) + SHADOW_ENLIGHTEN, 1.); 
}
vec3 getNormal( in vec3 p ){// Tetrahedral normal by IQ.
    vec2 e = vec2(NORMAL_SAMPLING_NUDGE, -NORMAL_SAMPLING_NUDGE); 
    return normalize(
        e.xyy * sdfmap(p + e.xyy) + 
        e.yyx * sdfmap(p + e.yyx) + 
        e.yxy * sdfmap(p + e.yxy) + 
        e.xxx * sdfmap(p + e.xxx));
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
vec3 doColor(in vec3 surfacePos, in vec3 rayDirection, in vec3 surfaceNormal, in vec3 lightPos, float t){
    vec3 lightDirection = lightPos - surfacePos; // Light direction vector.
    float lDist = max(length(lightDirection), .001); // Light to surface distance.
    lightDirection /= lDist; // Normalizing the light vector.
    float atten = 1. / (1. + lDist * .2 + lDist * lDist * .1);// Attenuating the light based on distance.
    float diff = max(dot(surfaceNormal, lightDirection), 0.);// Standard diffuse term.
    float spec = pow(max( dot( reflect(-lightDirection, surfaceNormal), -rayDirection ), 0.), 8.);// Standard specualr term.
    vec3 objCol = getObjectColor(surfacePos);
    vec3 sceneCol = (objCol*(diff + .15) + vec3(1., .6, .2)*spec*2.) * atten;// Combining the above terms
    float fogF = smoothstep(0., .95, t / MAX_STEPLEN);// Fog factor based on the distance from the camera.
    sceneCol = mix(sceneCol, vec3(0), fogF); // Applying the background fog.Just black
    return sceneCol;
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
    vec2 unitScreenPos = (gl_FragCoord.xy / screenSize - vec2(0.5, 0.5)) * 2.;
    vec4 sdfCenter = worldToViewMatrix * objectToWorldMatrix * vec4(0, 0, 0, -1);
    vec3 raydir=normalize(screenToVec3(unitScreenPos));
    vec3 camO = vec3(0., 0., 0.);// Ray origin.
    vec3 lightPos = camO + vec3(0., 1., -.5);// Light position.
    float steplen = trace(camO, raydir);// FIRST PASS.
    gl_FragDepthEXT = distanceToZBufferDepth(steplen);//move to depth buffer
    camO += raydir * steplen;// Advancing camO to the new hit point.
    vec3 surfaceNormal = getNormal(camO);// normal at the hit point.
    vec3 sceneColor = doColor(camO, raydir, surfaceNormal, lightPos, steplen);// color at the hit point
    float shadow = softShadow(camO + surfaceNormal * .0015, lightPos, 16.);// Checking if the surface is in shadow
    raydir = reflect(raydir, surfaceNormal);// SECOND PASS - REFLECTED RAY
    steplen = traceReflection(camO + surfaceNormal * .003, raydir);//nudge the ray off of the surface
    camO += raydir * steplen;// Advancing camO to the reflected hit point.
    surfaceNormal = getNormal(camO);// normal at the reflected hit point.
    sceneColor += doColor(camO, raydir, surfaceNormal, lightPos, steplen) * .35;// Coloring the reflected hit point
    sceneColor *= shadow;// Multiply the shadow from the first pass by the final scene color.
	fragColor = vec4(sqrt(clamp(sceneColor, 0., 1.)), 1);// Clamping the scene color
}
void main(){
    vec4 fragColor;
    mainImage(fragColor, gl_FragCoord.xy);
    gl_FragColor = fragColor;
}