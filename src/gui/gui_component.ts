import * as THREE from 'three';
import { MeshComponent } from '../core/components/mesh_component';
import { GUI_COMPONENT_TYPE } from './utils';


interface NamedParameters {
    htmlElement: HTMLElement;
    htmlFilter: Function;
    scale: number;
    MaterialType: THREE.Material;
}


export class GUIComponent extends MeshComponent{


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
        
        this.initComponent({
            htmlElement,
            scale,
            htmlFilter,
            MaterialType,
        });
    }


    public initComponent = (props: any): void => {
        const state = {...props};
        this.genPlaneMesh(state.MaterialType);

        // init texture (GUISystem later assigns this to material):
        // example setting props: https://github.com/mrdoob/three.js/blob/dev/src/renderers/WebGLRenderTarget.js
        state.texture = new THREE.Texture();
        state.texture.needsUpdate = true;
        state.texture.generateMipmaps = false;

        this.state = state;
    }


    public registerComponent({scene}: any): void {
        // scene.add(this.state.planeMesh);
        scene.add(this);
    }


    protected genPlaneMesh = (MaterialType: THREE.Material): THREE.Mesh => {
        const planeGeometry = new THREE.PlaneGeometry( 9, 9 );
        const planeMaterial = new MaterialType({color: '#282c34', side: THREE.DoubleSide}); // THREE.FrontSide
        planeMaterial.needsUpdate = true;

        super.setGeometry(planeGeometry);
        super.setMeterial(planeMaterial);
        // or:
        // Reflect.set(THREE.Mesh.prototype, "geometry", planeGeometry, this);
        // Reflect.set(THREE.Mesh.prototype, "material", planeMaterial, this);

        super.updateTheMorph();
        
        // this.receiveShadow = true;
    }


    // // Later set the getter and setter for x, y, z
    // public setPosition = (x: number, y: number, z: number): void => {
    //     this.state.planeMesh.x = x;
    // }


}
