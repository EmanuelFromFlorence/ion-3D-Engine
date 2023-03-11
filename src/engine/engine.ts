import * as THREE from 'three';

import { Entity } from '../core/entity';
import { System } from '../core/systems/system';
import { ArcBallControls, FirstPersonControls, FlyieControls, SpaceControls } from './control/control';
import { createWebGLRenderer, getCamera } from './graphics'
import Stats from 'three/examples/jsm/libs/stats.module'
import { ArcBallControl, FirstPersonControl, FlyControl, SpaceControl, zIndex } from '../core/constants';
import { VRControls } from './control/vr-control';
import { getTemplateScene } from '../ion-3d-engine';
import { hideLoadingScreen, showLoadingScreen } from '../core/utils/utils';


export class Engine{
    canvas: HTMLCanvasElement;
    entityRegistry: any;
    systemRegistry: System[];
    renderer: any;
    camera: any;
    scene: THREE.Scene;
    control: any;
    controlOptions: {};
    vrEnabled: boolean;
    vrControl: any;
    stats: any;
    vrTeleMeshesToIntersect: any[];
    fps: number;
    prevTime: number;
    runtimeCallbacks: any[];
    

    constructor({
        canvas = null, 
        scene = null, 
        control = null, 
        controlOptions = {
            vrTeleportEnabled: false, 
            vrTeleportList: [], 
            framebufferScaleFactor: 2.0
        }, 
        vrEnabled = false, 
        graphicsOptions = {}, 
        fullScreen = true,
        stats = false,
        camera = null,
    } = {}){
        this.entityRegistry = {};
        this.systemRegistry = [];
        this.canvas = canvas;
        this.runtimeCallbacks = [];

        if (!canvas) throw new TypeError('No canvas element!');

        this.initGraphics(canvas, fullScreen, graphicsOptions, camera);
        
        this.setScene(scene);

        this.vrEnabled = vrEnabled;
        this.controlOptions = controlOptions;
        this.setControl(control);

        if (stats) {
            this.stats = Stats();
            this.stats.dom.style.zIndex = `${zIndex + 1}`;
            document.body.appendChild( this.stats.dom )
        }
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
            // TODO: detecting async system execution: myFunction.constructor.name === "AsyncFunction"
            system.execute(this, this.entityRegistry);
        }
    }


    public start = (): any => {
        this.runEngine();
    }


    protected runEngine = (): any => {
        let prevTime = performance.now();
        this.fps = 0;
        let fpsArr = [];
        const animate = () => {
            try {
                const time = performance.now();
                const delta = ( time - prevTime ) / 1000; // delta is in seconds
                fpsArr.push(1/delta);
                if (fpsArr.length>60) fpsArr = fpsArr.slice(1);
                this.fps = fpsArr.reduce((sum, x) => sum + x, 0)/fpsArr.length;
                
                // TODO::
                // this.scene.updateMatrixWorld();
    
                this.executeSystems();
    
                /* Rendering */
                this.renderer.render( this.scene, this.camera );
                // TODO:
                // this.renderer.clearDepth(); // important!
                
                /* Controls */
                if (this.control) this.control.updateControl(delta);
                if(this.vrEnabled ){ // this.renderer.xr.isPresenting
                    this.vrControl.updateControl(delta, this.controlOptions['vrTeleportList']);
                }

                if (this.stats) this.stats.update();

                this.runtimeCallbacks.forEach((runtimeCallback) => runtimeCallback());
                
                prevTime = time;
            } catch (err) {
                this.renderer.setAnimationLoop( null );
                console.error('ION Engine Stopped! Error:', err);
            }
        }
        this.renderer.setAnimationLoop( animate );
    }


    public initGraphics = (canvas: HTMLCanvasElement, fullScreen: boolean, graphicsOptions, camera): any => {
        
        this.renderer = createWebGLRenderer(canvas, graphicsOptions.shadowMapEnabled, graphicsOptions.shadowMapType, graphicsOptions.outputEncoding, graphicsOptions.toneMapping, graphicsOptions.physicallyCorrectLights);
        this.camera = camera || getCamera(canvas.offsetWidth / canvas.offsetHeight);
        

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
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';

            window.addEventListener('load', () => document.body.style.margin = '0');
            document.body.style.margin = '0';
            
            canvas.style.zIndex = `${zIndex}`;
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
        // const scene = new THREE.Scene();
        // scene.background = new THREE.Color( 0xffffff );
        const scene = getTemplateScene({
            type: 'ground_0',
            gridHelper: false,
            lights: true,
        });
        return scene;
    }


    public setRuntimeCallback = (cb: Function): any => {
        const runtimeCallback = function() {
            const context = this;
            const args = arguments;
            cb.apply(context, args);
        }
        this.runtimeCallbacks.push(runtimeCallback); 
    }


    public setControl = (control: any): any => {
        if (!this.scene) throw new Error('Scene must be initialized before setting control.');
        switch(control) {
            case SpaceControl:
                this.control = new SpaceControls(this.camera, this.renderer);
                this.control.setKeyEvents();
                this.control.setLockEvents();
                break;
            case FirstPersonControl:
                this.control = new FirstPersonControls(this.camera, this.scene);
                this.control.setKeyEvents();
                this.control.setLockEvents();
                break;
            case ArcBallControl:
                this.control = new ArcBallControls(this.camera, this.renderer, this.scene);
                break;
            case FlyControl:
                this.control = new FlyieControls(this.camera, this.renderer);
                break;
            default:
                if (control) {
                    this.control = control;
                    break;
                }
                this.control = new SpaceControls(this.camera, this.renderer);
                break;
        };

        if(this.vrEnabled){
            this.renderer.xr.enabled = true;
            this.renderer.xr.setFramebufferScaleFactor( this.controlOptions.framebufferScaleFactor ); //double xr resolution default is 1 and we set 2.0

            this.vrControl = new VRControls(this, this.scene, this.camera, this.renderer);
        }

    }


    public setVRTeleportList = (vrTeleportList: any[]): any => {
        this.controlOptions['vrTeleportList'] = vrTeleportList;
    }

}
