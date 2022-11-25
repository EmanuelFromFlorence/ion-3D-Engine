import * as THREE from 'three';
import { System } from '../core/systems/system';
import * as htmlToImage from 'html-to-image';
import { createImage, GUI_COMPONENT_TYPE } from './utils';
import { Entity } from '../core/entity';
import { bindCSSEvents } from './gui-event-binder';
import { Engine } from '../ion-3d-engine';


interface NamedParameters {
}


export class GUISystem extends System{
    aimRaycaster: any;

    constructor(){ // {}: NamedParameters
        super();

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
    }


    public execute = (engine: Engine, entityRegistry: any) => {
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
            intersections[0].object // intersect returns the same gui component mesh
            intersections[0].object.isMesh
            intersections[0].object.scale
            intersections[0].face
            intersections[0].faceIndex
            intersections[0].uv // THREE.Vector2
            // if(typeof intersections[0].object.name != 'undefined'){
            //     // if (intersections[0].object.name.includes('twitter')){}
            // }

            // console.log(intersections[0].object);
            

            let pointerVector2 = intersections[0].uv;

            let aimingElm = this.getAimingElement(pointerVector2, intersections[0].object, engine.canvas);
            // console.log(aimingElm); // container
            

            
            // let node = document.getElementById('btn_1');
            

            const mouseEvent = new MouseEvent("mouseover", {
                view: window,
                bubbles: true,
                cancelable: true,
                offsetX: aimingElm.scrollWidth * pointerVector2.x, // node.scrollWidth mnot what we want ultimately because of scrolling and overflow...
                offsetY: aimingElm.scrollHeight * pointerVector2.y,

                clientX: aimingElm.scrollWidth * pointerVector2.x, // node.scrollWidth mnot what we want ultimately because of scrolling and overflow...
                clientY: aimingElm.scrollHeight * pointerVector2.y,

                screenX: aimingElm.scrollWidth * pointerVector2.x, // node.scrollWidth mnot what we want ultimately because of scrolling and overflow...
                screenY: aimingElm.scrollHeight * pointerVector2.y,

                pageX: aimingElm.scrollWidth * pointerVector2.x, // node.scrollWidth mnot what we want ultimately because of scrolling and overflow...
                pageY: aimingElm.scrollHeight * pointerVector2.y,
            });
            // console.log(node.scrollWidth * pointerVector2.x);
            // console.log(node);
            
            // aimingElm.dispatchEvent(mouseEvent);
            
            
            // var event2 = document.createEvent("MouseEvents");
            // event2.initMouseEvent("mouseover", true, true, window,
            // 1, 1, 1, 1, 1,
            // false, false, false, false,
            // 0, null);
            // node.dispatchEvent(event2);

        }


    }

    // https://gist.github.com/oslego/7265412
    public getAimingElement = (pointerVector2, guiComponent, canvas) => {
        let x = pointerVector2.x;
        let y = pointerVector2.y;
        let aimingElm = null;
                
        canvas.style.setProperty('pointer-events', 'none', 'important'); 
        aimingElm = document.elementFromPoint(x, y);
        canvas.style.setProperty('pointer-events', 'initial', 'important'); 
        
        return aimingElm;
    }


    // public elementssssFromPoint = (x, y) => {
    //     var elements = [], previousPointerEvents = [], current, i, d;
    //     // get all elements via elementFromPoint, and remove them from hit-testing in order
    //     while ((current = document.elementFromPoint(x,y)) && elements.indexOf(current)===-1 && current != null) {
              
    //         // push the element and its current style
    //         elements.push(current);
    //         previousPointerEvents.push({
    //                 value: current.style.getPropertyValue('pointer-events'),
    //                 priority: current.style.getPropertyPriority('pointer-events')
    //             });
              
    //         // add "pointer-events: none", to get to the underlying element
    //         current.style.setProperty('pointer-events', 'none', 'important'); 
    //     }
    
    //     // restore the previous pointer-events values
    //     for(i = previousPointerEvents.length; d=previousPointerEvents[--i]; ) {
    //         elements[i].style.setProperty('pointer-events', d.value?d.value:'', d.priority); 
    //     }
          
    //     // return our results
    //     return elements;
    // }


}
