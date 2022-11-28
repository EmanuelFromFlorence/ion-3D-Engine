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
    aimingGuiComponent: any;
    aimX: number;
    aimY: number;
    aimingHTMLElement: any;
    downEventHandled: boolean;
    upEventSent: boolean;
    clickEventHandled: boolean;
    focusedElement: any;

    constructor(){ // {}: NamedParameters
        super();

        this.engine = null;
        this.aimingGuiComponent = null;
        this.aimX = null;
        this.aimY = null;
        this.aimingHTMLElement = null;
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
        this.bindClickEvents();
    }


    public execute = (engine: Engine, entityRegistry: any) => {
        this.engine = engine;
        
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
                component.htmlTexture.needsUpdate = true;
                // component.htmlTexture.generateMipmaps = false;

                component.htmlTexture.image = img;

                // needsUpdate should be set after setting the image -> Error: Texture marked for update but no image data found.
                // Only this worked, needsUpdate values are getting overwritten
                if(!component.htmlTexture.needsUpdate || !component.material.needsUpdate){
                    component.htmlTexture.needsUpdate = true;
                    component.material.needsUpdate = true;
                }

                component.material.map = component.htmlTexture;

                // Example of creating texture and setting texture props:::
                // https://github.com/mrdoob/three.js/blob/dev/src/renderers/WebGLRenderTarget.js

                // Note: After the initial use of a texture, its dimensions, format, and type cannot be changed. Instead, 
                // call .dispose() on the texture and instantiate a new one.
                // There is material.dispose() too...


                // const texture = new THREE.TextureLoader().load( img );
                // texture.needsUpdate = true;
                
                
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

        this.updateAim(engine, meshesToIntersect);
    }
    

    public updateAim = (engine, meshesToIntersect) => {
        let cameraDirection = new THREE.Vector3();
        cameraDirection = engine.camera.getWorldDirection(cameraDirection);
        cameraDirection.normalize();
        this.aimRaycaster.ray.origin.copy( engine.camera.position );
        this.aimRaycaster.ray.direction.copy( cameraDirection ); 

        const intersections = this.aimRaycaster.intersectObjects(meshesToIntersect, false);

        if (typeof intersections != 'undefined' && intersections.length > 0){
            // intersections[0].object.scale
            // intersections[0].face
            // intersections[0].faceIndex

            this.aimingGuiComponent = intersections[0].object;

            let pointerVector2 = intersections[0].uv;
            this.aimX = pointerVector2.x * this.aimingGuiComponent.rootElement.offsetWidth;
            this.aimY = (1 - pointerVector2.y) * this.aimingGuiComponent.rootElement.offsetHeight;

            let newAimingHTMLElement = this.getAimingElement(this.aimX, this.aimY, engine.canvas, meshesToIntersect, this.aimingGuiComponent);
            if(this.aimingHTMLElement && newAimingHTMLElement instanceof HTMLElement && !newAimingHTMLElement.isSameNode(this.aimingHTMLElement)) {
                dispatchMouseEvent(this.aimingHTMLElement, 'mouseout', this.aimX, this.aimY);
            }

            this.aimingHTMLElement = newAimingHTMLElement;
            
            if(this.aimingHTMLElement && newAimingHTMLElement instanceof HTMLElement){
                dispatchMouseEvent(this.aimingHTMLElement, 'mouseover', this.aimX, this.aimY);
            }

        }else {
            if (this.aimingHTMLElement) dispatchMouseEvent(this.aimingHTMLElement, 'mouseout', this.aimX, this.aimY);
            this.aimingGuiComponent = null;
            this.aimX = null;
            this.aimY = null;
            this.aimingHTMLElement = null;
        }
    }


    // A elementsFromPoint shim: https://gist.github.com/oslego/7265412
    public getAimingElement = (x, y, canvas, meshesToIntersect, aimingGuiComponent) => {
        let aimingElm = null;
        canvas.style.setProperty('pointer-events', 'none', 'important');
        meshesToIntersect.forEach((mesh) => {
            mesh.rootElement.style.setProperty('pointer-events', 'none', 'important');
        });
        aimingGuiComponent.rootElement.style.setProperty('pointer-events', 'initial', 'important');
        aimingElm = document.elementFromPoint(x, y);
        canvas.style.setProperty('pointer-events', 'initial', 'important');
        return aimingElm;
    }


    public bindClickEvents = () => {
        // this is both for click and css active pseudoclasses (also in general dispatching mouse down and up...)
        this.downEventHandled = false;
        this.upEventSent = false;
        this.focusedElement = null; // previous one

        document.addEventListener( 'mousedown', (e) => {
            if (this.downEventHandled){ // to also prevent infinite
                this.downEventHandled = false;
                return;
            }
            if (this.engine && this.engine.control.controls.isLocked && this.aimingHTMLElement) { // click not captured until gui system executed
                this.downEventHandled = true;
                dispatchMouseEvent(this.aimingHTMLElement, 'mousedown', this.aimX, this.aimY);
                
                dispatchMouseEvent(this.aimingHTMLElement, 'focus', this.aimX, this.aimY);
                this.aimingHTMLElement.focus(); // only this focuses on element
                if (this.focusedElement && !this.focusedElement.isSameNode(this.aimingHTMLElement)) {
                    dispatchMouseEvent(this.focusedElement, 'blur', this.aimX, this.aimY);
                }

                this.focusedElement = this.aimingHTMLElement;

                if (isTextBox(this.focusedElement)) {
                    this.engine.control.typingMode = true;
                }else {
                    this.engine.control.typingMode = false;
                }
            }
        });

        document.addEventListener( 'mouseup', (e) => {
            if (this.upEventSent){ // to also prevent infinite
                this.upEventSent = false;
                return;
            }
            if (this.engine && this.engine.control.controls.isLocked && this.aimingHTMLElement) { // click not captured until gui system executed
                this.upEventSent = true;
                dispatchMouseEvent(this.aimingHTMLElement, 'mouseup', this.aimX, this.aimY);
                
                dispatchMouseEvent(this.aimingHTMLElement, 'click', this.aimX, this.aimY);
                // this.aimingHTMLElement.click(); // no need for this
                
                // this.aimingGuiComponent.rootElement.style.zIndex = 10000000000000;
            }
        });
    }

}
