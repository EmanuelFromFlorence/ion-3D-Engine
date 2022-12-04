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


export function resetCameraPosition(camera: any) {
    camera.position.set(0, 4, 10);
    let cameraDirection = new THREE.Vector3(0, 3, -1);
    camera.lookAt(cameraDirection);
}
