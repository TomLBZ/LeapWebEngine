precision mediump float;
uniform mat4 objectToWorldMatrix;
uniform mat4 worldToViewMatrix;
uniform vec4 diffuseColor;

void main() {
    vec2 mathpos;
    mathpos.x = 0.00390625 * (gl_FragCoord.x - 256.0);
    mathpos.y = 0.00390625 * (gl_FragCoord.y - 256.0);
    gl_FragColor = diffuseColor;
}