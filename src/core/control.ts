import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';


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

    constructor(camera, renderer){
        this.camera = camera;
        this.renderer = renderer;        
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