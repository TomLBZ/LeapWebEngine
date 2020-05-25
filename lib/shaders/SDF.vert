attribute vec3 aVertexPosition;
//about depth buffer: https://stackoverflow.com/questions/13711252/what-does-gl-fragcoord-z-gl-fragcoord-w-represent]
// https://stackoverflow.com/questions/19819376/what-happens-to-the-depth-buffer-if-i-discard-a-fragment-in-a-shader-using-early
void main(void) {
    gl_Position = vec4(aVertexPosition, 1.0);
}