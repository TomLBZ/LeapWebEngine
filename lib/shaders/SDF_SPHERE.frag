precision mediump float;
uniform vec2 screenSize;
uniform mat4 objectToWorldMatrix;
uniform mat4 worldToViewMatrix;

float sphereSDF(vec3 p, vec3 sph, float radius) {
    return length(p - sph) - radius;
}
void main() {
    vec2 mathpos;
    vec4 p = worldToViewMatrix * objectToWorldMatrix * vec4(0, 0, 0, 1);

    mathpos.x = 0.00390625 * (gl_FragCoord.x - screenSize.x * 0.5) - p.x;
    mathpos.y = 0.00390625 * (gl_FragCoord.y - screenSize.y * 0.5) - p.y;
    gl_FragColor = vec4(sin(20.0*(sqrt(mathpos.x*mathpos.x + mathpos.y*mathpos.y))), sin(15.0*(sqrt(mathpos.x*mathpos.x + mathpos.y*mathpos.y))), sin(10.0*(mathpos.x*mathpos.x + mathpos.y*mathpos.y)), 1);
}