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

export const generateUniqueId = (function() {
    let count = 0;
    return function () { return Date.now() + count++ }
})()

export function getAddedIndexInSortArray(callback, array = [], number) {
    let left = 0;
    let right = array.length - 1;
    let m = 0;
    while (left <= right) { 
        m = Math.floor(left + (right - left) / 2); 
        if (callback(array[m]) === number) {
            while(callback(array[m]) === number){ // go left to last equal element 
                m--;
            }
            return m + 1;
        }
        if (callback(array[m]) > number) {
            left = m + 1;
        } else {
            right = m - 1; 
        }     
    }
    if(callback(array[m]) > number) m++;
    return m; 
}