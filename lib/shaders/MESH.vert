uniform mat4 objToWorldMatrix;
uniform mat4 worldToViewMatrix;
attribute vec3 aVertexPosition;
void main(void) {
    gl_Position = vec4(aVertexPosition, 1.0);
}