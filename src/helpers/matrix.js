/**
 * multiplyMatrix 
 * @param {[[Number]]} a 
 * @param {[[Number]]} b 
 * @returns {[[Number]]}
 */
export function multiplyMatrix(a, b) {
    const [{ length: aRowLength }] = a;
    const { length: bColumnLength } = b;
    const [{ length: bRowLength }] = b;
    if (bColumnLength !== aRowLength) throw new Error('matrixes are not multiplied');
    const result = (new Array(a.length)).fill(0).map(_ => (new Array(bRowLength)).fill(0));
    for (let i = 0; i < a.length; ++i) {
        for (let j = 0; j < bRowLength; ++j) {
            let sum = 0;
            for (let k = 0; k < bColumnLength; ++k) {
                sum += a[i][k] * b[k][j];
            }
            result[i][j] = sum;
        }
    }

    return result;
}


/**
 * multiplyMatrix 
 * @param {[Number]} a 
 * @param {[Number]} b 
 * @returns {[Number]} 
 */

export function multiplyMatrix4X4(a, b) {
    if (a.length !== b.length) throw new Error('matrixes are not multiplied'); // bad logic TODO(MIkayel)
    const result = new Array(16).fill(0);
    for (let i = 0; i < 4; ++i) {
        for (let j = 0; j < 4; ++j) {
            let sum = 0;
            for (let k = 0; k < 4; ++k) {
                sum += a[i * 4 + k] * b[k * 4 + j];
            }
            result[i * 4 + j] = sum;
        }
    }

    return result;
}

export function Transpose4x4(a) {
    const result = new Array(16).fill(0);
    for (let i = 0; i < 4; i++) // loop to  the matrix
    {
        for (let j = 0; j < 4; j++) {
            result[j * 4 + i] = a[i * 4 + j];
        }
    }
    return result;
}