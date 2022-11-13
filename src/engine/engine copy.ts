import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';


import { Component } from '../core/components/component';
import { Entity } from '../core/entity';
import { System } from '../core/systems/system';
import { SpaceControls } from './control';
import { createWebGLRenderer, getCamera } from './graphics'


export class Engine{
    vrTeleIntersectPoint: any;
    entityRegistry: any;
    systemRegistry: System[];
    renderer: any;
    camera: any;
    scene: THREE.Scene;
    control: any;
    VRButtonElm: any;
    vrBaseReferenceSpace: any;
    controller1: any;
    controller2: any;
    controllerGrip1: any;
    controllerGrip2: any;
    vrRaycaster: any;
    teleMarkerMesh: any;
    vrTeleIntersections: any[];
    tempMatrix: any;
    vrTeleObjects: any[];
    vrSelectIntersects: any;
    twitterLinkElm: any;
    openseaLinkElm: any;
    discordLinkElm: any;

    
    constructor(canvas: HTMLCanvasElement, scene: THREE.Scene = null, control: any = null, graphics = null){
        this.entityRegistry = {};
        this.systemRegistry = [];
        if (!graphics) {
            this.initGraphics(canvas);
        }
        this.setScene(scene);
        this.setControl(control);

        this.vrTeleIntersections = [];
        this.vrTeleIntersectPoint = null;
        this.vrBaseReferenceSpace = null;
        this.tempMatrix = new THREE.Matrix4();
        this.vrTeleObjects = []; // Objects to intersect and move around
        // this.vrSelectObjects = []; // Objects to intersect and click

        this.initWebXR();
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
            system.execute(this.entityRegistry);
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
                console.error('Engine Stopped.');
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


    initWebXR = () => {

        /* WebXR */
        this.VRButtonElm = VRButton.createButton( this.renderer );
        // document.body.appendChild( this.VRButtonElm );
        const aim = document.getElementsByClassName( 'aim' )[0];
        aim.after(this.VRButtonElm);

        this.renderer.xr.enabled = true;
        this.renderer.xr.addEventListener( 'sessionstart', () => this.vrBaseReferenceSpace = this.renderer.xr.getReferenceSpace() )


        /* Controllers: */
        this.controller1 = this.renderer.xr.getController( 0 );
        this.controller1.addEventListener( 'selectstart', () => {this.onSelectStart('1')} );
        this.controller1.addEventListener( 'selectend', () => {this.onSelectEnd('1')} );
        this.controller1.addEventListener( 'connected', ( event ) => {

            this.controller1.add( this.buildController( event.data ) );
    
        } );
        this.controller1.addEventListener( 'disconnected', () => {
    
            this.controller1.remove( this.controller1.children[ 0 ] );
    
        } );
        this.scene.add( this.controller1 );

        this.controller2 = this.renderer.xr.getController( 1 );
        this.controller2.addEventListener( 'selectstart', () => {this.onSelectStart('2')} );
        this.controller2.addEventListener( 'selectend', () => {this.onSelectEnd('2')} );
        this.controller2.addEventListener( 'connected', ( event ) => {

            this.controller2.add( this.buildController( event.data ) );
    
        } );
        this.controller2.addEventListener( 'disconnected', () => {
    
            this.controller2.remove( this.controller2.children[ 0 ] );
    
        } );
        this.scene.add( this.controller2 );

        const controllerModelFactory = new XRControllerModelFactory();

        this.controllerGrip1 = this.renderer.xr.getControllerGrip( 0 );
        this.controllerGrip1.add( controllerModelFactory.createControllerModel( this.controllerGrip1 ) );
        this.scene.add( this.controllerGrip1 );

        this.controllerGrip2 = this.renderer.xr.getControllerGrip( 1 );
        this.controllerGrip2.add( controllerModelFactory.createControllerModel( this.controllerGrip2 ) );
        this.scene.add( this.controllerGrip2 );




        const geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] );

        const line = new THREE.Line( geometry );
        line.name = 'line';
        line.scale.z = 5;

        this.controller1.add( line.clone() );
        this.controller2.add( line.clone() );


        this.vrRaycaster = new THREE.Raycaster();



        /* teleMarkerMesh */
        this.teleMarkerMesh = new THREE.Mesh(
            new THREE.CircleGeometry( 0.25, 32 ).rotateX( - Math.PI / 2 ),
            new THREE.MeshBasicMaterial( { color: 0x808080 } )
        );
        this.scene.add( this.teleMarkerMesh );


        
        // let vrButton = document.getElementById('VRButton');
        // vrButton.addEventListener('click', () => {
        //     setTimeout(() => this.mzContainer.appendChild( this.renderer.domElement ), 3000);
        //     // this.mzContainer.appendChild( this.renderer.domElement );
        // });

    }

    onSelectStart = (controllerNum) => {
        if(controllerNum === '1') this.controller1.userData.isSelecting = true;
        if(controllerNum === '2') this.controller2.userData.isSelecting = true;
    }
    

    onSelectEnd = (controllerNum) => {
        
        // let doMove = true;

        // // If selecting buttons don't move...
        // if (this.vrSelectIntersects.length > 0){
        //     // console.log(this.vrSelectIntersects);
        //     if (this.vrSelectIntersects[0].object.name.includes('boundary')){ 
        //         return;
        //     }

        //     if (this.vrSelectIntersects[0].object.name.includes('Cube009')){  // next_btn
        //         this.flipExBoard();
        //         doMove = false;
        //     } else if (this.vrSelectIntersects[0].object.name.includes('Plane005')){  // pre_btn
        //         this.flipExBoard();
        //         doMove = false;
        //     }else if (this.vrSelectIntersects[0].object.name.includes('twitter')){  
        //         doMove = false;
        //         window.open(this.twitterLinkElm.getAttribute('src'), "_blank");
        //         this.showUIMessage('Twitter link oponed in a new browser tab...');
        //     }else if (this.vrSelectIntersects[0].object.name.includes('opensea')){  
        //         doMove = false;
        //         window.open(this.openseaLinkElm.getAttribute('src'), "_blank");
        //         this.showUIMessage('Opensea link oponed in a new browser tab...');
        //     }else if (this.vrSelectIntersects[0].object.name.includes('Skin_~BrushAlpha8_Skin_')){  // discord
        //         doMove = false;
        //         window.open(this.discordLinkElm.getAttribute('src'), "_blank");
        //         this.showUIMessage('Discord link oponed in a new browser tab...');
        //     }

        // }



        // if(controllerNum === '1') this.controller1.userData.isSelecting = false;
        // if(controllerNum === '2') {
        //     this.controller2.userData.isSelecting = false;
        //     // alert(controllerNum);
        // }
        // if ( this.vrTeleIntersectPoint && doMove) {
        //     // console.log(this.vrTeleIntersectPoint);

        //     const offsetPosition = { x: - this.vrTeleIntersectPoint.x, y: - this.vrTeleIntersectPoint.y - 1.9, z: - this.vrTeleIntersectPoint.z, w: 1 };
        //     const offsetRotation = new THREE.Quaternion();
        //     const transform = new XRRigidTransform( offsetPosition, offsetRotation );
        //     const teleportSpaceOffset = this.vrBaseReferenceSpace.getOffsetReferenceSpace( transform );
            
        //     this.renderer.xr.setReferenceSpace( teleportSpaceOffset );
        // }


        


    }

    // getVRHeight = () => {
    //     const raycaster = new THREE.Raycaster();

    //     // this.raycaster.ray.origin.copy( this.camera.position );
        

    //     // Intersections are returned sorted by distance, closest first.
    //     const intersections = this.raycaster.intersectObjects(this.sceneMeshes, false);
    //     if (typeof intersections != 'undefined' && intersections.length > 0){
    //         // console.log(intersections[0].point.y);
    //         this.controls.getObject().position.y = intersections[0].point.y + this.personHeight;
    //     }else{
    //         this.controls.getObject().position.set(0,4,0);
    //     }
    // }


    buildController = ( data ) => {

        let geometry, material;
    
        switch ( data.targetRayMode ) {
    
            case 'tracked-pointer':
    
                geometry = new THREE.BufferGeometry();
                geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0, 0, 0, - 1 ], 3 ) );
                geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( [ 0.5, 0.5, 0.5, 0, 0, 0 ], 3 ) );
    
                material = new THREE.LineBasicMaterial( { vertexColors: true, blending: THREE.AdditiveBlending } );
    
                return new THREE.Line( geometry, material );
    
            case 'gaze':
    
                geometry = new THREE.RingGeometry( 0.02, 0.04, 32 ).translate( 0, 0, - 1 );
                material = new THREE.MeshBasicMaterial( { opacity: 0.5, transparent: true } );
                return new THREE.Mesh( geometry, material );

        }
    
    }


    updateVRTeleport = () => {
        this.vrTeleIntersectPoint = undefined;

        if ( this.controller1.userData.isSelecting === true ) {
    
            this.tempMatrix.identity().extractRotation( this.controller1.matrixWorld );
    
            this.vrRaycaster.ray.origin.setFromMatrixPosition( this.controller1.matrixWorld );
            this.vrRaycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( this.tempMatrix );
            
            const intersects = this.vrRaycaster.intersectObjects( this.vrTeleObjects );
            
            ////////////////////////////////////////////////////////////////////////////// this.vrSelectIntersects = this.vrRaycaster.intersectObjects( this.sceneMeshes );
            
            if ( intersects.length > 0 ) {
    
                this.vrTeleIntersectPoint = intersects[ 0 ].point;
    
            }
    
        } else if ( this.controller2.userData.isSelecting === true ) {
    
            this.tempMatrix.identity().extractRotation( this.controller2.matrixWorld );
    
            this.vrRaycaster.ray.origin.setFromMatrixPosition( this.controller2.matrixWorld );
            this.vrRaycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( this.tempMatrix );
    
            const intersects = this.vrRaycaster.intersectObjects( this.vrTeleObjects );

            ////////////////////////////////////////////////////////////////////////////// this.vrSelectIntersects = this.vrRaycaster.intersectObjects( this.sceneMeshes );
    
            if ( intersects.length > 0 ) {
    
                this.vrTeleIntersectPoint = intersects[ 0 ].point;
    
            }
    
        }
    
        if ( this.vrTeleIntersectPoint ) this.teleMarkerMesh.position.copy( this.vrTeleIntersectPoint );
    
        this.teleMarkerMesh.visible = this.vrTeleIntersectPoint !== undefined;

    }

}
