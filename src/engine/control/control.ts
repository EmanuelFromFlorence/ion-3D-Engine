import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { ArcballControls } from 'three/examples/jsm/controls/ArcballControls.js';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js';
import { TransformControls } from 'three/examples/jsm//controls/TransformControls.js';
import { OrbitControls } from 'three/examples/jsm//controls/OrbitControls.js';
import { createAimElement } from '../../core/utils/utils';
import { defaultPersonHeight } from '../../core/constants';


/* Integrated the FlyControls code with PointerLockControls */
// https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/FlyControls.js'

export class SpaceControls {
    camera: any;
    renderer: any;
    controls: PointerLockControls;
    movementSpeed: number;
    rollSpeed: number;
    dragToLook: boolean;
    autoForward: boolean;
    EPS: number;
    lastQuaternion: THREE.Quaternion;
    lastPosition: THREE.Vector3;
    tmpQuaternion: THREE.Quaternion;
    moveState: { up: number; down: number; left: number; right: number; forward: number; back: number; pitchUp: number; pitchDown: number; yawLeft: number; yawRight: number; rollLeft: number; rollRight: number; };
    moveVector: THREE.Vector3;
    rotationVector: THREE.Vector3;
    movementSpeedMultiplier: number;
    typingMode: boolean;

    constructor(camera, renderer){
        if (!camera) throw new TypeError('Camera object is not defined!');
        if (!renderer) throw new TypeError('Renderer object is not defined!');
        this.camera = camera;
        this.renderer = renderer;

        createAimElement();

        this.typingMode = false;
        
        this.controls = new PointerLockControls( this.camera, document.body );

        // API
		this.movementSpeed = 10;
		this.rollSpeed = 0.005;
		this.dragToLook = false;
		this.autoForward = false;

        // internals
        this.EPS = 0.000001;
		this.lastQuaternion = new THREE.Quaternion();
		this.lastPosition = new THREE.Vector3();
		this.tmpQuaternion = new THREE.Quaternion();

		this.moveState = { up: 0, down: 0, left: 0, right: 0, forward: 0, back: 0, pitchUp: 0, pitchDown: 0, yawLeft: 0, yawRight: 0, rollLeft: 0, rollRight: 0 };
		this.moveVector = new THREE.Vector3( 0, 0, 0 );
		this.rotationVector = new THREE.Vector3( 0, 0, 0 );
    }


	updateControl = ( delta ) => {        
        const moveMult = delta * this.movementSpeed;
        const rotMult = delta * this.rollSpeed;

        this.camera.translateX( this.moveVector.x * moveMult );
        this.camera.translateY( this.moveVector.y * moveMult );
        this.camera.translateZ( this.moveVector.z * moveMult );

        this.tmpQuaternion.set( this.rotationVector.x * rotMult, this.rotationVector.y * rotMult, this.rotationVector.z * rotMult, 1 ).normalize();
        this.camera.quaternion.multiply( this.tmpQuaternion );

        if (this.lastPosition.distanceToSquared( this.camera.position ) > this.EPS || 8 * ( 1 - this.lastQuaternion.dot( this.camera.quaternion ) ) > this.EPS) {
            this.lastQuaternion.copy( this.camera.quaternion );
            this.lastPosition.copy( this.camera.position );
        }

    }
    
    
    updateMovementVector = () => {
        const forward = ( this.moveState.forward || ( this.autoForward && ! this.moveState.back ) ) ? 1 : 0;
        this.moveVector.x = ( - this.moveState.left + this.moveState.right );
        this.moveVector.y = ( - this.moveState.down + this.moveState.up );
        this.moveVector.z = ( - forward + this.moveState.back );
        //console.log( 'move:', [ this.moveVector.x, this.moveVector.y, this.moveVector.z ] );
	}


    updateRotationVector = () => {
        this.rotationVector.x = ( - this.moveState.pitchDown + this.moveState.pitchUp );
        this.rotationVector.y = ( - this.moveState.yawRight + this.moveState.yawLeft );
        this.rotationVector.z = ( - this.moveState.rollRight + this.moveState.rollLeft );
        // Like rotating left is: [0, 0, 1] and right: [0, 0, -1]
        // console.log( 'rotate:', [ this.rotationVector.x, this.rotationVector.y, this.rotationVector.z ] );        
	}


    setLockEvents = () => {
        // const blocker = document.getElementById( 'blocker' );
        // const instructions = document.getElementById( 'instructions' );

        // instructions.addEventListener( 'click', () => { // converted function to arrow function so this is bound to the outer context which is Controls
        //     this.controls.lock();
        // } );

        document.body.addEventListener( 'click', () => {
            this.controls.lock();
        } );
    
        this.controls.addEventListener( 'lock', () => {
            
            // instructions.style.display = 'none';
            // blocker.style.display = 'none';

        } );
    
        this.controls.addEventListener( 'unlock', () => {
    
            // blocker.style.display = 'block';
            // instructions.style.display = '';

        } );
    }


    setKeyEvents = () => {        

        const onKeyDown = ( event ) => {
            if (this.typingMode) {
                return;
            }
            
            if ( event.altKey ) {
				return;
			}

			switch ( event.code ) {

				case 'ShiftLeft':
				case 'ShiftRight': this.movementSpeedMultiplier = .1; break;

				case 'KeyW': this.moveState.forward = 1; break;
				case 'KeyS': this.moveState.back = 1; break;

				case 'KeyA': this.moveState.left = 1; break;
				case 'KeyD': this.moveState.right = 1; break;

				case 'KeyR': this.moveState.up = 1; break;
				case 'KeyF': this.moveState.down = 1; break;

				case 'ArrowUp': this.moveState.pitchUp = 1; break;
				case 'ArrowDown': this.moveState.pitchDown = 1; break;

				case 'ArrowLeft': this.moveState.yawLeft = 1; break;
				case 'ArrowRight': this.moveState.yawRight = 1; break;

				case 'KeyQ': this.moveState.rollLeft = 1; break;
				case 'KeyE': this.moveState.rollRight = 1; break;

			}

			this.updateMovementVector();
            this.updateRotationVector();
        }
    
        const onKeyUp = ( event ) => {

            switch ( event.code ) {

				case 'ShiftLeft':
				case 'ShiftRight': this.movementSpeedMultiplier = 1; break;

				case 'KeyW': this.moveState.forward = 0; break;
				case 'KeyS': this.moveState.back = 0; break;

				case 'KeyA': this.moveState.left = 0; break;
				case 'KeyD': this.moveState.right = 0; break;

				case 'KeyR': this.moveState.up = 0; break;
				case 'KeyF': this.moveState.down = 0; break;

				case 'ArrowUp': this.moveState.pitchUp = 0; break;
				case 'ArrowDown': this.moveState.pitchDown = 0; break;

				case 'ArrowLeft': this.moveState.yawLeft = 0; break;
				case 'ArrowRight': this.moveState.yawRight = 0; break;

				case 'KeyQ': this.moveState.rollLeft = 0; break;
				case 'KeyE': this.moveState.rollRight = 0; break;

			}

			this.updateMovementVector();
            this.updateRotationVector();
        }

        document.addEventListener( 'keydown', onKeyDown );
        document.addEventListener( 'keyup', onKeyUp );
    }
}


export class FirstPersonControls {
    camera: any;
    scene: any;
    controls: any;
    moveForward: boolean;
    moveBackward: boolean;
    moveLeft: boolean;
    moveRight: boolean;
    canJump: boolean;
    velocity: any;
    direction: any;
    personHeight: number;
    speed: number;
    boundaryLimit: number;
    sceneMeshes: any[];
    sceneMeshesSet: Set<unknown>;
    raycaster: any;


    constructor(camera, scene){
        if (!camera) throw new TypeError('Camera object is not defined in FirstPersonControls!');
        if (!scene) throw new TypeError('Scene object is not defined in FirstPersonControls!');
        this.camera = camera;
        this.scene = scene;

        createAimElement();

        this.controls = new PointerLockControls( this.camera, document.body );

        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = false;

        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();

        this.personHeight = defaultPersonHeight;
        this.speed = 0.2;
        this.boundaryLimit = 2.5;

        this.sceneMeshes = [];
        this.sceneMeshesSet = new Set();

        const raycasterOrigin = this.camera.position;
        const raycasterDirection = new THREE.Vector3(0, - 1, 0);
        const near = 0;
        const far = 10;
        this.raycaster = new THREE.Raycaster(raycasterOrigin, raycasterDirection, near, far);
    }


    updateControl = (delta) => {
        let boundaryRaycaster = new THREE.Raycaster(this.camera.position, new THREE.Vector3(), 0.001, 10); //////
        
        if ( this.controls.isLocked === true ) {
            this.getSceneMeshes();
            

            /* x, z */
            // if you don't set this it will speedup indifinitely as the key is pressed....
            // this.velocity.x -= this.velocity.x * 100.0 * delta;
            // this.velocity.z -= this.velocity.z * 100.0 * delta;
            
            this.direction.z = Number( this.moveForward ) - Number( this.moveBackward );
            this.direction.x = Number( this.moveRight ) - Number( this.moveLeft );
            this.direction.normalize(); // this ensures consistent movements in all directions



            if ( this.moveForward){
                this.velocity.z = this.speed;
            
            } else if ( this.moveBackward){
                this.velocity.z = -this.speed;
            } else{
                this.velocity.z = 0;
            }

            if ( this.moveRight){
                this.velocity.x = this.speed * 0.6;
            
            } else if ( this.moveLeft){
                this.velocity.x = -this.speed * 0.6;
            } else{
                this.velocity.x = 0;
            }

    
            // if ( this.moveForward || this.moveBackward ) {
            //     this.velocity.z -= this.direction.z * 620.0 * delta;
            // }else {
            //     this.velocity.z = 0;
            // }

            // if ( this.moveLeft || this.moveRight ) {
            //     this.velocity.x -= this.direction.x * 620.0 * delta;
            // }else {
            //     this.velocity.x = 0;
            // }

            

            // this.controls.moveRight( - this.velocity.x * delta );
            // this.controls.moveForward( - this.velocity.z * delta );

            /////////// Bounding box solution:::::
            // https://stackoverflow.com/questions/35843564/prevent-objects-from-moving-outside-room-in-three-js


            let cameraDirection = new THREE.Vector3();
            cameraDirection = this.camera.getWorldDirection(cameraDirection);
            cameraDirection.normalize();
            cameraDirection.y = 0;

            
            let finalDirection = new THREE.Vector3(cameraDirection.x, cameraDirection.y-0.2, cameraDirection.z);  
            // console.log(this.direction);
            let x = this.direction.x;
            let y = this.direction.y;
            let z = this.direction.z;

            const quaternion = new THREE.Quaternion();

            if(x == 0 && z == 1){
                // no change just forward... finalDirection
            }else if(x == 0 && z == -1){
                finalDirection.applyQuaternion( quaternion.setFromAxisAngle( new THREE.Vector3(0,1,0), Math.PI ) );
            }else if(x == 1 && z == 0){
                finalDirection.applyQuaternion( quaternion.setFromAxisAngle( new THREE.Vector3(0,1,0), -Math.PI/2 ) );
            }else if(x == -1 && z == 0){
                finalDirection.applyQuaternion( quaternion.setFromAxisAngle( new THREE.Vector3(0,1,0), Math.PI/2 ) );
            }else if(Math.round(x*10) == 7 && Math.round(z*10) == 7){
                finalDirection.applyQuaternion( quaternion.setFromAxisAngle( new THREE.Vector3(0,1,0), - Math.PI/4 ) );
            }else if(Math.round(x*10) == 7 && Math.round(z*10) == -7){
                finalDirection.applyQuaternion( quaternion.setFromAxisAngle( new THREE.Vector3(0,1,0), - 3*Math.PI/4 ) );
            }else if(Math.round(x*10) == -7 && Math.round(z*10) == 7){
                finalDirection.applyQuaternion( quaternion.setFromAxisAngle( new THREE.Vector3(0,1,0), Math.PI/4 ) );
            }else if(Math.round(x*10) == -7 && Math.round(z*10) == -7){
                finalDirection.applyQuaternion( quaternion.setFromAxisAngle( new THREE.Vector3(0,1,0), 3*Math.PI/4 ) );
            }


            //////////////////////////////// Ring glow mesh is very large and if you should exclude it as a boundary to not cause problems
            this.toMoveOrNotToMove(delta, finalDirection, boundaryRaycaster, this.sceneMeshes);


            /* y */
            
            // this.raycaster.ray.origin.copy( this.controls.getObject().position );
            // this.raycaster.ray.origin.y -= this.personHeight;
            this.raycaster.ray.origin.copy( this.camera.position );
    

            // Intersections are returned sorted by distance, closest first.
            const intersections = this.raycaster.intersectObjects(this.sceneMeshes, false);
            if (typeof intersections != 'undefined' && intersections.length > 0){
                // console.log(intersections[0].point.y);
                this.controls.getObject().position.y = intersections[0].point.y + this.personHeight;
            }else{
                this.controls.getObject().position.set(0,4,0);
            }


            /* to not fall down in this method +++++++++++++++ keep this for now +++++++++++++++ */
            // let cameraDirection = new THREE.Vector3();
            // let fallingRaycaster = new THREE.Raycaster(this.camera.position, cameraDirection, 0, this.personHeight * Math.sqrt(2) + 1);
    
            // cameraDirection = this.camera.getWorldDirection(cameraDirection);
            // cameraDirection.normalize();
            // cameraDirection.y = -2; ////////
            // fallingRaycaster.ray.origin.copy( this.camera.position );
            // fallingRaycaster.ray.direction.copy( cameraDirection );
            
            // const fallingIntersections = fallingRaycaster.intersectObjects(this.sceneMeshes, false);
            // console.log(fallingIntersections);
            // if (typeof fallingIntersections != undefined){
            //     if(fallingIntersections.length > 0){

            //         this.controls.moveRight( - this.velocity.x * delta );
            //         this.controls.moveForward( - this.velocity.z * delta );

            //     }
            // }

            // // this.direction.angleTo(new THREE.Vector3(0, -1, 0))
        }
    }


    getSceneMeshes = () => {
        this.scene.traverse((child) => {
            // console.log(child);
            if(child.isMesh){
                if(!this.sceneMeshesSet.has(child.name)){
                    this.sceneMeshes.push(child);
                    this.sceneMeshesSet.add(child.name);    
                }
            }
        });
    }


    toMoveOrNotToMove = (delta, direction, boundaryRaycaster, sceneMeshes) => {
        boundaryRaycaster.ray.origin.copy( this.camera.position );
        boundaryRaycaster.ray.direction.copy( direction ); 
        const boundaryIntersections = boundaryRaycaster.intersectObjects(sceneMeshes, false);
        if (boundaryIntersections.length > 0){
            if(boundaryIntersections[0].distance < this.boundaryLimit){
                // console.log(boundaryIntersections[0]);
            }else{
                this.controls.moveRight(this.velocity.x);
                this.controls.moveForward(this.velocity.z );
            }
        }else{
            this.controls.moveRight(this.velocity.x );
            this.controls.moveForward(this.velocity.z );
        }
    }


    setLockEvents = () => {
        // const blocker = document.getElementById( 'blocker' );
        // const instructions = document.getElementById( 'instructions' );

        document.body.addEventListener( 'click', () => {
            this.controls.lock();
        } );
        
        // blocker.addEventListener( 'click', () => {
        //     this.controls.lock();
        // } );
    
        this.controls.addEventListener( 'lock', () => {
            // instructions.style.display = 'none';
            // blocker.style.display = 'none';

            // const social = document.getElementById( 'socialContainer' );
            // social.style.display = 'none';

            // const col = document.getElementsByClassName( 'aim' );
            // col[0].style.display = 'block';

        } );
    
        this.controls.addEventListener( 'unlock', () => {
            // blocker.style.display = 'block';
            // instructions.style.display = 'flex';

            // const social = document.getElementById( 'socialContainer' );
            // social.style.display = 'block';

            // const col = document.getElementsByClassName( 'aim' );
            // col[0].style.display = 'none';
        } );
    }


    setKeyEvents = () => {
        const onKeyDown = ( event ) => {
            switch ( event.code ) {
                case 'ArrowUp':
                case 'KeyW':
                    this.moveForward = true;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    this.moveLeft = true;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.moveBackward = true;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.moveRight = true;
                    break;
                // case 'Space':
                //     if ( this.canJump === true ) this.velocity.y += 100;
                //     this.canJump = false;
                //     break;
            }
        };
    
        const onKeyUp = ( event ) => {
            switch ( event.code ) {
                case 'ArrowUp':
                case 'KeyW':
                    this.moveForward = false;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    this.moveLeft = false;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.moveBackward = false;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.moveRight = false;
                    break;
            }
        };

        document.addEventListener( 'keydown', onKeyDown );
        document.addEventListener( 'keyup', onKeyUp );
    }
}




export class ArcBallControls {
    camera: any;
    scene: any;
    controls: any;

    constructor(camera, renderer, scene){
        if (!camera) throw new TypeError('Camera object is not defined in ArcBallControls!');
        if (!renderer) throw new TypeError('Renderer object is not defined in ArcBallControls!');
        if (!scene) throw new TypeError('Scene object is not defined in ArcBallControls!');
        this.camera = camera;
        this.scene = scene;
        
        this.controls = new ArcballControls( camera, renderer.domElement, scene );

        // TODO: should test this:
        this.controls.addEventListener('change', () => {
            renderer.render(scene, camera);
        });

        // https://threejs.org/docs/#examples/en/controls/ArcballControls
        this.controls.enabled = true;
        this.controls.enableGrid = false;
        this.controls.enableRotate;
        this.controls.enablePan;
        this.controls.enableZoom;
        this.controls.cursorZoom;
        this.controls.adjustNearFar;
        this.controls.scaleFactor;
        this.controls.minDistance;
        this.controls.maxDistance;
        this.controls.minZoom;
        this.controls.maxZoom;
        this.controls.gizmoVisible; // = true
        this.controls.enableAnimations;
        this.controls.dampingFactor;
        this.controls.wMax;

        this.controls.setGizmosVisible(false);
    }

    updateControl = (delta) => {
        this.controls.update();
    }
}


export class FlyieControls {
    camera: any;
    scene: any;
    controls: any;

    constructor(camera, renderer){
        if (!camera) throw new TypeError('Camera object is not defined in FlyieControls!');
        if (!renderer) throw new TypeError('Renderer object is not defined in FlyieControls!');
        this.camera = camera;
        
        this.controls = new FlyControls( camera, renderer.domElement );

        this.controls.movementSpeed = 1000;
        this.controls.domElement = renderer.domElement;
        this.controls.rollSpeed = Math.PI / 24;
        this.controls.autoForward = false;
        this.controls.dragToLook = false;
    }

    updateControl = (delta) => {
        // https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_fly.html
        // this.controls.movementSpeed = 0.33 * d;
        this.controls.update(delta);
    }
}

