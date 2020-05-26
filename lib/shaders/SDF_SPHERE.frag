#extension GL_EXT_frag_depth : enable
//Using FragDepth in WebGL: https://stackoverflow.com/questions/24499321/using-gl-fragdepth-in-webgl
//GLSL builtin variables: https://www.khronos.org/opengl/wiki/Built-in_Variable_(GLSL)#Fragment_shader_inputs
//GLSL builtin functions: https://blog.csdn.net/hgl868/article/details/7876257

//Distance = NearClipPlane + DepthBufferValue * (FarClipPlane - NearClipPlane)

precision mediump float;
uniform mat4 objectToWorldMatrix;
uniform mat4 worldToViewMatrix;
uniform mat4 projectionMatrix;
uniform vec4 diffuseColor;
uniform vec2 screenSize;
uniform float radius;
const float MAX_STEPS = 100.;
const float MIN_DIST = 1e-5;

vec3 screenToVec3(vec2 uniformPos){
    return vec3(uniformPos.x/projectionMatrix[0][0],
    uniformPos.y/projectionMatrix[1][1],-1.);
}
float sphereSDF(vec3 p,vec3 sph,float r){
    return length(p-sph)-r;
}
float distanceToZBufferDepth(float distance) {
    float A = projectionMatrix[2].z;
    float B = projectionMatrix[3].z;
    return 0.5*(-A*distance + B) / distance + 0.5;
}
void main(){
    vec2 uniformPos = (gl_FragCoord.xy/screenSize-vec2(0.5,0.5))*2.;
    vec4 sphereCenter=worldToViewMatrix*objectToWorldMatrix*vec4(0,0,0,1);
    vec3 dir=normalize(screenToVec3(uniformPos));
    vec3 currentPos=vec3(0,0,0);
    float dis=MIN_DIST;
    float steps = 0.;
    float weight = 0.;
    float lastdis = MIN_DIST;
    for(float i=0.; i<MAX_STEPS; i++) {
        lastdis = dis;
        dis=sphereSDF(currentPos,sphereCenter.xyz,radius);
        if(abs(dis)<MIN_DIST) break;
        currentPos=currentPos+dir*1.*dis;
        steps++;
    }
    if (abs(dis) < MIN_DIST){
        gl_FragDepthEXT = distanceToZBufferDepth(-currentPos.z);
        //if(sin(2.*length(currentPos)) > 0.) {
        //    gl_FragColor=vec4(1,1,1,1)*diffuseColor;
        //}else{
        //    gl_FragColor=vec4(0.7,0.7,0.7,1)*diffuseColor;
        //}
        weight = sin(1.-abs(dis/lastdis));
        gl_FragColor = vec4(weight,weight,weight,1)*diffuseColor;
    } else {
        gl_FragDepthEXT = 1.0;
    }
    
}