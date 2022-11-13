import * as THREE from 'three';
import { MeshComponent } from '../core/components/mesh_component';
import { GUI_COMPONENT_TYPE } from './utils';


interface NamedParameters {
    htmlElement: HTMLElement;
    htmlFilter: Function;
    ratio: number;
    MaterialType: THREE.Material;
}


export class GUIComponent extends MeshComponent{
    htmlElement: any;
    htmlTexture: any;
    ratio: number;
    MaterialType: any;
    htmlFilter: any;


    constructor({
        htmlElement,
        htmlFilter,
        ratio = 1,
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
            ratio,
            htmlFilter,
            MaterialType,
        });
    }


    public initComponent = (props: any): void => {
        this.htmlElement = props.htmlElement;
        this.htmlFilter = props.htmlFilter;
        this.MaterialType = props.MaterialType;
        this.ratio = props.ratio;
        
        this.initHTMLElement();
        this.genPlaneMesh();

        // init texture (GUISystem later assigns this to material):
        // example setting props: https://github.com/mrdoob/three.js/blob/dev/src/renderers/WebGLRenderTarget.js
        this.htmlTexture = new THREE.Texture();
        this.htmlTexture.needsUpdate = true;
        this.htmlTexture.generateMipmaps = false;
    }


    public registerComponent({scene}: any): void {
        // scene.add(this.state.planeMesh);
        scene.add(this);
    }


    protected genPlaneMesh = (): THREE.Mesh => { // htmlElement, MaterialType: THREE.Material
        let [widthInWorldUnit, heightInWorldUnit] = this.get2DSizeInWorldUnit();
        const planeGeometry = new THREE.PlaneGeometry( widthInWorldUnit, heightInWorldUnit );
        const planeMaterial = new this.MaterialType({color: '#282c34', side: THREE.DoubleSide}); // THREE.FrontSide
        planeMaterial.needsUpdate = true;

        super.setGeometry(planeGeometry);
        super.setMeterial(planeMaterial);
        // or:
        // Reflect.set(THREE.Mesh.prototype, "geometry", planeGeometry, this);
        // Reflect.set(THREE.Mesh.prototype, "material", planeMaterial, this);

        super.updateTheMorph();
        
        // this.receiveShadow = true;
    }


    public get2DSizeInWorldUnit(): any {
        // ratio:
        let unitPX = 100;
        unitPX = unitPX / this.ratio;
        
        // htmlElement Dimensions: https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Determining_the_dimensions_of_elements
        let rect = this.htmlElement.getBoundingClientRect();
        let widthInWorldUnit = rect.width / unitPX;
        let heightInWorldUnit = rect.height / unitPX;

        return [widthInWorldUnit, heightInWorldUnit];
    }


    public initHTMLElement(): any {
        this.htmlElement.style.position = 'fixed';
        this.htmlElement.style.left = '0';
        this.htmlElement.style.top = '0';
        this.htmlElement.style.overflow = 'hidden'; // This will not allow the content to exceed the container
        // htmlElement.style.overflow = 'auto'; // This will automatically add scrollbars to the container when...
        this.htmlElement.style.margin = '0 auto';
    }


    // // Later set the getter and setter for x, y, z
    // public setPosition = (x: number, y: number, z: number): void => {
    //     this.state.planeMesh.x = x;
    // }


}
