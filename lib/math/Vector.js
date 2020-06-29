export class VectorFunctions{
    constructor(){} 
    static vecMinus(v1, v2) {
        if(v1.length !== v2.length) {
            console.error("# vectorMinus length not equal.");
        }
        let result = [];
        for(let i = 0; i < v1.length; i++) {
            result.push(v2[i] - v1[i]);
        }
        return result;
    }
    static vecAdd(v1, v2) {
        if(v1.length !== v2.length) {
            console.error("# vectorMinus length not equal.");
        }
        let result = [];
        for(let i = 0; i < v1.length; i++) {
            result.push(v2[i] + v1[i]);
        }
        return result;
    }
    static vecDot(v1, v2) {
        if(v1.length !== v2.length) {
            console.error("# vectorDot length not equal.");
            return null;
        }
        let result = 0;
        for(let i = 0; i < v1.length; i++) {
            result += v2[i] * v1[i];
        }
        return result;
    }
    static vecNormalize(vec) {
        let len = this.vecLength(vec);
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
    static vecLength(vec){
        let len = 0;
        for (let i = 0; i < vec.length; i++) {
            len += vec[i] * vec[i];
        }
        return Math.sqrt(len);
    }
    static vecAbs(vec){
        let result = [];
        for (let i = 0; i < vec.length; i++) {
            result.push(Math.abs(vec[i]));
        }
        return result;
    }
    static vecMaxTerm(vec){
        let max = vec[0];
        for (let i = 1; i < vec.length; i++){
            max = Math.max(max, vec[i]);
        }
        return max;
    }
    static vecMinTerm(vec){
        let min = vec[0];
        for (let i = 1; i < vec.length; i++){
            min = Math.min(min, vec[i]);
        }
        return min;
    }
    static vecTrimAbove(vec, min){
        let result = [];
        for (let i = 0; i < vec.length; i++) {
            result.push(Math.min(vec[i], min));
        }
        return result;
    }
    static vecTrimBelow(vec, max){
        let result = [];
        for (let i = 0; i < vec.length; i++) {
            result.push(Math.max(vec[i], max));
        }
        return result;
    }
    static vecScale(vec, s){
        let result = [];
        for (let i = 0; i < vec.length; i++) {
            result.push(vec[i] * s);
        }
        return result;
    }
    static vecShift(vec, s){
        let result = [];
        for (let i = 0; i < vec.length; i++) {
            result.push(vec[i] + s);
        }
        return result;
    }
    static vecEqual(v1, v2){
        let result = true;
        for(let i = 0; i < v1.length; i++){
            result = result && v1[i] == v2[i];
        }
        return result;
    }
    static vec3Cross(v1, v2) {
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
}
export class MatrixFunctions{
    constructor(){}
    static identity(dimension) {
        if (dimension == 4) return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        else if (dimension == 3) return [1,0,0,0,1,0,0,0,1];
    }
    static zero(dimension) {
        if(dimension == 4) return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        else if (dimension == 3) return [0,0,0,0,0,0,0,0,0];
    }
    static mat4Set(mat, rowIdx, columnIdx, value) {
        let idx = columnIdx * 4 + rowIdx;
        mat[idx] = value;
    }
    static mat4Get(mat, rowIdx, columnIdx) {
        let idx = columnIdx * 4 + rowIdx;
        return mat[idx];
    }
    static mat3Set(mat, rowIdx, columnIdx, value) {
        let idx = columnIdx * 3 + rowIdx;
        mat[idx] = value;
    }
    static mat3Get(mat, rowIdx, columnIdx) {
        let idx = columnIdx * 3 + rowIdx;
        return mat[idx];
    }
    static mat4Transpose(mat) {
        if (mat.length !== 16) {
            console.error("# matTrans mat.length invalid:", mat.length);
            return null;
        }
        let idxs = [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15];
        let result = [];
        for(let idx of idxs) result.push(mat[idx]);
        return result;
    }
    static mat3Transpose(mat){
        if (mat.length !== 9) {
            console.error("# matTrans mat.length invalid:", mat.length);
            return null;
        }
        let idxs = [0, 3,6,1,4 ,7,2,5,8];
        let result = [];
        for(let idx of idxs) result.push(mat[idx]);
        return result;
    }
    static mat4Det(M) {
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
        return s0 - s1 - s2 + s3 - s4 + s5 + s6 - s7 - s8 + s9 + s10 -
            s11 - s12 + s13 + s14 - s15 - s16 + s17 + s18 - s19 - s20 + s21 + s22 -
            s23;
    }
    static mat3Det(M){
        let a = M[0], b = M[1], c = M[2],
            d = M[3], e = M[4], f = M[5],
            g = M[6], h = M[7], i = M[8];
        return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
    }
    static mat4Inverse(M) {
        if (this.mat4Det(M) <= 1e-8) {
            console.error("# Not Inversible.");
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
    static mat3Inverse(M){
        let det = this.mat3Det(M);
        if(det <= 1e-8){
            console.error("# Not Inversible.");
            return null;
        }
        let m00 = (e * i - h * f) / det,
            m01 = (c * h - b * i) / det,
            m02 = (b * f - c * e) / det,
            m10 = (f * g - d * i) / det,
            m11 = (a * i - c * g) / det,
            m12 = (d * c - a * f) / det,
            m20 = (d * h - g * e) / det,
            m21 = (g * b - a * h) / det,
            m22 = (a * e - d * b) / det;
        return [m00, m01, m02, m10, m11, m12, m20, m21, m22];
    }
    static mat3GetCol(M,i){
        if(i == 0) return [M[0],M[3],M[6]];
        else if(i == 1) return [M[1],M[4],M[7]];
        else if(i == 2) return [M[2],M[5],M[8]];
    }
    static mat3GetRow(M, i){
        if(i == 0) return [M[0],M[1],M[2]];
        else if(i == 1) return [M[3],M[4],M[5]];
        else if(i == 2) return [M[6],M[7],M[8]];
    }
    static mat4GetCol(M,i){
        if(i == 0) return [M[0],M[4],M[8],M[12]];
        else if(i == 1) return [M[1],M[5],M[9],M[13]];
        else if(i == 2) return [M[2],M[6],M[10],M[14]];
        else if(i == 3) return [M[3],M[7],M[11],M[15]];
    }
    static mat4GetRow(M, i){
        if(i == 0) return [M[0],M[1],M[2],M[3]];
        else if(i == 1) return [M[4],M[5],M[6],M[7]];
        else if(i == 2) return [M[8],M[9],M[10],M[11]];
        else if(i == 3) return [M[12],M[13],M[14],M[15]];
    }
    static mat4MultVec(M,v){
        return [vecDot(this.mat4GetRow(M,0),v),vecDot(this.mat4GetRow(M,1),v),
            vecDot(this.mat4GetRow(M,2),v),vecDot(this.mat4GetRow(M,3),v)];
    }
    static mat4Mult(A, B) {
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
    static mat3MultVec(M,v){
        return [vecDot(this.mat3GetRow(M,0),v),vecDot(this.mat3GetRow(M,1),v),
            vecDot(this.mat3GetRow(M,2),v)];
    }
    static mat3Mult(A,B){
        let AR = [this.mat3GetRow(A,0),this.mat3GetRow(A,1),this.mat3GetRow(A,2)];
        let BC = [this.mat3GetCol(B,0),this.mat3GetCol(B,1),this.mat3GetCol(B,2)];
        return [AR[0] * BC[0], AR[0] * BC[1], AR[0] * BC[2],
                AR[1] * BC[0], AR[1] * BC[1], AR[1] * BC[2],
                AR[2] * BC[0], AR[2] * BC[1], AR[2] * BC[2]];
    }
    static mat4FromCols(columns) {
        if (columns.length != 4) {
            console.error("# mat4 must have 4 cols.");
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
    static mat4FromRows(rows) {
        if (rows.length != 4) {
            console.error("# mat4 must have 4 rows.");
            return null;
        }
        let result = this.mat4FromCols(rows);
        result = this.mat4Transpose(result);
        return result;
    }
    static mat3FromCols(columns) {
        if (columns.length != 3) {
            console.error("# mat3 must have 3 cols.");
            return null;
        }
        let result = [];
        for (let i = 0; i < 3; i ++) {
            let col = columns[i];
            for (let j = 0; j < 3; j++) {
                if (j < col.length) result.push(col[j]);
                else result.push(0);
            }
        }
        return result;
    }
    static mat3FromRows(rows) {
        if (rows.length != 3) {
            console.error("# mat3 must have 3 rows.");
            return null;
        }
        let result = this.mat3FromCols(rows);
        result = this.mat3Transpose(result);
        return result;
    }
    static mat4ForTranslation(mov) {
        return this.mat4Transpose([1, 0, 0, mov[0],  0, 1, 0, mov[1],  0, 0, 1, mov[2],  0, 0, 0, 1]);
    }
    // reference: http://www.songho.ca/opengl/gl_projectionmatrix.html
    static mat4Projection(r, t, n, f) {
        return this.mat4Transpose([
            n / r, 0, 0, 0,
            0, n / t, 0, 0,
            0, 0, - (f + n) / (f - n), - 2 * f * n / (f - n),
            0, 0, -1, 0
        ]);
    }
    //reference: https://stackoverflow.com/questions/21830340/understanding-glmlookat
    static mat4LookAt(pos, target, up) {
        let Z = VectorFunctions.vecNormalize(VectorFunctions.vecMinus(target, pos)); //change to original's negative.
        let Y = up;
        let X = VectorFunctions.vec3Cross(Y, Z);
        Y = VectorFunctions.vec3Cross(Z, X);
        X = VectorFunctions.vecNormalize(X);
        Y = VectorFunctions.vecNormalize(Y);
        return this.mat4Transpose([
            X[0], X[1], X[2], - VectorFunctions.vecDot(X, pos),
            Y[0], Y[1], Y[2], - VectorFunctions.vecDot(Y, pos),
            Z[0], Z[1], Z[2], - VectorFunctions.vecDot(Z, pos),
            0, 0, 0, 1
        ]);
    }
    static mat4ToString(mat) {
        let str = " " + mat[0] + " " + mat[4] + " " + mat[8] + " " + mat[12] + "\n";
        str += " " + mat[1] + " " + mat[5] + " " + mat[9] + " " + mat[13] + "\n";
        str += " " + mat[2] + " " + mat[6] + " " + mat[10] + " " + mat[14] + "\n";
        str += " " + mat[3] + " " + mat[7] + " " + mat[11] + " " + mat[15] + "\n";
        return str;
    }
    static mat3ToString(mat){
        let str = " " + mat[0] + " " + mat[3] + " " + mat[6] + "\n";
        str += " " + mat[1] + " " + mat[4] + " " + mat[7] + "\n";
        str += " " + mat[2] + " " + mat[5] + " " + mat[8] + "\n";
        return str;
    }
}