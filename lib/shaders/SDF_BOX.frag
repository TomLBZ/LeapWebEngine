#extension GL_EXT_frag_depth : enable
precision mediump float;
uniform mat4 objectToWorldMatrix;
uniform mat4 worldToViewMatrix;
uniform mat4 projectionMatrix;
uniform vec4 diffuseColor;
uniform vec2 screenSize;
uniform vec3 size;
const float MAX_STEPS = 100.;
const float MIN_DIST = 1e-5;

vec3 screenToVec3(vec2 uniformPos){
    return vec3(uniformPos.x/projectionMatrix[0][0],
    uniformPos.y/projectionMatrix[1][1],-1.);
}
float boxSDF(vec3 p,vec3 box,vec3 size){
    vec3 q = abs(p - box) - size;
    return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}
float distanceToZBufferDepth(float distance) {
    float A = projectionMatrix[2].z;
    float B = projectionMatrix[3].z;
    return 0.5*(-A*distance + B) / distance + 0.5;
}
void main() {
    vec2 uniformPos = (gl_FragCoord.xy/screenSize-vec2(0.5,0.5))*2.;
    vec4 boxCenter=worldToViewMatrix*objectToWorldMatrix*vec4(0,0,0,1);
    vec3 dir=normalize(screenToVec3(uniformPos));
    vec3 currentPos=vec3(0,0,0);
    float dis=MIN_DIST;
    float steps = 0.;
    float weight = 0.;
    float lastdis = MIN_DIST;
    for(float i=0.; i<MAX_STEPS; i++) {
        lastdis = dis;
        dis=boxSDF(currentPos,boxCenter.xyz,size);
        if(abs(dis)<MIN_DIST) break;
        currentPos=currentPos+dir*1.*dis;
        steps++;
    }
    if (abs(dis) < MIN_DIST){
        gl_FragDepthEXT = distanceToZBufferDepth(-currentPos.z);
        weight = sin(1.-abs(dis/lastdis));
        gl_FragColor = vec4(weight,weight,weight,1)*diffuseColor;
    } else {
        gl_FragDepthEXT = 1.0;
    }
}