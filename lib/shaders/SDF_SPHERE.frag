precision mediump float;
uniform mat4 objToWorldMatrix;
uniform mat4 worldToViewMatrix;
uniform vec2 screenSize;

float sphereSDF(vec3 p, vec3 sph, float radius) {
    return length(p - sph) - radius;
}
void main() {
    vec2 mathpos;
    mathpos.x = 0.00390625 * (gl_FragCoord.x - screenSize.x);
    mathpos.y = 0.00390625 * (gl_FragCoord.y - screenSize.y);
    gl_FragColor = vec4(sin(20.0*(sqrt(mathpos.x*mathpos.x + mathpos.y*mathpos.y))), sin(15.0*(sqrt(mathpos.x*mathpos.x + mathpos.y*mathpos.y))), sin(10.0*(mathpos.x*mathpos.x + mathpos.y*mathpos.y)), 1);
}