import * as THREE from 'three';
import { resetCameraPosition } from '../core/utils/utils';


export const createWebGLRenderer = (canvas: HTMLCanvasElement, shadowMapEnabled, shadowMapType, outputEncoding, toneMapping, physicallyCorrectLights) => {
    const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, alpha: true});
    // renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio( window.devicePixelRatio ); 
    renderer.setSize( canvas.clientWidth, canvas.clientHeight );
    // renderer.xr.enabled = true; // will do that in engine or sth...
    
    // Shadows: https://www.youtube.com/watch?v=AUF15I3sy6s
    // Remember this makes it super slow!!!!!!!!!!!!
    renderer.shadowMap.enabled = (shadowMapEnabled === true) ? true: false;

    renderer.shadowMap.type = shadowMapType || THREE.PCFShadowMap; // default ((which is faster)) THREE.PCFShadowMap // PCFSoftShadowMap VSMShadowMap
    // This changes the colors dramatically and shadoes are not good too (although maybe needed for some of the post processing)!!!
    
    // Why to do this: https://stackoverflow.com/questions/69962432/when-do-we-need-to-use-renderer-outputencoding-three-srgbencoding
    renderer.outputEncoding = outputEncoding || THREE.sRGBEncoding;
    // Why to do this https://www.youtube.com/watch?v=6XvqaokjuYU
    // Docs: https://threejs.org/examples/#webgl_tonemapping
    if (toneMapping !== false) renderer.toneMapping = toneMapping || THREE.ACESFilmicToneMapping; // not much performance diff...

    renderer.physicallyCorrectLights = (physicallyCorrectLights === true)? true: false;
    return renderer;
}


export const getCamera = (aspect = null, fov = 60, near = 0.1, far = 10000): THREE.PerspectiveCamera => {
    // aspect = canvas.clientWidth / canvas.clientHeight // window.innerWidth / window.innerHeight; // 1920 / 1080;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far); // OrthographicCamera
    resetCameraPosition(camera);
    return camera;
}


// export const addWindowListeners = (camera, renderer): void => {
//     const onWindowResize = () => {
//         const canvas = renderer.domElement;
//         camera.aspect =  canvas.clientWidth / canvas.clientHeight; // window.innerWidth / window.innerHeight;
//         camera.updateProjectionMatrix();
//         renderer.setSize( canvas.clientWidth, canvas.clientHeight );
//     }

//     // https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event
//     // Only handlers registered on the window object will receive resize events.
//     // window.addEventListener( 'resize', onWindowResize );
//     renderer.domElement.addEventListener( 'resize', onWindowResize );
// }
