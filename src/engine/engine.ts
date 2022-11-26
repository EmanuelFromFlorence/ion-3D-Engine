import * as THREE from 'three';

import { Component } from '../core/components/component';
import { Entity } from '../core/entity';
import { System } from '../core/systems/system';
import { SpaceControls } from './control';
import { createWebGLRenderer, getCamera } from './graphics'


export class Engine{
    entityRegistry: any;
    systemRegistry: System[];
    renderer: any;
    camera: any;
    scene: THREE.Scene;
    control: any;
    canvas: HTMLCanvasElement;

    
    constructor(canvas: HTMLCanvasElement, scene: THREE.Scene = null, control: any = null, graphics = null){
        this.entityRegistry = {};
        this.systemRegistry = [];
        this.canvas = canvas;
        if (!graphics) {
            this.initGraphics(canvas);
        }
        this.setScene(scene);
        this.setControl(control);
    }


    public addEntity = (entity: Entity): any => {
        for (let [type, component] of entity.components.entries()){
            component.registerComponent({scene: this.scene});

            if (!this.entityRegistry.hasOwnProperty(type)) {
                this.entityRegistry[type] = {};
            }
            this.entityRegistry[type][entity.id] = entity; // overwriting if exists!!
        }
    }


    public addSystem = (system: System): any => {
        this.systemRegistry.push(system);
    }


    protected executeSystems = (): any => {
        for (let system of this.systemRegistry) {
            system.execute(this, this.entityRegistry);
        }
    }


    public start = (): any => {
        this.runEngine();
    }


    protected runEngine = (): any => {
        let prevTime = performance.now();
        const animate = () => {
            try{
                // requestAnimationFrame( animate );
                const time = performance.now();
                const delta = ( time - prevTime ) / 1000;
    
                // TODO::
                this.scene.updateMatrixWorld();
    
                this.executeSystems();
    
                /* Rendering */
                this.renderer.render( this.scene, this.camera );
                // TODO:
                // this.renderer.clearDepth(); // important!
                
                
                /* Controls */
                this.control.updateControl(delta);
    
                
                prevTime = time;
            }catch (err){
                this.renderer.setAnimationLoop( null );
                console.error('ION Engine Stopped.');
                console.error(err);
            }
        }
        // animate();
        this.renderer.setAnimationLoop( animate );
    }


    public initGraphics = (canvas: HTMLCanvasElement): any => {
        this.renderer = createWebGLRenderer(canvas);
        this.camera = getCamera(canvas.clientWidth / canvas.clientHeight);
        
        const onWindowResize = () => {
            const canvas = this.renderer.domElement;
            this.camera.aspect =  canvas.clientWidth / canvas.clientHeight; // window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize( canvas.clientWidth, canvas.clientHeight );
        }
    
        // https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event
        // Only handlers registered on the window object will receive resize events.
        this.renderer.domElement.addEventListener( 'resize', onWindowResize );
        // window.addEventListener( 'resize', onWindowResize );
    }


    public setScene = (scene: THREE.Scene): any => {
        if (!scene) {
            scene = this.createScene();
        }
        this.scene = scene;
    }

    
    public createScene = (): any => {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color( 0xffffff );
        return scene;
    }


    public setControl = (control: any): any => {
        if (!control) {
            control = this.createControl();
        }
        this.control = control;
        if (!this.scene) throw new Error('Scene must be initialized before setting control.');         
        
        this.camera = this.control.controls.getObject();
        this.scene.add(this.camera);
    }


    public createControl = (): any => {        
        const control = new SpaceControls(this.camera, this.renderer);
        control.setKeyEvents();
        control.setLockEvents();
        return control;
    }

}
