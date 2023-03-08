import * as THREE from 'three';
import { aimImageURI } from '../constants';


// export function generateUUID() {
//     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
//         var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
//         return v.toString(16);
//     });
// }


export function createAimElement() {
    if (document.getElementById('aim-id')) return;
    const image = new Image();
    image.id = 'aim-id';
    image.setAttribute('decoding', 'async');
    image.setAttribute('rel', 'prefetch');
    image.setAttribute('alt', 'x');
    image.src = aimImageURI;
    image.style.position = 'fixed';
    image.style.margin = 'auto';
    image.style.top = '0';
    image.style.left = '0';
    image.style.right = '0';
    image.style.bottom = '0';
    image.style.width = '3%';
    image.style.alignItems = 'center';
    image.style.textAlign = 'center';
    image.style.zIndex = '1000000';

    document.body.appendChild(image);
}


export function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}


// TODO: limit on total number of calls
// source: https://towardsdev.com/debouncing-and-throttling-in-javascript-8862efe2b563
// This also includes the last call:
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


export const throttleFirstArgIsMapKey = (func, limit) => {
    let lastFunc;
    const lastRanMap = new Map();
    return function() {
        const context = this;
        const args = arguments;
        let lastRan = lastRanMap.get(args[0]);
        if (!lastRan) {
            func.apply(context, args)
            lastRan = Date.now();
            lastRanMap.set(args[0], lastRan);
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                    lastRanMap.set(args[0], lastRan);
                }
            }, limit - (Date.now() - lastRan));
        }
    }
}


// In case we want to have a callback for trottling.... not sue if this works:
// export const throttle = (func, limit, doTrottle) => {
//     let lastFunc;
//     let lastRan;
//     return function() {
//         const context = this;
//         const args = arguments;

//         const forceRun = doTrottle ? doTrottle(): false;

//         if (forceRun) {
//             func.apply(context, args)
//             lastRan = Date.now();
//         } else if (!lastRan) {
//             func.apply(context, args)
//             lastRan = Date.now();
//         } else {
//             clearTimeout(lastFunc);
//             lastFunc = setTimeout(function() {
//                 if ((Date.now() - lastRan) >= limit) {
//                     func.apply(context, args);
//                     lastRan = Date.now();
//                 }
//             }, limit - (Date.now() - lastRan));
//         }
//     }
// }


export function resetCameraPosition(camera: any) {
    camera.position.set(0, 3, 4);
    let cameraDirection = new THREE.Vector3(0, 3, -1);
    camera.lookAt(cameraDirection);
}


export const timeIt = (context, func, args) => {
    let startTime = performance.now();
    context = context || this;
    const result = func.apply(context, ...args);
    let endTime = performance.now();
    console.log(`It took ${(endTime - startTime)} ms and ${((endTime - startTime)/1000).toFixed(3)} s.`);
    return result;
}


export const setDefault = (x: any): boolean => x !== false && ( x === undefined || x === null || x === true );

