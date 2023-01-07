import * as THREE from 'three';


// export function generateUUID() {
//     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
//         var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
//         return v.toString(16);
//     });
// }


export function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}


/////////////////// limit on total number of calls
// https://towardsdev.com/debouncing-and-throttling-in-javascript-8862efe2b563
export const throttle = (func, limit) => {
    let lastFunc;
    let lastRan;
    return function() {
        const context = this;
        const args = arguments;
        if (!lastRan) {
        func.apply(context, args)
        lastRan = Date.now();
        } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(function() {
            if ((Date.now() - lastRan) >= limit) {
                func.apply(context, args);
                lastRan = Date.now();
            }
            }, limit - (Date.now() - lastRan));
        }
    }
}


export function resetCameraPosition(camera: any) {
    camera.position.set(0, 4, 10);
    let cameraDirection = new THREE.Vector3(0, 3, -1);
    camera.lookAt(cameraDirection);
}
