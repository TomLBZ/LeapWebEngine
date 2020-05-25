#extension GL_EXT_frag_depth : enable
//Using FragDepth in WebGL: https://stackoverflow.com/questions/24499321/using-gl-fragdepth-in-webgl
//GLSL builtin variables: https://www.khronos.org/opengl/wiki/Built-in_Variable_(GLSL)#Fragment_shader_inputs
//GLSL builtin functions: https://blog.csdn.net/hgl868/article/details/7876257
precision mediump float;
uniform mat4 objectToWorldMatrix;
uniform mat4 worldToViewMatrix;
uniform mat4 projectionMatrix;
uniform vec4 diffuseColor;
uniform vec2 screenSize;

vec3 screenToVec3(vec2 uniformPos){
    return vec3(uniformPos.x/projectionMatrix[0][0],
    uniformPos.y/projectionMatrix[1][1],-1.);
}
float sphereSDF(vec3 p,vec3 sph,float radius){
    return length(p-sph)-radius;
}
void main(){
    vec2 uniformPos = (gl_FragCoord.xy/screenSize-vec2(0.5,0.5))*2.;
    vec4 sphereCenter=worldToViewMatrix*objectToWorldMatrix*vec4(0,0,0,1);
    vec3 dir=normalize(screenToVec3(uniformPos));
    vec3 currentPos=vec3(0,0,0);
    float dis=1.;
    for(float i=0.; i<100.; i++) {
        dis=sphereSDF(currentPos,sphereCenter.xyz,20.);
        if(abs(dis)<0.) break;
        currentPos=currentPos+dir*1.*dis;
    }
    // if(abs(length(screenToVec3(uniformPos-sphereCenter.xy)))<1.1){
    // if(length(dir.xy) < 0.5){
    // if(sin(length(currentPos)) > 0.){
    if (abs(dis) < 1e-5){
        float lpos=length(currentPos);
        vec4 deepVec=projectionMatrix*vec4(currentPos,1);
        gl_FragDepthEXT = -1.0;
        if(sin(2.*lpos) > 0.) {
            gl_FragColor=vec4(0.8,0.3,0,1);
        }else{
            gl_FragColor=vec4(0,0.2,1,1);
        }
    } else {
        gl_FragColor=vec4(0,0,0,1);
        gl_FragDepthEXT = 1.0;
    }
    
}