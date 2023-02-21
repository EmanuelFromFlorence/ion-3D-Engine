import * as THREE from 'three';
import { MeshComponent } from '../core/components/mesh-component';
import { GUI_COMPONENT_TYPE, getElementSize, fixElementTopLeft, get2DSizeInWorldUnit, getPixelValue } from './utils';


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
    guiStyleMap: Map<any, any>;
    guiSystemInitialized: boolean;
    pxWidth: any;
    pxHeight: any;
    rootElementHeight: any;
    rootElementWidth: any;
    widthInWorldUnit: any;
    heightInWorldUnit: any;


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
        this.guiStyleMap = new Map();
        this.setSizeFromHTMLNode(this.rootElement);

        this.isAiming = false;
        this.lastProcess = 0;
        
        fixElementTopLeft(this.rootElement);
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


    protected genPlaneMesh = (): THREE.Mesh => {
        this.setSizeFromHTMLNode(this.rootElement);

        const planeGeometry = new THREE.PlaneGeometry( this.widthInWorldUnit, this.heightInWorldUnit );
        planeGeometry.attributes.position.needsUpdate = true;
        const planeMaterial = this.material;
        planeMaterial.needsUpdate = true;

        super.setGeometry(planeGeometry);
        super.setMeterial(planeMaterial);
        // or:
        // Reflect.set(THREE.Mesh.prototype, "geometry", planeGeometry, this);
        // Reflect.set(THREE.Mesh.prototype, "material", planeMaterial, this);

        super.updateTheMorph();
    }


    // TODO: later set observers to check for size changes and only trigger when...
    public updateMeshAndSVGSize = () => {
        // Only changing geometry in case of change:
        if (this.setSizeFromHTMLNode(this.rootElement)) {
            if (this.geometry) {
                const planeGeometry = new THREE.PlaneGeometry( this.widthInWorldUnit, this.heightInWorldUnit );
                this.geometry.dispose();
                // planeGeometry.attributes.position.needsUpdate = true; // no need
                super.setGeometry(planeGeometry);
            }

            if (this.svg) {
                // const { width, height } = getElementSize(this.rootElement);
                this.svg.setAttribute('width', `${this.rootElementWidth}`);
                this.svg.setAttribute('height', `${this.rootElementHeight}`);
                this.svg.setAttribute('viewBox', `0 0 ${this.rootElementWidth} ${this.rootElementHeight}`);
            }
        }
    }


    public setSizeFromHTMLNode = (htmlNode) => {        
        const rect = htmlNode.getBoundingClientRect();
        let width = rect.width;
        let height = rect.height;
        
        if (this.rootElementWidth === width && this.rootElementHeight === height) return false;

        // Or:
        // const leftBorder = getPixelValue(htmlNode, 'border-left-width');
        // const rightBorder = getPixelValue(htmlNode, 'border-right-width');
        // const topBorder = getPixelValue(htmlNode, 'border-top-width');
        // const bottomBorder = getPixelValue(htmlNode, 'border-bottom-width');  
        // let width = htmlNode.clientWidth + leftBorder + rightBorder;
        // let height = htmlNode.clientHeight + topBorder + bottomBorder;

        this.rootElementWidth = width;
        this.rootElementHeight = height;

        let [widthInWorldUnit, heightInWorldUnit] = get2DSizeInWorldUnit(this.rootElementWidth, this.rootElementHeight, this.ratio);
        
        this.widthInWorldUnit = widthInWorldUnit;
        this.heightInWorldUnit = heightInWorldUnit;

        return true;
    }

}
