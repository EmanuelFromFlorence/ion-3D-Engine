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

    
    constructor({canvas = null, scene = null, control = null, graphics = null, fullScreen = false} = {}){
        this.entityRegistry = {};
        this.systemRegistry = [];
        this.canvas = canvas;
        if (!graphics) {
            this.initGraphics(canvas, fullScreen);
        }
        this.setScene(scene);
        this.setControl(control);
    }


    public addEntity = (entity: Entity): any => {
        for (let [type, component] of Object.entries(entity.components)){
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


    public initGraphics = (canvas: HTMLCanvasElement, fullScreen: boolean): any => {
        

        this.renderer = createWebGLRenderer(canvas);
        this.camera = getCamera(canvas.offsetWidth / canvas.offsetHeight);
        
        // const onCanvasResize = () => {
        //     console.log('In onCanvasResize');
            
        //     const canvas = this.renderer.domElement;
        //     let width = canvas.getBoundingClientRect().width;
        //     let height = canvas.getBoundingClientRect().height;
            
        //     this.camera.aspect =  width / height; // window.innerWidth / window.innerHeight;
        //     this.camera.updateProjectionMatrix();
        //     this.renderer.setSize( width, height );
        // }
    
        // https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event
        // Only handlers registered on the window object will receive resize events.
        // this.renderer.domElement.addEventListener( 'resize', onCanvasResize );
        // This one for later: new ResizeObserver(onCanvasResize).observe(canvas);
        
        if (fullScreen) {
            canvas.style.zIndex = '100000';
            canvas.style.position = 'fixed';
            canvas.style.display = 'block';
            canvas.style.width = `${window.innerWidth}px`; // '100%';
            canvas.style.height = `${window.innerHeight}px`; // '100%';
            canvas.style.minHeight = '100%'; 
            canvas.style.minWidth = '100%'; 
            canvas.style.margin = '0';
            const onWindowResize = () => {
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize( window.innerWidth, window.innerHeight );
            }
            window.addEventListener( 'resize', onWindowResize );
            onWindowResize();
        }
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
