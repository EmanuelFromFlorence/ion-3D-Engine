import * as THREE from 'three';
import { SpaceControls } from '../engine/control';


interface NamedParameters {
}


export class GUIScene extends THREE.Scene{
    scene: any;
    sceneControl: SpaceControls;
    canvas: HTMLElement;


    constructor({}: NamedParameters){
        super();
        
        this.initMainLights();
        this.initControls();
        this.initTemplateScene();
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
        this.scene.add( helper );
    }
    
}
