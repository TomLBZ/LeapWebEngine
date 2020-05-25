precision mediump float;
uniform mat4 objectToWorldMatrix;
uniform mat4 worldToViewMatrix;
uniform vec4 diffuseColor;

float sphereSDF(vec3 p, vec3 sph, float radius) {
    return length(p - sph) - radius;
}
void main() {
    vec2 mathpos;
    vec4 p = worldToViewMatrix * objectToWorldMatrix * vec4(0, 0, 0, 1);
    gl_FragColor = diffuseColor;
}