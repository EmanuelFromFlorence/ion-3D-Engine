import * as THREE from 'three';
import { MeshComponent } from '../core/components/mesh-component';
import { GUI_COMPONENT_TYPE } from './utils';


interface NamedParameters {
    rootElement: HTMLElement;
    htmlFilter: Function;
    ratio: number;
    material: THREE.Material;
    transparent: boolean;
    renderTimeout: number;
}


export class GUIComponent extends MeshComponent{
    rootElement: any;
    htmlTexture: any;
    ratio: number;
    material: any;
    htmlFilter: any;
    compId: string;
    onMutation: any;
    svg: any;
    isAiming: boolean;
    lastProcess: number;
    renderTimeout: number;


    constructor({
        rootElement,
        htmlFilter,
        ratio = 1,
        material = null,
        transparent = false,
        renderTimeout = Infinity, // milliseconds
    }: NamedParameters){
        super({type: GUI_COMPONENT_TYPE}); // new.target.name
        
        if (!rootElement) throw new TypeError('Invalid rootElement is passed!');

        if (!htmlFilter || typeof htmlFilter !== 'function') {
            htmlFilter = (node) => {
                // return (node.tagName !== 'i');
                return true;
            }
        }

        if (!material) material = new THREE.MeshBasicMaterial({
            // color: '#ffffff', // no need
            side: THREE.DoubleSide,
            transparent: transparent,
            fog: false,
        }); // #282c34

        if (!renderTimeout || typeof renderTimeout !== 'number') throw new TypeError('Invalid renderTimeout is passed!');
        
        this.initComponent({
            rootElement,
            ratio,
            htmlFilter,
            material,
            renderTimeout,
        });
    }


    public initComponent = (props: any): void => {
        this.rootElement = props.rootElement;
        this.htmlFilter = props.htmlFilter;
        this.material = props.material;
        this.ratio = props.ratio;
        this.renderTimeout = props.renderTimeout;
        this.compId = THREE.MathUtils.generateUUID();

        this.isAiming = false;
        this.lastProcess = 0;
        
        this.initRootElement();
        this.genPlaneMesh();

        // init texture (GUISystem later assigns this to material):
        // example setting props: https://github.com/mrdoob/three.js/blob/dev/src/renderers/WebGLRenderTarget.js
        this.htmlTexture = new THREE.Texture(); // Just setting this here later in it is actually set GUI system
        // this.htmlTexture.needsUpdate = true; // Error: Texture marked for update but no image data found.
        // this.htmlTexture.generateMipmaps = true; // false
        // this.material.map = this.htmlTexture;
    }


    public registerComponent({scene}: any): void {
        // scene.add(this.state.planeMesh);
        scene.add(this);
    }


    protected genPlaneMesh = (): THREE.Mesh => { // rootElement, MaterialType: THREE.Material
        let [widthInWorldUnit, heightInWorldUnit] = this.get2DSizeInWorldUnit();
        const planeGeometry = new THREE.PlaneGeometry( widthInWorldUnit, heightInWorldUnit );
        const planeMaterial = this.material;
        // planeMaterial.needsUpdate = true;

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
        
        // rootElement Dimensions: https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Determining_the_dimensions_of_elements
        let rect = this.rootElement.getBoundingClientRect();
        let widthInWorldUnit = rect.width / unitPX;
        let heightInWorldUnit = rect.height / unitPX;

        return [widthInWorldUnit, heightInWorldUnit];
    }


    public initRootElement(): any {
        this.rootElement.style.position = 'fixed';
        this.rootElement.style.left = '0';
        this.rootElement.style.top = '0';
        this.rootElement.style.overflow = 'hidden'; // This will not allow the content to exceed the container
        // rootElement.style.overflow = 'auto'; // This will automatically add scrollbars to the container when...
        this.rootElement.style.margin = '0 auto';
    }


    // // Later set the getter and setter for x, y, z
    // public setPosition = (x: number, y: number, z: number): void => {
    //     this.state.planeMesh.x = x;
    // }


}
