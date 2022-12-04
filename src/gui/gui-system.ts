import * as THREE from 'three';
import { System } from '../core/systems/system';
import * as htmlToImage from 'html-to-image';
import { createImage, GUI_COMPONENT_TYPE, isRadioCheckBox, isTextBox } from './utils';
import { Entity } from '../core/entity';
import { bindCSSEvents, dispatchMouseEvent } from './gui-event-binder';
import { Engine } from '../ion-3d-engine';


interface NamedParameters {
}


export class GUISystem extends System{
    aimRaycaster: any;
    engine: Engine;
    downEventHandled: boolean;
    upEventSent: boolean;
    clickEventHandled: boolean;
    focusedElement: any;
    boundEvents: boolean;

    aimingGuiComponent: any;
    aimingHTMLElement: any;
    aimX: number;
    aimY: number;
    aimingGuiComponentVR11: any;
    aimingHTMLElementVR11: any;
    aimXVR11: number;
    aimYVR11: number;
    aimingGuiComponentVR22: any;
    aimingHTMLElementVR22: any;
    aimXVR22: number;
    aimYVR22: number;


    constructor(){ // {}: NamedParameters
        super();

        this.engine = null;
        this.aimingGuiComponent = null;
        this.aimX = null;
        this.aimY = null;
        this.aimingHTMLElement = null;
        this.boundEvents = false;
        this.initUIEvents();
        this.initRaycaster();
    }


    public initRaycaster = () => {
        const raycasterOrigin = new THREE.Vector3(0, 0, 0);
        const raycasterDirection = new THREE.Vector3(0, - 2, 0);
        const near = 0;
        const far = 200;
        this.aimRaycaster = new THREE.Raycaster(raycasterOrigin, raycasterDirection, near, far);
    }

    
    public initUIEvents = () => {
        bindCSSEvents();
    }


    public execute = (engine: Engine, entityRegistry: any) => {
        this.engine = engine;
        if (!this.boundEvents){
            this.bindClickEvents(); // needs this.engine
        }
        
        let meshesToIntersect = [];

        for (let [entityId, entity] of Object.entries(entityRegistry[GUI_COMPONENT_TYPE])) { // {entityId: String, entity: Entity}
            let component = entity.getComponent(GUI_COMPONENT_TYPE);

            // More options:: https://github.com/bubkoo/html-to-image
            htmlToImage.toSvg(component.rootElement, { filter: component.htmlFilter })
            .then(async (svgDataUrl) => {
                const img = await createImage(svgDataUrl);


                component.htmlTexture.dispose();
                // component.material.map.dispose();

                component.htmlTexture = new THREE.Texture();
                // component.htmlTexture.needsUpdate = true;
                // component.htmlTexture.generateMipmaps = false;

                component.htmlTexture.image = img;

                // needsUpdate should be set after setting the image -> Error: Texture marked for update but no image data found.
                // Only this worked, needsUpdate values are getting overwritten
                if(!component.htmlTexture.needsUpdate || !component.material.needsUpdate){
                    component.htmlTexture.needsUpdate = true;
                    component.material.needsUpdate = true;
                }

                component.material.map = component.htmlTexture;
                component.material.alphaMap = component.htmlTexture;

                // Example of creating texture and setting texture props:::
                // https://github.com/mrdoob/three.js/blob/dev/src/renderers/WebGLRenderTarget.js

                // Note: After the initial use of a texture, its dimensions, format, and type cannot be changed. Instead, 
                // call .dispose() on the texture and instantiate a new one.
                // There is material.dispose() too...

            });
                
            // In case going with DataTexture and creating our own canvas:
            // https://dustinpfister.github.io/2022/04/15/threejs-data-texture/
            // const width = 32, height = 32;
            // const size = width * height;
            // const data = new Uint8Array( 4 * size );
            // const texture = new THREE.DataTexture( data, width, height );
            // texture.needsUpdate = true;

            meshesToIntersect.push(component);
        }


        if(engine.vrEnabled && engine.renderer.xr.isPresenting) {
            this.updateVRAim(meshesToIntersect);
        }else {
            this.updateAim(meshesToIntersect);
        }
    }


    public updateVRAim = (meshesToIntersect) => {
        
        if (this.engine.vrControl.controller1Connected) {
            const near = 0;
            const far = 200;
            let controller1Raycaster = new THREE.Raycaster(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), near, far);

            this.engine.vrControl.tempMatrix.identity().extractRotation( this.engine.vrControl.controller1.matrixWorld );
            controller1Raycaster.ray.origin.setFromMatrixPosition( this.engine.vrControl.controller1.matrixWorld );
            controller1Raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( this.engine.vrControl.tempMatrix );
    
            let controller1Intersections = [];
            controller1Intersections = controller1Raycaster.intersectObjects(meshesToIntersect, false);

            if (controller1Intersections.length > 0){
                let newAimingGuiComponent = controller1Intersections[0].object;
                let pointerVector2 = controller1Intersections[0].uv;
    
                this.processAimEvents('controller1', newAimingGuiComponent, pointerVector2, meshesToIntersect);
            }else {
                this.clearAimEvents('controller1');
            }
        }

        if (this.engine.vrControl.controller2Connected) {
            const near = 0;
            const far = 200;
            let controller2Raycaster = new THREE.Raycaster(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), near, far);
            this.engine.vrControl.tempMatrix.identity().extractRotation( this.engine.vrControl.controller2.matrixWorld );
            controller2Raycaster.ray.origin.setFromMatrixPosition( this.engine.vrControl.controller2.matrixWorld );
            controller2Raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( this.engine.vrControl.tempMatrix );
            
            let controller2Intersections = [];
            controller2Intersections = controller2Raycaster.intersectObjects(meshesToIntersect, false);

            if (controller2Intersections.length > 0){
                let newAimingGuiComponent = controller2Intersections[0].object;
                let pointerVector2 = controller2Intersections[0].uv;
    
                this.processAimEvents('controller2', newAimingGuiComponent, pointerVector2, meshesToIntersect);
            }else {
                this.clearAimEvents('controller2');
            }
        }
    }


    public updateAim = (meshesToIntersect) => {
        if (!this.engine.control.controls.isLocked) {
            return;
        }

        let cameraDirection = new THREE.Vector3();
        cameraDirection = this.engine.camera.getWorldDirection(cameraDirection);
        cameraDirection.normalize();
        this.aimRaycaster.ray.origin.copy( this.engine.camera.position );
        this.aimRaycaster.ray.direction.copy( cameraDirection ); 
        
        let intersections = [];
        intersections = this.aimRaycaster.intersectObjects(meshesToIntersect, false);

        if (intersections.length > 0){

            let newAimingGuiComponent = intersections[0].object;
            let pointerVector2 = intersections[0].uv;

            this.processAimEvents('hamster', newAimingGuiComponent, pointerVector2, meshesToIntersect);

        }else {
            this.clearAimEvents('hamster');
        }
    }


    public processAimEvents = (aimType, newAimingGuiComponent, pointerVector2, meshesToIntersect) => {
        
        if (aimType === 'hamster'){
            this.aimingGuiComponent = newAimingGuiComponent;

            this.aimX = pointerVector2.x * this.aimingGuiComponent.rootElement.offsetWidth;
            this.aimY = (1 - pointerVector2.y) * this.aimingGuiComponent.rootElement.offsetHeight;
    
            let newAimingHTMLElement = this.getAimingElement(this.aimX, this.aimY, meshesToIntersect, this.aimingGuiComponent);
            if(this.aimingHTMLElement && newAimingHTMLElement instanceof HTMLElement && !newAimingHTMLElement.isSameNode(this.aimingHTMLElement)) {
                dispatchMouseEvent(this.aimingHTMLElement, 'mouseout', this.aimX, this.aimY);
            }
            this.aimingHTMLElement = newAimingHTMLElement;
            if(this.aimingHTMLElement && newAimingHTMLElement instanceof HTMLElement){
                dispatchMouseEvent(this.aimingHTMLElement, 'mouseover', this.aimX, this.aimY);
            }
        }

        if (aimType === 'controller1'){
            this.aimingGuiComponentVR11 = newAimingGuiComponent;
            this.aimXVR11 = pointerVector2.x * this.aimingGuiComponentVR11.rootElement.offsetWidth;
            this.aimYVR11 = (1 - pointerVector2.y) * this.aimingGuiComponentVR11.rootElement.offsetHeight;
            
            let newAimingHTMLElement = this.getAimingElement(this.aimXVR11, this.aimYVR11, meshesToIntersect, this.aimingGuiComponentVR11);
            if(this.aimingHTMLElementVR11 && newAimingHTMLElement instanceof HTMLElement && !newAimingHTMLElement.isSameNode(this.aimingHTMLElementVR11)) {
                dispatchMouseEvent(this.aimingHTMLElementVR11, 'mouseout', this.aimXVR11, this.aimYVR11);
            }
            this.aimingHTMLElementVR11 = newAimingHTMLElement;
            if(this.aimingHTMLElementVR11 && newAimingHTMLElement instanceof HTMLElement){
                dispatchMouseEvent(this.aimingHTMLElementVR11, 'mouseover', this.aimXVR11, this.aimYVR11);
            }
        }

        if (aimType === 'controller2'){
            this.aimingGuiComponentVR22 = newAimingGuiComponent;

            this.aimXVR22 = pointerVector2.x * this.aimingGuiComponentVR22.rootElement.offsetWidth;
            this.aimYVR22 = (1 - pointerVector2.y) * this.aimingGuiComponentVR22.rootElement.offsetHeight;
    
            let newAimingHTMLElement = this.getAimingElement(this.aimXVR22, this.aimYVR22, meshesToIntersect, this.aimingGuiComponentVR22);
            if(this.aimingHTMLElementVR22 && newAimingHTMLElement instanceof HTMLElement && !newAimingHTMLElement.isSameNode(this.aimingHTMLElementVR22)) {
                dispatchMouseEvent(this.aimingHTMLElementVR22, 'mouseout', this.aimXVR22, this.aimYVR22);
            }
            this.aimingHTMLElementVR22 = newAimingHTMLElement;
            if(this.aimingHTMLElementVR22 && newAimingHTMLElement instanceof HTMLElement){
                dispatchMouseEvent(this.aimingHTMLElementVR22, 'mouseover', this.aimXVR22, this.aimYVR22);
            }
        }
    }


    public clearAimEvents = (aimType) => {
        if (aimType === 'hamster'){
            if (this.aimingHTMLElement) dispatchMouseEvent(this.aimingHTMLElement, 'mouseout', this.aimX, this.aimY);
            this.aimingGuiComponent = null;
            this.aimX = null;
            this.aimY = null;
            this.aimingHTMLElement = null;
        }

        if (aimType === 'controller1'){
            if (this.aimingHTMLElementVR11) dispatchMouseEvent(this.aimingHTMLElementVR11, 'mouseout', this.aimXVR11, this.aimYVR11);
            this.aimingGuiComponentVR11 = null;
            this.aimXVR11 = null;
            this.aimYVR11 = null;
            this.aimingHTMLElementVR11 = null;
        }
        
        if (aimType === 'controller2'){
            if (this.aimingHTMLElementVR22) dispatchMouseEvent(this.aimingHTMLElementVR22, 'mouseout', this.aimXVR22, this.aimYVR22);
            this.aimingGuiComponentVR22 = null;
            this.aimXVR22 = null;
            this.aimYVR22 = null;
            this.aimingHTMLElementVR22 = null;
        }
    }


    // A elementsFromPoint shim: https://gist.github.com/oslego/7265412
    public getAimingElement = (x, y, meshesToIntersect, aimingGuiComponent) => {
        let aimingElm = null;
        this.engine.canvas.style.setProperty('pointer-events', 'none', 'important');

        // Skipping the canvas div wrapper in VR Mode:
        if (this.engine.vrEnabled && this.engine.renderer.xr.isPresenting) {
            this.engine.canvas.parentElement.style.setProperty('pointer-events', 'none', 'important');
        }

        meshesToIntersect.forEach((mesh) => {
            mesh.rootElement.style.setProperty('pointer-events', 'none', 'important');
        });
        aimingGuiComponent.rootElement.style.setProperty('pointer-events', 'initial', 'important');
        aimingElm = document.elementFromPoint(x, y);
        this.engine.canvas.style.setProperty('pointer-events', 'initial', 'important');
        return aimingElm;
    }


    public bindClickEvents = () => {
        // this is both for click and css active pseudoclasses (also in general dispatching mouse down and up...)
        this.downEventHandled = false;
        this.upEventSent = false;
        this.focusedElement = null; // previous one

        this.boundEvents = true;
        

        if (this.engine.vrEnabled) {
            this.engine.vrControl.controller1.addEventListener( 'selectstart', () => {
                if (!this.engine.renderer.xr.isPresenting) {
                    return;
                }
                this.sendDownEvent(this.aimingHTMLElementVR11, this.aimXVR11, this.aimYVR11);
            });
            
            this.engine.vrControl.controller1.addEventListener( 'selectend', () => {
                if (!this.engine.renderer.xr.isPresenting) {
                    return;
                }
                this.sendUpEvent(this.aimingHTMLElementVR11, this.aimXVR11, this.aimYVR11);
            });
    
            this.engine.vrControl.controller2.addEventListener( 'selectstart', () => {
                if (!this.engine.renderer.xr.isPresenting) {
                    return;
                }
                this.sendDownEvent(this.aimingHTMLElementVR22, this.aimXVR22, this.aimYVR22);
            });
            
            this.engine.vrControl.controller2.addEventListener( 'selectend', () => {
                if (!this.engine.renderer.xr.isPresenting) {
                    return;
                }
                this.sendUpEvent(this.aimingHTMLElementVR22, this.aimXVR22, this.aimYVR22);
            });
        }


        document.addEventListener( 'mousedown', (e) => {
            if (this.engine.renderer.xr.isPresenting) {
                return;
            }
            if (this.downEventHandled){ // to also prevent infinite
                this.downEventHandled = false;
                return;
            }
            if (!this.engine.control.controls.isLocked) {
                return;
            }
            
            this.sendDownEvent(this.aimingHTMLElement, this.aimX, this.aimY);
        });

        document.addEventListener( 'mouseup', (e) => {
            if (this.engine.renderer.xr.isPresenting) {
                return;
            }
            if (this.upEventSent){ // to also prevent infinite
                this.upEventSent = false;
                return;
            }
            if (!this.engine.control.controls.isLocked) {
                return;
            }
            
            this.sendUpEvent(this.aimingHTMLElement, this.aimX, this.aimY);
        });
    }


    public sendDownEvent = (aimingHTMLElement, aimX, aimY) => {

        if (this.engine && aimingHTMLElement) { // click not captured until gui system executed
            this.downEventHandled = true;
            dispatchMouseEvent(aimingHTMLElement, 'mousedown', aimX, aimY);    
            dispatchMouseEvent(aimingHTMLElement, 'focus', aimX, aimY);
            aimingHTMLElement.focus(); // only this focuses on element
            if (this.focusedElement && !this.focusedElement.isSameNode(aimingHTMLElement)) {
                dispatchMouseEvent(this.focusedElement, 'blur', aimX, aimY);
            }

            this.focusedElement = aimingHTMLElement;

            if (isTextBox(this.focusedElement)) {
                this.engine.control.typingMode = true;
            }else {
                this.engine.control.typingMode = false;
            }
        }
    }


    public sendUpEvent = (aimingHTMLElement, aimX, aimY) => {

        if (this.engine && aimingHTMLElement) { // click not captured until gui system executed
            this.upEventSent = true;
            dispatchMouseEvent(aimingHTMLElement, 'mouseup', aimX, aimY);
            dispatchMouseEvent(aimingHTMLElement, 'click', aimX, aimY);
            // this.this.aimingHTMLElement.click(); // no need for this

            // this.aimingGuiComponent.rootElement.style.zIndex = 10000000000000;
        }
    }

}
