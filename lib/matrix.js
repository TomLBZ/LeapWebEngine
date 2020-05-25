export function matrixIdentity() {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

export function matrixZero() {
    return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
}

export function matrixSet(mat, rowIdx, columnIdx, value) {
    let idx = columnIdx * 4 + rowIdx;
    mat[idx] = value;
}

export function matrixGet(mat, rowIdx, columnIdx) {
    let idx = columnIdx * 4 + rowIdx;
    return mat[idx];
}

export function matrixTrans(mat) {
    if (mat.length !== 16) {
        console.error("# matTrans mat.length invalid:", mat.length);
        return null;
    }
    let idxs = [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15];
    let result = [];
    for(let idx of idxs) result.push(mat[idx]);
    return result;
}

export function matrixReverse(M) {
    let s0 = M[1] * M[11] * M[14] * M[4];
    let s1 = M[1] * M[10] * M[15] * M[4];
    let s2 = M[11] * M[13] * M[2] * M[4];
    let s3 = M[10] * M[13] * M[3] * M[4];
    let s4 = M[0] * M[11] * M[14] * M[5];
    let s5 = M[0] * M[10] * M[15] * M[5];
    let s6 = M[11] * M[12] * M[2] * M[5];
    let s7 = M[10] * M[12] * M[3] * M[5];
    let s8 = M[1] * M[11] * M[12] * M[6];
    let s9 = M[0] * M[11] * M[13] * M[6];
    let s10 = M[1] * M[10] * M[12] * M[7];
    let s11 = M[0] * M[10] * M[13] * M[7];
    let s12 = M[15] * M[2] * M[5] * M[8];
    let s13 = M[14] * M[3] * M[5] * M[8];
    let s14 = M[1] * M[15] * M[6] * M[8];
    let s15 = M[13] * M[3] * M[6] * M[8];
    let s16 = M[1] * M[14] * M[7] * M[8];
    let s17 = M[13] * M[2] * M[7] * M[8];
    let s18 = M[15] * M[2] * M[4] * M[9];
    let s19 = M[14] * M[3] * M[4] * M[9];
    let s20 = M[0] * M[15] * M[6] * M[9];
    let s21 = M[12] * M[3] * M[6] * M[9];
    let s22 = M[0] * M[14] * M[7] * M[9];
    let s23 = M[12] * M[2] * M[7] * M[9];

    let det = s0 - s1 - s2 + s3 - s4 + s5 + s6 - s7 - s8 + s9 + s10 -
        s11 - s12 + s13 + s14 - s15 - s16 + s17 + s18 - s19 - s20 + s21 + s22 -
        s23;

    if (det <= 1e-8) {
        console.error("# Matrix to reverse is not reversable.");
        return null;
    }

    return [
        (-(M[11] * M[14] * M[5]) + M[10] * M[15] * M[5] + M[11] * M[13] * M[6] - M[10] * M[13] * M[7] - M[15] * M[6] * M[9] + M[14] * M[7] * M[9]) / det,
        (M[1] * M[11] * M[14] - M[1] * M[10] * M[15] - M[11] * M[13] * M[2] + M[10] * M[13] * M[3] + M[15] * M[2] * M[9] - M[14] * M[3] * M[9]) / det,
        (-(M[15] * M[2] * M[5]) + M[14] * M[3] * M[5] + M[1] * M[15] * M[6] - M[13] * M[3] * M[6] - M[1] * M[14] * M[7] + M[13] * M[2] * M[7]) / det,
        (M[11] * M[2] * M[5] - M[10] * M[3] * M[5] - M[1] * M[11] * M[6] + M[1] * M[10] * M[7] + M[3] * M[6] * M[9] - M[2] * M[7] * M[9]) / det,    
        (M[11] * M[14] * M[4] - M[10] * M[15] * M[4] - M[11] * M[12] * M[6] + M[10] * M[12] * M[7] + M[15] * M[6] * M[8] - M[14] * M[7] * M[8]) / det,
        (-(M[0] * M[11] * M[14]) + M[0] * M[10] * M[15] + M[11] * M[12] * M[2] - M[10] * M[12] * M[3] - M[15] * M[2] * M[8] + M[14] * M[3] * M[8]) / det,
        (M[15] * M[2] * M[4] - M[14] * M[3] * M[4] - M[0] * M[15] * M[6] + M[12] * M[3] * M[6] + M[0] * M[14] * M[7] - M[12] * M[2] * M[7]) / det,  
        (-(M[11] * M[2] * M[4]) + M[10] * M[3] * M[4] + M[0] * M[11] * M[6] - M[0] * M[10] * M[7] - M[3] * M[6] * M[8] + M[2] * M[7] * M[8]) / det, 
        (-(M[11] * M[13] * M[4]) + M[11] * M[12] * M[5] - M[15] * M[5] * M[8] + M[13] * M[7] * M[8] + M[15] * M[4] * M[9] - M[12] * M[7] * M[9]) / det,
        (-(M[1] * M[11] * M[12]) + M[0] * M[11] * M[13] + M[1] * M[15] * M[8] - M[13] * M[3] * M[8] - M[0] * M[15] * M[9] + M[12] * M[3] * M[9]) / det,
        (-(M[1] * M[15] * M[4]) + M[13] * M[3] * M[4] + M[0] * M[15] * M[5] - M[12] * M[3] * M[5] + M[1] * M[12] * M[7] - M[0] * M[13] * M[7]) / det,
        (M[1] * M[11] * M[4] - M[0] * M[11] * M[5] + M[3] * M[5] * M[8] - M[1] * M[7] * M[8] - M[3] * M[4] * M[9] + M[0] * M[7] * M[9]) / det,      
        (M[10] * M[13] * M[4] - M[10] * M[12] * M[5] + M[14] * M[5] * M[8] - M[13] * M[6] * M[8] - M[14] * M[4] * M[9] + M[12] * M[6] * M[9]) / det,        (M[1] * M[10] * M[12] - M[0] * M[10] * M[13] - M[1] * M[14] * M[8] + M[13] * M[2] * M[8] + M[0] * M[14] * M[9] - M[12] * M[2] * M[9]) / det,        (M[1] * M[14] * M[4] - M[13] * M[2] * M[4] - M[0] * M[14] * M[5] + M[12] * M[2] * M[5] - M[1] * M[12] * M[6] + M[0] * M[13] * M[6]) / det,  
        (-(M[1] * M[10] * M[4]) + M[0] * M[10] * M[5] - M[2] * M[5] * M[8] + M[1] * M[6] * M[8] + M[2] * M[4] * M[9] - M[0] * M[6] * M[9]) / det];  
}

export function matrixMultiply(A, B) {
    return [
        A[0] * B[0] + A[4] * B[1] + A[8] * B[2] + A[12] * B[3],
        A[1] * B[0] + A[5] * B[1] + A[9] * B[2] + A[13] * B[3],
        A[2] * B[0] + A[6] * B[1] + A[10] * B[2] + A[14] * B[3],
        A[3] * B[0] + A[7] * B[1] + A[11] * B[2] + A[15] * B[3],
        A[0] * B[4] + A[4] * B[5] + A[8] * B[6] + A[12] * B[7],
        A[1] * B[4] + A[5] * B[5] + A[9] * B[6] + A[13] * B[7],
        A[2] * B[4] + A[6] * B[5] + A[10] * B[6] + A[14] * B[7],
        A[3] * B[4] + A[7] * B[5] + A[11] * B[6] + A[15] * B[7],
        A[8] * B[10] + A[12] * B[11] + A[0] * B[8] + A[4] * B[9],
        A[9] * B[10] + A[13] * B[11] + A[1] * B[8] + A[5] * B[9],
        A[10] * B[10] + A[14] * B[11] + A[2] * B[8] + A[6] * B[9],
        A[11] * B[10] + A[15] * B[11] + A[3] * B[8] + A[7] * B[9],
        A[0] * B[12] + A[4] * B[13] + A[8] * B[14] + A[12] * B[15],
        A[1] * B[12] + A[5] * B[13] + A[9] * B[14] + A[13] * B[15],
        A[2] * B[12] + A[6] * B[13] + A[10] * B[14] + A[14] * B[15],
        A[3] * B[12] + A[7] * B[13] + A[11] * B[14] + A[15] * B[15]
    ];
}

export function matrixFromColumns(columns) {
    if (columns.length != 4) {
        console.error("# matrixFromColumns input must be 4 cols.");
        return null;
    }
    let result = [];
    for (let i = 0; i < 4; i ++) {
        let col = columns[i];
        for (let j = 0; j < 4; j++) {
            if (j < col.length) result.push(col[j]);
            else result.push(0);
        }
    }
    return result;
}

export function matrixFromRows(rows) {
    if (rows.length != 4) {
        console.error("# matrixFromColumns input must be 4 cols.");
        return null;
    }
    let result = matrixFromColumns(rows);
    result = matrixTrans(result);
    return result;
}

export function matrixForTranslation(mov) {
    return matrixTrans([1, 0, 0, mov[0],  0, 1, 0, mov[1],  0, 0, 1, mov[2],  0, 0, 0, 1]);
}

// reference: http://www.songho.ca/opengl/gl_projectionmatrix.html
export function matrixProjection(r, t, n, f) {
    return matrixTrans([
        n / r, 0, 0, 0,
        0, n / t, 0, 0,
        0, 0, - (f + n) / (f - n), - 2 * f * n / (f - n),
        0, 0, -1, 0
    ]);
}

//reference: https://stackoverflow.com/questions/21830340/understanding-glmlookat
export function matrixLookAt(pos, target, up) {
    let Z = vectorNormalize(vectorMinus(target, pos)); //change to original's negative.
    let Y = up;
    let X = vector3Cross(Y, Z);
    Y = vector3Cross(Z, X);
    X = vectorNormalize(X);
    Y = vectorNormalize(Y);
    return matrixTrans([
        X[0], X[1], X[2], - vectorDot(X, pos),
        Y[0], Y[1], Y[2], - vectorDot(Y, pos),
        Z[0], Z[1], Z[2], - vectorDot(Z, pos),
        0, 0, 0, 1
    ]);
}

export function matrixToString(mat) {
    let str = " " + mat[0] + " " + mat[4] + " " + mat[8] + " " + mat[12] + "\n";
    str += " " + mat[1] + " " + mat[5] + " " + mat[9] + " " + mat[13] + "\n";
    str += " " + mat[2] + " " + mat[6] + " " + mat[10] + " " + mat[14] + "\n";
    str += " " + mat[3] + " " + mat[7] + " " + mat[11] + " " + mat[15] + "\n";
    return str;
}

export function vectorMinus(v1, v2) {
    if(v1.length !== v2.length) {
        console.error("# vectorMinus length not equal.");
    }
    let result = [];
    for(let i = 0; i < v1.length; i++) {
        result.push(v2[i] - v1[i]);
    }
    return result;
}

export function vectorAdd(v1, v2) {
    if(v1.length !== v2.length) {
        console.error("# vectorMinus length not equal.");
    }
    let result = [];
    for(let i = 0; i < v1.length; i++) {
        result.push(v2[i] + v1[i]);
    }
    return result;
}

export function vectorDot(v1, v2) {
    if(v1.length !== v2.length) {
        console.error("# vectorMinus length not equal.");
        return null;
    }
    let result = 0;
    for(let i = 0; i < v1.length; i++) {
        result += v2[i] * v1[i];
    }
    return result;
}

export function vectorNormalize(vec) {
    let len = 0;
    for (let i = 0; i < vec.length; i++) {
        len += vec[i] * vec[i];
    }
    len = Math.sqrt(len);
    if (len === 0) {
        console.error("# vectorNormalize length is zero.");
        return null;
    }
    let result = [];
    for (let i = 0; i < vec.length; i++) {
        result.push(vec[i] / len);
    }
    return result;
}

export function vector3Cross(v1, v2) {
    if (v1.length !== 3 || v2.length !== 3) {
        console.error("# vector3Cross vec length must be 3.");
        return null;
    }
    return [
        v1[1] * v2[2] - v1[2] * v2[1],
        v1[2] * v2[0] - v1[0] * v2[2],
        v1[0] * v2[1] - v1[1] * v2[0],
    ]
}

/* ---------------- calculation code in Mathematica ----------------
Mat = {{M0, M4, M8, M12}, {M1, M5, M9, M13}, {M2, M6, M10, M14}, {M3, M7, M11, M15}}
MatrixForm[Mat]

CForm[Det[Mat]]

CForm[Flatten[Transpose[Inverse[Mat]]]

Mat1 = {{A0, A4, A8, A12}, {A1, A5, A9, A13}, {A2, A6, A10, A14}, {A3, A7, A11, A15}}
Mat2 = {{B0, B4, B8, B12}, {B1, B5, B9, B13}, {B2, B6, B10, B14}, {B3, B7, B11, B15}}
MatrixForm[Mat1]
MatrixForm[Mat2]

CForm[Flatten[Transpose[Mat1.Mat2]]]
*/
