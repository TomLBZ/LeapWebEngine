
function drawOnce() {
    try {
        var canvas = document.getElementById("graph-canvas");
        var gl = canvas.getContext("webgl");
        var vertices = [
            -1, 1, 0.0,
            -1, -1, 0.0,
            1, -1, 0.0,
            1, 1, 0.0
        ];

        var indices = [3, 2, 1, 3, 1, 0];

        // 创建VBO
        var vertexBufferObj = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObj);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        // 创建IBO
        var indexBufferObj = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObj);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        // 创建顶点着色器
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexshaderSourceCode);
        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            alert("vertexShader编译不成功. " + gl.getShaderInfoLog(vertexShader));
        }

        // 创建片元着色器
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentShaderSourceCode);
        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            alert("fragmentShader编译不成功. " + gl.getShaderInfoLog(fragmentShader));
        }

        // 创建着色器程序
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }
        gl.useProgram(program);

        // -------------- draw --------------
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObj);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObj);

        var coord = gl.getAttribLocation(program, "aVertexPosition");
        gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(coord);

        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    } catch (e) {
        console.error("运行错误:" + e.message);
    }
}