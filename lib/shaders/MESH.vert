uniform mat4 objectToWorldMatrix;
uniform mat4 worldToViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 aVertexPosition;

void main(void) {
    gl_Position = projectionMatrix * worldToViewMatrix * objectToWorldMatrix * vec4(aVertexPosition, 1.0);
}