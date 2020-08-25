export const identityMatrix4x4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
export const zeroMatrix4x4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

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
 * multiplyMatrix 4x4 only
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

export function generateMatrix(type, modelObject) {
    const modelMatrix = [...identityMatrix4x4];
    switch (type) {
        case 'scale':
            // scaleX
            modelMatrix[0] = modelObject['scaleX'] || 1;
            // scaleY
            modelMatrix[5] = modelObject['scaleY'] || 1;
            // scaleZ
            modelMatrix[10] = modelObject['scaleZ'] || 1;

            return modelMatrix;
        case 'rotate':
            return ['X', 'Y', 'Z'].map(item => {
                const temp = [...identityMatrix4x4];
                switch (item) {
                    case 'X':
                        temp[5] = Math.cos(modelObject['rotateX'] * Math.PI / 180);
                        temp[6] = - Math.sin(modelObject['rotateX'] * Math.PI / 180);
                        temp[9] = - temp[6];
                        temp[10] = temp[5];
                        return temp;
                    case 'Y':
                        temp[0] = Math.cos(modelObject['rotateY'] * Math.PI / 180);
                        temp[2] = Math.sin(modelObject['rotateY'] * Math.PI / 180);
                        temp[8] = - temp[2];
                        temp[10] = temp[0];
                        return temp;
                    case 'Z':
                        temp[0] = Math.cos(modelObject['rotateZ'] * Math.PI / 180);
                        temp[1] = - Math.sin(modelObject['rotateZ'] * Math.PI / 180);
                        temp[4] = - temp[1];
                        temp[5] = temp[0];
                        return temp;
                    default:
                        return temp;
                }

            }).reduce((sum, item) => multiplyMatrix4X4(item, sum))
        case 'translation':
            // translationX
            modelMatrix[3] = modelObject['translationX'] || 0;
            // translationY
            modelMatrix[7] = modelObject['translationY'] || 0;
            // translationZ
            modelMatrix[11] = modelObject['translationZ'] || 0;
            return modelMatrix;
        default:
            return modelMatrix;
    }

}
