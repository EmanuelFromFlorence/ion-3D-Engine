import * as THREE from 'three';
import { System } from '../core/systems/system';
import * as htmlToImage from 'html-to-image';
import { createImage, GUI_COMPONENT_TYPE } from './utils';
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
        const far = 40;
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

            // Only this worked, should later set these in guiComponent if possible:
            if(!component.htmlTexture.needsUpdate || !component.material.needsUpdate){
                component.htmlTexture.needsUpdate = true;
                component.material.needsUpdate = true;
            }


            // More options:: https://github.com/bubkoo/html-to-image
            htmlToImage.toSvg(component.rootElement, { filter: component.htmlFilter })
            .then(async (svgDataUrl) => {
                const img = await createImage(svgDataUrl);

                // https://github.com/mrdoob/three.js/blob/master/src/textures/Texture.js
                // component.htmlTexture.source = new THREE.Source( img );
                component.htmlTexture.image = img;
                
                // Example of creating texture and setting texture props:::
                // https://github.com/mrdoob/three.js/blob/dev/src/renderers/WebGLRenderTarget.js

                // Note: After the initial use of a texture, its dimensions, format, and type cannot be changed. Instead, 
                // call .dispose() on the texture and instantiate a new one.

                // const texture = new THREE.TextureLoader().load( img );
                // texture.needsUpdate = true;
                
                if (!component.material.map) {
                    console.warn('Should happen once initially!!!');
                    component.material.map = component.htmlTexture;
                }
                
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

            let newAimingHTMLElement = this.getAimingElement(this.aimX, this.aimY, engine.canvas);
            if(this.aimingHTMLElement && newAimingHTMLElement instanceof HTMLElement && !newAimingHTMLElement.isSameNode(this.aimingHTMLElement)) {
                dispatchMouseEvent(this.aimingHTMLElement, 'mouseout', this.aimX, this.aimY);
            }

            this.aimingHTMLElement = newAimingHTMLElement;
            
            dispatchMouseEvent(this.aimingHTMLElement, 'mouseover', this.aimX, this.aimY);

        }else {
            if (this.aimingHTMLElement) dispatchMouseEvent(this.aimingHTMLElement, 'mouseout', this.aimX, this.aimY);
            this.aimingGuiComponent = null;
            this.aimX = null;
            this.aimY = null;
            this.aimingHTMLElement = null;
        }
    }


    // A elementsFromPoint shim: https://gist.github.com/oslego/7265412
    public getAimingElement = (x, y, canvas) => {
        let aimingElm = null;
        canvas.style.setProperty('pointer-events', 'none', 'important'); 
        aimingElm = document.elementFromPoint(x, y);
        canvas.style.setProperty('pointer-events', 'initial', 'important'); 
        return aimingElm;
    }


    public bindClickEvents = () => {
        document.addEventListener( 'click', (e) => {
            if (this.engine && this.engine.control.controls.isLocked) { // click not captured until gui system executed
                if(this.aimingHTMLElement && this.aimingHTMLElement.isSameNode(e.target)) { // to also prevent infinite
                    dispatchMouseEvent(this.aimingHTMLElement, 'click', this.aimX, this.aimY);
                }
            }
        });
    }

}
