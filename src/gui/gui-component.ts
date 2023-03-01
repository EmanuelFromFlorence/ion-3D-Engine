import * as THREE from 'three';
import { MeshComponent } from '../core/components/mesh-component';
import { GUI_COMPONENT_TYPE, getElementSize, fixElementTopLeft, get2DSizeInWorldUnit, getPixelValue } from './utils';


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
    textureConstants: any;


    constructor({
        rootElement,
        htmlFilter,
        ratio = 1,
        material = null,
        transparent = false,
        renderTimeout = 2000, // milliseconds (Infinity for constant rendering)
        textureConstants = {},
    }){
        super({type: GUI_COMPONENT_TYPE}); // new.target.name
        
        if (!rootElement) throw new TypeError('Invalid rootElement is passed!');

        if (!htmlFilter || typeof htmlFilter !== 'function') {
            htmlFilter = (node) => {
                // return (node.tagName !== 'i');
                return true;
            }
        }

        if (!material) material = new THREE.MeshBasicMaterial({
            // color: '#fff', // no need
            side: THREE.DoubleSide,
            transparent: transparent,
            fog: false,

            // refractionRatio: 0.1,
            // combine: THREE.MixOperation,
            // reflectivity: 0.2,
        }); // #282c34

        if (!renderTimeout || typeof renderTimeout !== 'number') throw new TypeError('Invalid renderTimeout is passed!');
        
        this.initComponent({
            rootElement,
            ratio,
            htmlFilter,
            material,
            renderTimeout,
            textureConstants,
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
        this.textureConstants = props.textureConstants;

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


    public updateTextureConstants = () => {
        // https://threejs.org/docs/index.html#api/en/constants/Textures

        // How the texture is sampled when a texel covers more than one pixel.
        // NearestFilter returns the value of the texture element that is nearest (in Manhattan distance) 
        // to the specified texture coordinates.
        // LinearFilter is the default and returns the weighted average of the four texture elements that 
        // are closest to the specified texture coordinates.
        // THREE.NearestFilter
        // THREE.LinearFilter
        this.htmlTexture.magFilter  = this.textureConstants.magFilter || THREE.LinearFilter;

        // THREE.NearestFilter
        // THREE.NearestMipmapNearestFilter
        // THREE.NearestMipmapLinearFilter
        // THREE.LinearFilter
        // THREE.LinearMipmapNearestFilter
        // THREE.LinearMipmapLinearFilter
        this.htmlTexture.minFilter  = this.textureConstants.minFilter || THREE.LinearMipmapLinearFilter;

        // THREE.UVMapping
        // THREE.CubeReflectionMapping
        // THREE.CubeRefractionMapping
        // THREE.EquirectangularReflectionMapping
        // THREE.EquirectangularRefractionMapping
        // THREE.CubeUVReflectionMapping
        if (this.textureConstants.mapping) this.htmlTexture.mapping = this.textureConstants.mapping;

        // Whether to update the texture's uv-transform .matrix from the texture properties 
        // .offset, .repeat, .rotation, and .center. True by default. Set this to false 
        // if you are specifying the uv-transform matrix directly.
        if (this.textureConstants.matrixAutoUpdate) this.htmlTexture.matrixAutoUpdate = this.textureConstants.matrixAutoUpdate;

        // Whether to generate mipmaps (if possible) for a texture. True by default. 
        // Set this to false if you are creating mipmaps manually.
        // works sort of like anti-aliasing
        if (this.textureConstants.generateMipmaps) this.htmlTexture.generateMipmaps = this.textureConstants.generateMipmaps;

        // If set to true, the alpha channel, if present, is multiplied into the color channels 
        // when the texture is uploaded to the GPU. Default is false.
        if (this.textureConstants.premultiplyAlpha) this.htmlTexture.premultiplyAlpha  = this.textureConstants.premultiplyAlpha;

        // If set to true, the texture is flipped along the vertical axis when uploaded to the GPU. 
        // Default is true.
        if (this.textureConstants.flipY) this.htmlTexture.flipY  = this.textureConstants.flipY;

        // 4 by default.
        if (this.textureConstants.unpackAlignment) this.htmlTexture.unpackAlignment  = this.textureConstants.unpackAlignment;
        
        // THREE.LinearEncoding is the THREE.js' default. See the texture constants page for details of other formats.
        // THREE.LinearEncoding
        // THREE.sRGBEncoding
        // THREE.BasicDepthPacking
        // THREE.RGBADepthPacking
        if (this.textureConstants.encoding) this.htmlTexture.encoding  = this.textureConstants.encoding;

        // A callback function, called when the texture is updated (e.g., when needsUpdate 
        // has been set to true and then the texture is used).
        if (this.textureConstants.onUpdate) this.htmlTexture.onUpdate  = this.textureConstants.onUpdate;
        
        // The data definition of a texture. A reference to the data source can be shared across textures. 
        // This is often useful in context of spritesheets where multiple textures render the same data 
        // but with different texture transformations.
        if (this.textureConstants.source) this.htmlTexture.source  = this.textureConstants.source;
    }

}
