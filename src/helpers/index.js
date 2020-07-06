import { getWasm } from './wasmReady';
export async function getImageData(url) {
    const canvas2d = document.createElement('canvas');
    const ctx = canvas2d.getContext('2d');
    const image = new Image();
    return await new Promise((resolve, reject) => {
        image.onload = function () {
            canvas2d.width = image.naturalWidth;
            canvas2d.height = image.naturalHeight;
            ctx.drawImage(image, 0, 0);
            resolve(ctx.getImageData(0, 0, canvas2d.width, canvas2d.height));
        };
        image.onerror = reject;
        image.onabort = reject;
        image.setAttribute('crossOrigin', '');
        image.src = url;
    })
}

export async function getBufferFromUrl(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error response status is ' + response.status)
    return await response.arrayBuffer();
}

export async function getBufferFromFile(file) {
    return await new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.onload = function (event) {
            var contents = event.target.result;
            resolve(contents);
        };
        reader.onerror = function (event) {
            reject(new Error("File could not be read! Code " + event.target.error.code));
        };
        reader.readAsArrayBuffer(file);
    });
    
}

export function arrayToHeap(typedArray) {
    const numBytes = typedArray.length * typedArray.BYTES_PER_ELEMENT;
    const ptr = getWasm()._malloc(numBytes);
    const heapBytes = getWasm().HEAPU8.subarray(ptr, ptr + numBytes);
    heapBytes.set(typedArray);
    return heapBytes;
}

