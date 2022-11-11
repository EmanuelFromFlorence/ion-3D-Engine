import * as THREE from 'three';
import { Component } from '../core/components/component';
import { GUI_COMPONENT_TYPE } from './utils';


interface NamedParameters {
    htmlElement: HTMLElement;
    htmlFilter: Function;
    scale: number;
    MaterialType: THREE.Material;
}


export class GUIComponent extends Component{


    constructor({
        htmlElement,
        htmlFilter,
        scale = 1,
        MaterialType = null,
    }: NamedParameters){
        super({type: GUI_COMPONENT_TYPE}); // new.target.name
        
        if (!htmlElement) throw new TypeError('Invalid htmlElement is passed!');

        if (!htmlFilter || typeof htmlFilter !== 'function') {
            htmlFilter = (node) => {
                // return (node.tagName !== 'i');
                return true;
            }
        }

        if (!MaterialType) MaterialType = THREE.MeshBasicMaterial;
        
        this.initState({
            htmlElement,
            scale,
            htmlFilter,
            MaterialType,
        });
    }


    public initState = (props: any): void => {
        const state = {...props};
        state.planeMesh = this.genPlaneMesh(state.MaterialType);
        // init texture:
        // example setting props: https://github.com/mrdoob/three.js/blob/dev/src/renderers/WebGLRenderTarget.js
        state.texture = new THREE.Texture();
        state.texture.needsUpdate = true;
        state.texture.generateMipmaps = false;

        // this.setState(state);
        this.state = state;
    }


    protected genPlaneMesh = (MaterialType: THREE.Material): THREE.Mesh => {
        const planeGeometry = new THREE.PlaneGeometry( 9, 9 );
        const planeMaterial = new MaterialType({color: '#282c34', side: THREE.DoubleSide}); // THREE.FrontSide
        planeMaterial.needsUpdate = true;
        const planeMesh = new THREE.Mesh( planeGeometry, planeMaterial );
        // planeMesh.receiveShadow = true;

        return planeMesh;      
    }

}
