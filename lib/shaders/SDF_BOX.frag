precision mediump float;
uniform vec2 screenSize;
uniform mat4 objectToWorldMatrix;
uniform mat4 worldToViewMatrix;

void main() {
    vec2 mathpos;
    mathpos.x = 0.00390625 * (gl_FragCoord.x - 256.0);
    mathpos.y = 0.00390625 * (gl_FragCoord.y - 256.0);
    gl_FragColor = vec4(sin(20.0*(sqrt(mathpos.x*mathpos.x + mathpos.y*mathpos.y))), sin(15.0*(sqrt(mathpos.x*mathpos.x + mathpos.y*mathpos.y))), sin(10.0*(mathpos.x*mathpos.x + mathpos.y*mathpos.y)), 1);
}