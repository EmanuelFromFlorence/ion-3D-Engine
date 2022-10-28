import * as THREE from 'three';
import { SpaceControls } from './control';
// import { loadGLTF } from './io/loader';
import { run } from './nodes/nodes';


let scene;
let camera;
let renderer;
let myControls;


const initCamera = () => {
    const fov = 60;
    const aspect = window.innerWidth / window.innerHeight; // 1920 / 1080;
    const near = 0.1;
    const far = 10000; // 100000
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(-10,10,10);
    camera.lookAt(new THREE.Vector3(1,0,0));
}


const initMainLights = () => {
    let dirLight = new THREE.DirectionalLight(0xfff8e2, 1.5); // 0xFFFFFF
    // let pos = new THREE.Vector3(100, 1000, 100);
    dirLight.position.set(-50, 40, 20);
    dirLight.target.position.set(0, 0, 0);
    dirLight.castShadow = true;
    // dirLight.shadow.autoUpdate = false;
    scene.add(dirLight);

    let ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.4);
    // ambientLight.shadow.autoUpdate = false; // errored
    scene.add(ambientLight);
};


const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();    
    renderer.setSize( window.innerWidth, window.innerHeight );
}


const initControls = () => {
    myControls = new SpaceControls(camera, renderer);
    myControls.setKeyEvents();
    myControls.setLockEvents();
    scene.add(myControls.controls.getObject());
}


const initGraphics = () => {
    const canvas = document.querySelector('#viewport');
    renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, alpha: true});
    // this.renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio( window.devicePixelRatio ); 
    renderer.setSize( window.innerWidth, window.innerHeight );
    // renderer.xr.enabled = true;
    
    // Shadows: https://www.youtube.com/watch?v=AUF15I3sy6s
    // Remember this makes it super slow!!!!!!!!!!!!
    renderer.shadowMap.enabled = true;
    // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default ((which is faster)) THREE.PCFShadowMap // PCFSoftShadowMap VSMShadowMap
    // This changes the colors dramatically and shadoes are not good too (although maybe needed for some of the post processing)!!!
    
    // Why to do this: https://stackoverflow.com/questions/69962432/when-do-we-need-to-use-renderer-outputencoding-three-srgbencoding
    renderer.outputEncoding = THREE.sRGBEncoding;
    // Why to do this https://www.youtube.com/watch?v=6XvqaokjuYU
    // Docs: https://threejs.org/examples/#webgl_tonemapping
    // this.renderer.toneMapping = THREE.ACESFilmicToneMapping; // not much performance diff...

    renderer.physicallyCorrectLights = true;
    window.addEventListener( 'resize', onWindowResize );
}


const animating = () => {
    let prevTime = performance.now();
    const animate = () => {
        // requestAnimationFrame( animate );
        const time = performance.now();
        const delta = ( time - prevTime ) / 1000;

        scene.updateMatrixWorld();

        /* Rendering */
        renderer.render( scene, camera );

        /* Controls */
        myControls.updateControl(delta);

        /* Updates */
        

        prevTime = time;
    }
    // animate();
    renderer.setAnimationLoop( animate );
}


function init(){
    console.log('In init() main.ts...');
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xcccccc );

    initCamera();
    initMainLights();
    initGraphics();
    initControls();
}







window.onload = async () => {
    init();
    animating();

    // loadGLTF('Box.glft', scene);
    // loadGLTF('../public/Box.glft', scene);
    // loadGLTF('../resources/Box.glft', scene);


    // loadGLTF('resources/Box.gltf', scene);
    
    
    run();



    // await Promise.resolve(setTimeout(() => {        
        
    //     console.log(scene.getObjectByName( "Mesh" ));
        



    //     // scene.traverse((child) => {
    //     //     let meshName = child.userData.name;
    //     //     console.log(`child:`);
    //     //     console.log(child);
    //     // });

    // }, 1000));

    
}
