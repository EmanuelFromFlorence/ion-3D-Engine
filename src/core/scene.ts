import * as THREE from 'three';
import { SpaceControls } from '../engine/control';


interface NamedParameters {
    scene: THREE.Scene;
    canvas: HTMLElement;
    renderer: any;
    camera: any;
    sceneControl: any;
    setSizeListener: boolean;
    setLights: boolean;
    setTemplateScene: boolean;
}


export class TemplateScene{
    scene: any;
    background: any;
    sceneControl: SpaceControls;
    floor: any;
    camera: any;
    renderer: any;
    canvas: HTMLElement;

    constructor({scene = null, 
                canvas = null, 
                renderer = null, 
                camera = null, 
                sceneControl = null, 
                setSizeListener = true, 
                setLights = true, 
                setTemplateScene = true}: NamedParameters){
        
        console.log(canvas);
        
        this.scene = scene || new THREE.Scene();
        this.canvas = canvas;
        this.renderer = renderer;
        this.camera = camera;
        this.sceneControl = sceneControl;
        

        if(!this.renderer) this.initGraphics();
        if(!this.camera) this.initCamera();
        if (setSizeListener) this.addWindowListeners();
        if (setLights) this.initMainLights();
        if (!this.sceneControl) this.initControls();
        if (setTemplateScene) this.initTemplateScene();
    }

    initGraphics = () => {
        this.renderer = new THREE.WebGLRenderer({canvas: this.canvas, antialias: true, alpha: true});
        // this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setPixelRatio( window.devicePixelRatio ); 
        this.renderer.setSize( this.canvas.clientWidth, this.canvas.clientHeight );
        // renderer.xr.enabled = true;
        
        // Shadows: https://www.youtube.com/watch?v=AUF15I3sy6s
        // Remember this makes it super slow!!!!!!!!!!!!
        // this.renderer.shadowMap.enabled = true;

        // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default ((which is faster)) THREE.PCFShadowMap // PCFSoftShadowMap VSMShadowMap
        // This changes the colors dramatically and shadoes are not good too (although maybe needed for some of the post processing)!!!
        
        // Why to do this: https://stackoverflow.com/questions/69962432/when-do-we-need-to-use-renderer-outputencoding-three-srgbencoding
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        // Why to do this https://www.youtube.com/watch?v=6XvqaokjuYU
        // Docs: https://threejs.org/examples/#webgl_tonemapping
        // this.renderer.toneMapping = THREE.ACESFilmicToneMapping; // not much performance diff...
    
        // this.renderer.physicallyCorrectLights = true;
    }
 
    initCamera = () => {
        const fov = 60;
        const aspect = this.canvas.clientWidth / this.canvas.clientHeight; // window.innerWidth / window.innerHeight; // 1920 / 1080;
        const near = 0.1;
        const far = 10000; // 100000
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far); // OrthographicCamera
        this.camera.position.set(0, 10, 2);
        // camera.lookAt(new THREE.Vector3(1,0,0));
    }

    addWindowListeners = () => {
        const onWindowResize = () => {
            const canvas = this.renderer.domElement;
            this.camera.aspect =  canvas.clientWidth / canvas.clientHeight; // window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize( canvas.clientWidth, canvas.clientHeight );
        }

        // https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event
        // Only handlers registered on the window object will receive resize events.
        window.addEventListener( 'resize', onWindowResize );
    }

    initMainLights = () => {
        let dirLight = new THREE.DirectionalLight(0xfff8e2, 1.5); // 0xFFFFFF
        // let pos = new THREE.Vector3(100, 1000, 100);
        dirLight.position.set(-50, 40, 20);
        dirLight.target.position.set(0, 0, 0);
        // dirLight.castShadow = true;
        // dirLight.shadow.autoUpdate = false;
        this.scene.add(dirLight);
        let ambientLight = new THREE.AmbientLight(0xFFFFFF, 1);
        // ambientLight.shadow.autoUpdate = false; // errored
        this.scene.add(ambientLight);
    }
        
    initControls = () => {
        this.sceneControl = new SpaceControls(this.camera, this.renderer);
        this.sceneControl.setKeyEvents();
        this.sceneControl.setLockEvents();
        this.scene.add(this.sceneControl.controls.getObject());
    }
    
    initTemplateScene = () => {
        this.setSceneBackground();
        this.addFloor();
    }

    setSceneBackground = () => {
        this.scene.background = new THREE.Color( 0xffffff );
        // const loader = new THREE.CubeTextureLoader();
        // if(!backgroundTexture){
        //     backgroundTexture = loader.load([
        //         './resources/background/px.png',
        //         './resources/background/nx.png',
        //         './resources/background/py.png',
        //         './resources/background/ny.png',
        //         './resources/background/pz.png',
        //         './resources/background/nz.png',
        //     ]);
        // }
    }

    addFloor = () => {
        // const planeGeometry = new THREE.PlaneGeometry( 100, 100 );
        // planeGeometry.rotateX( - Math.PI / 2 );
        // const planeMaterial = new THREE.ShadowMaterial( { color: 0x000000, opacity: 0.2 } );
    
        // const plane = new THREE.Mesh( planeGeometry, planeMaterial );
        // plane.position.y = - 200;
        // plane.receiveShadow = true;
        // scene.add( plane );
    
        const helper = new THREE.GridHelper( 200, 100 );
        helper.position.y = - 10;
        helper.material.opacity = 0.55;
        helper.material.transparent = true;
        this.floor = helper;
        this.scene.add( this.floor );
    }
    
}
