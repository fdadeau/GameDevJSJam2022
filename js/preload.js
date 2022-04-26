/** Data to preload */
const data = {

}


/***
 * Preload of resource files (images/sounds) 
 */
async function preload(data, elt) {
    elt.dataset.total = Object.keys(data).length;
    elt.dataset.loaded = 0;
    let r = {};
    for (let i in data) {
        if (data[i].endsWith(".png") || data[i].endsWith(".jpg")) {
            r[i] = await loadImage(data[i]);
        }
        else {
            r[i] = await loadSound(data[i]);
        }
        elt.dataset.loaded = Number(elt.dataset.loaded) + 1;
    }
    return r;
}

function loadImage(path) {
    return new Promise(function(resolve, reject) {
        let img = new Image();
        img.onload = function() {
            resolve(this);
        }
        img.onerror = function() {
            reject(this);
        }
        img.src = path;
    });
}

function loadSound(path) {
    return new Promise(function(resolve, reject) {
        let audio = new Audio();
        audio.oncanplaythrough = function() {
            resolve(this);
        }
        audio.onerror = function() {
            reject(this);
        }
        audio.src = path;
    });    
}

export { preload, data };