export class Renderer {
    constructor(canvas, width, height) {
        this.canvas = canvas;
        canvas.width = width;
        canvas.height = height;
        this.width = width;
        this.height = height;
        this.renderCount = 0;
    }
    renderScene(scene, camera) {
        console.error("# renderScene not implemented by child class.", scene, camera);
    }
}