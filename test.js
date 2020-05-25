import {matrixIdentity, matrixToString, matrixMultiply, matrixTrans, matrixSet, matrixGet, matrixReverse} from './lib/matrix.js';

export function runTests() {
    let mat1 = matrixIdentity();
    let mat2 = matrixIdentity();
    console.log("mat1:\n", matrixToString(mat1));
    
    //set mat2
    matrixSet(mat2, 1, 3, 2.2);
    matrixSet(mat2, 2, 3, 1.5);
    matrixSet(mat2, 2, 1, 3.5);
    console.log("mat2:\n", matrixToString(mat2));

    //transpose mat2
    mat2 = matrixTrans(mat2);
    console.log("mat2:\n", matrixToString(mat2));

    //matrix multiply
    let result = matrixMultiply(mat1, mat2);
    console.log("mat1*mat2:\n", matrixToString(result));

    //matrix reverse
    let rvMat2 = matrixReverse(mat2);
    console.log("reverse(mat2):\n", matrixToString(rvMat2));

    //matrix multiply
    let shouldBeId = matrixMultiply(rvMat2, mat2);
    console.log("reverse(mat2) * mat2:\n", matrixToString(shouldBeId));

}
