import * as THREE from 'three';
import { System } from '../core/systems/system';
import * as htmlToImage from 'html-to-image';
import { createImage, GUI_COMPONENT_TYPE } from './utils';
import { Entity } from '../core/entity';


interface NamedParameters {
}


export class GUISystem extends System{


    constructor(){ // {}: NamedParameters
        super();
    }


    public execute = (entityRegistry: any) => {
        for (let [entityId, entity] of Object.entries(entityRegistry[GUI_COMPONENT_TYPE])) { // {entityId: String, entity: Entity}
            let component = entity.getComponent(GUI_COMPONENT_TYPE);

            htmlToImage.toSvg(component.state.htmlElement, { filter: component.state.htmlFilter })
            .then(async (svgDataUrl) => {
                const img = await createImage(svgDataUrl);

                // https://github.com/mrdoob/three.js/blob/master/src/textures/Texture.js
                // component.state.texture.source = new THREE.Source( img );
                component.state.texture.image = img;
                

                // only this worked:
                component.state.texture.needsUpdate = true;
                component.material.needsUpdate = true;



                // Example of creating texture and setting texture props:::
                // https://github.com/mrdoob/three.js/blob/dev/src/renderers/WebGLRenderTarget.js

                // Note: After the initial use of a texture, its dimensions, format, and type cannot be changed. Instead, 
                // call .dispose() on the texture and instantiate a new one.

                // const texture = new THREE.TextureLoader().load( img );
                // texture.needsUpdate = true;
                
                if (!component.material.map) {
                    console.warn('Should happen once initially!!!');
                    component.material.map = component.state.texture;


                    console.log(component);
                }
                
            });
                
            // In case going with DataTexture and creating our own canvas:
            // https://dustinpfister.github.io/2022/04/15/threejs-data-texture/
            // const width = 32, height = 32;
            // const size = width * height;
            // const data = new Uint8Array( 4 * size );
            // const texture = new THREE.DataTexture( data, width, height );
            // texture.needsUpdate = true;

        }
    }

}