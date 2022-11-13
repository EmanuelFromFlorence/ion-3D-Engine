import * as THREE from 'three';


export const createWebGLRenderer = (canvas: HTMLCanvasElement) => {
    const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, alpha: true});
    // renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio( window.devicePixelRatio ); 
    renderer.setSize( canvas.clientWidth, canvas.clientHeight );
    // renderer.xr.enabled = true; // will do that in engine or sth...
    
    // Shadows: https://www.youtube.com/watch?v=AUF15I3sy6s
    // Remember this makes it super slow!!!!!!!!!!!!
    // renderer.shadowMap.enabled = true;

    // renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default ((which is faster)) THREE.PCFShadowMap // PCFSoftShadowMap VSMShadowMap
    // This changes the colors dramatically and shadoes are not good too (although maybe needed for some of the post processing)!!!
    
    // Why to do this: https://stackoverflow.com/questions/69962432/when-do-we-need-to-use-renderer-outputencoding-three-srgbencoding
    renderer.outputEncoding = THREE.sRGBEncoding;
    // Why to do this https://www.youtube.com/watch?v=6XvqaokjuYU
    // Docs: https://threejs.org/examples/#webgl_tonemapping
    // renderer.toneMapping = THREE.ACESFilmicToneMapping; // not much performance diff...

    // renderer.physicallyCorrectLights = true;
    return renderer;
}


export const getCamera = (aspect = null, fov = 60, near = 0.1, far = 10000): THREE.PerspectiveCamera => { 
    // aspect = canvas.clientWidth / canvas.clientHeight // window.innerWidth / window.innerHeight; // 1920 / 1080;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far); // OrthographicCamera
    camera.position.set(0, 4, 10);
    // camera.lookAt(new THREE.Vector3(1,0,0));
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
