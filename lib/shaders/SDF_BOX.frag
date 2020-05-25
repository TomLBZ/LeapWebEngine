precision mediump float;
uniform mat4 objectToWorldMatrix;
uniform mat4 worldToViewMatrix;
uniform mat4 projectionMatrix;
uniform vec4 diffuseColor;
uniform vec2 screenSize;

void main() {
    vec2 mathpos;
    mathpos.x = 0.00390625 * (gl_FragCoord.x - 256.0);
    mathpos.y = 0.00390625 * (gl_FragCoord.y - 256.0);
    gl_FragColor = diffuseColor;
}