import * as THREE from 'three';

import { Entity } from '../core/entity';
import { System } from '../core/systems/system';
import { ArcBallControls, FirstPersonControls, FlyieControls, SpaceControls } from './control/control';
import { createWebGLRenderer, getCamera } from './graphics'
import { ArcBallControl, FirstPersonControl, FlyControl, SpaceControl, zIndex } from '../core/constants';
import { VRControls } from './control/vr-control';
import { getTemplateScene } from '../ion-3d-engine';
import { hideLoadingScreen, showLoadingScreen } from '../core/utils/utils';
import { isInstanceOfElement } from '../gui/utils';
import { createEngineStats, updateEngineStats } from './utils';


export class Engine{
    canvas: HTMLCanvasElement;
    entityRegistry: any;
    systemRegistry: System[];
    renderer: THREE.Renderer;
    camera: THREE.Camera;
    scene: THREE.Scene;
    control: any;
    controlOptions: {};
    vrEnabled: boolean;
    vrControl: any;
    engineStats: object;
    stats: any;
    fps: number;
    prevTime: number;
    runtimeCallbacks: any[];
    statsOptions: { stats3D: boolean; };
    

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
        statsOptions = {
            stats3D: false,
        },
        camera = null,
    } = {}){
        this.entityRegistry = {};
        this.systemRegistry = [];
        this.canvas = canvas;
        this.runtimeCallbacks = [];

        if (!canvas || !isInstanceOfElement(canvas, HTMLCanvasElement)) throw new TypeError('No valid canvas element!');

        this.initGraphics(canvas, fullScreen, graphicsOptions, camera);
        
        this.setScene(scene);

        this.vrEnabled = vrEnabled;
        this.controlOptions = controlOptions;
        this.setControl(control);
        
        this.stats = stats;
        this.statsOptions = statsOptions;
        if (stats) this.engineStats = createEngineStats(this);
    }


    public addEntity = (entity: Entity): void => {
        for (let [compType, component] of Object.entries(entity.components)){
            component.registerComponent({scene: this.scene});

            // Adding gui components so ignores it when tryingt o teleport in VR mode...
            if (compType.includes('gui')) this.controlOptions['vrTeleportList'].push(component);

            if (!this.entityRegistry.hasOwnProperty(compType)) {
                this.entityRegistry[compType] = {};
            }
            this.entityRegistry[compType][entity.id] = entity; // overwriting if exists!!
        }
    }


    public addSystem = (system: System): void => {
        this.systemRegistry.push(system);
    }


    protected executeSystems = (): any => {
        for (let system of this.systemRegistry) {
            // TODO: detecting async system execution: myFunction.constructor.name === "AsyncFunction"
            system.execute(this, this.entityRegistry);
        }
    }


    public start = (): void => {
        this.runEngine();
    }


    protected runEngine = (): void => {
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

                // Has to precede other operations
                this.runtimeCallbacks.forEach((runtimeCallback) => runtimeCallback());
                
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

                if(this.stats) updateEngineStats(this);
                
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


    public setScene = (scene: THREE.Scene): void => {
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


    public setRuntimeCallback = (cb: Function): void => {
        const runtimeCallback = function() {
            const context = this;
            const args = arguments;
            cb.apply(context, args);
        }
        this.runtimeCallbacks.push(runtimeCallback); 
    }


    public setControl = (control: any): void => {
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


    public setVRTeleportList = (vrTeleportList: THREE.Mesh[]): void => {
        this.controlOptions['vrTeleportList'] = vrTeleportList;
    }

}
