import * as THREE from 'three';
import { System } from '../core/systems/system';
import { GUI_COMPONENT_TYPE, isTextBox, buildPageStyleString, buildPageStyleMap, callbackOnNodesRecursive, createGUISVGWrapper, appendSVGStyle, fixElementTopLeft, isInstanceOfElement, processHTMLNodeTree, svgToDataURL } from './utils';
import { bindCSSEvents, dispatchMouseEvent, dispatchMouseEventRucursive } from './gui-event-binder';
import { Engine } from '../ion-3d-engine';
import { throttle } from '../core/utils/utils';



function generateCanvasTexture() {
    let size = 16;
    let canvas2 = document.createElement("canvas");
    canvas2.width = size;
    canvas2.height = size;
    let context = canvas2.getContext("2d");
    context.rect(0, 0, size, size);
    context.fillStyle = "white";
    context.fill();

    const texture = new THREE.CanvasTexture(canvas2);
    return texture;
}



export class GUISystem extends System{
    aimRaycaster: any;
    engine: Engine;
    downEventHandled: boolean;
    upEventSent: boolean;
    clickEventHandled: boolean;
    focusedElement: any;
    boundEvents: boolean;

    aimingGuiComponent: any;
    aimingHTMLElement: any;
    aimX: number;
    aimY: number;
    aimingGuiComponentVR11: any;
    aimingHTMLElementVR11: any;
    aimXVR11: number;
    aimYVR11: number;
    aimingGuiComponentVR22: any;
    aimingHTMLElementVR22: any;
    aimXVR22: number;
    aimYVR22: number;
    flag: boolean;
    guiWorker: Worker;
    pageStyle: string;
    pageStyleMap: Map<string, any>;
    throttledUpdateHTMLImage: () => void;
    throttledUpdateAim: () => void;
    throttledUpdateVRAim: () => void;
    throttledRenderGUIComponent: () => void;
    texture: any;


    constructor(){ // {}: NamedParameters
        super();

        this.engine = null;
        this.aimingGuiComponent = null;
        this.aimX = null;
        this.aimY = null;
        this.aimingHTMLElement = null;
        this.boundEvents = false;
        this.initTrottledMethods();
        this.initUIEvents();
        this.initRaycaster();

        this.texture = generateCanvasTexture();
    }


    public initRaycaster = () => {
        const raycasterOrigin = new THREE.Vector3(0, 0, 0);
        const raycasterDirection = new THREE.Vector3(0, - 2, 0);
        const near = 0;
        const far = 200;
        this.aimRaycaster = new THREE.Raycaster(raycasterOrigin, raycasterDirection, near, far);
    }

    
    public initTrottledMethods = () => {
        this.throttledUpdateAim = throttle((meshesToIntersectArg) => this.updateAim(meshesToIntersectArg), 20);
        this.throttledUpdateVRAim = throttle((meshesToIntersectArg) => this.updateVRAim(meshesToIntersectArg), 20);
    }


    public initUIEvents = () => {
        bindCSSEvents();
        this.pageStyle = buildPageStyleString();

        // TODO: later should only add style map to the gui components and specific to their dom
        buildPageStyleMap((styleName, value) => {
            if (!this.pageStyleMap) this.pageStyleMap = new Map();
            this.pageStyleMap.set(styleName, value);
        });
    }


    public execute = async (engine: Engine, entityRegistry: any) => {
        this.engine = engine;
        if (!this.boundEvents){
            this.bindClickEvents(); // needs this.engine
        }
        
        let meshesToIntersect = [];

        let entities = entityRegistry[GUI_COMPONENT_TYPE];
        if (!entities) return;

        for (let [entityId, entity] of Object.entries(entities)) { // {entityId: String, entity: Entity}
            let guiComponent = entity.getComponent(GUI_COMPONENT_TYPE);

            await this.initGUIComponent(guiComponent);
            await guiComponent.throttledUpdateGUIComponent(guiComponent);

            // Moved this into updateGUIComponent...
            // // updating and rendering gui texture for a duration after not aiming to the gui components
            // let currentTime = new Date().getTime();
            // if (!guiComponent.lastAimedProcess) guiComponent.lastAimedProcess = new Date().getTime();
            // let duration = currentTime - guiComponent.lastAimedProcess;

            // if (duration < guiComponent.renderTimeout || guiComponent.doRender) {
            //     await guiComponent.throttledUpdateGUIComponent(guiComponent);
            // }

            meshesToIntersect.push(guiComponent);
        }


        if(engine.vrEnabled && engine.renderer.xr.isPresenting) {
            this.throttledUpdateVRAim(meshesToIntersect);
        }else {
            this.throttledUpdateAim(meshesToIntersect);
        }
    }


    public initGUIComponent = async (guiComponent) => {
        if(guiComponent.guiSystemInitialized) return;
        guiComponent.guiSystemInitialized = true;

        guiComponent.doRender = true;
        if (!guiComponent.renderTimeout) guiComponent.renderTimeout = 5000; // user sets to infinite for constant rendering

        guiComponent.convertHTMLNodeOptions = { filter: guiComponent.htmlFilter };

        guiComponent.throttledUpdateGUIComponent = throttle((guiCompArg) => this.updateGUIComponent(guiCompArg), 60); // 20> for 60 fps

        guiComponent.throttledDisposeMaterialGUIComponent = throttle(() => guiComponent.material.dispose(), 10000);

        guiComponent.onRootElementMutation = (mutationList, observer) => {
            
            guiComponent.doRender = true;

            for (const mutation of mutationList) {
                if (mutation.type === 'childList') {
                    if (mutation.addedNodes.length) {
                        mutation.addedNodes.forEach((htmlNode) => {
                            if (isInstanceOfElement(htmlNode, HTMLElement)) guiComponent.addedNodeProcessed = false;
                        });
                    }
                }
            }
        };
        const addRemoveFlagObserver = new MutationObserver(guiComponent.onRootElementMutation);
        const config = { attributes: true, childList: true, subtree: true };
        addRemoveFlagObserver.observe(guiComponent.rootElement, config);

        await this.createGUIComponentSVG(guiComponent);
    }


    public createGUIComponentSVG = async (guiComponent) => {
        const svg = createGUISVGWrapper(guiComponent);

        appendSVGStyle(svg, this.pageStyle);
        guiComponent.svg = svg;
        guiComponent.updateMeshAndSVGSize();
    }


    public updateGUIComponent = async (guiComponent) => {
        const elmFPS = document.getElementById('input_11');
        if (elmFPS) elmFPS.setAttribute('value', this.engine.fps.toFixed(0));

        processHTMLNodeTree(guiComponent.rootElement);

        // updating and rendering gui texture for a duration after not aiming to the gui components
        let currentTime = new Date().getTime();
        if (!guiComponent.lastAimedProcess) guiComponent.lastAimedProcess = new Date().getTime();
        let duration = currentTime - guiComponent.lastAimedProcess;
        if (duration > guiComponent.renderTimeout && !guiComponent.doRender) {
            return;
        }

        if (!guiComponent.addedNodeProcessed) {
            bindCSSEvents();
            guiComponent.addedNodeProcessed = true;
        }
        
        guiComponent.updateMeshAndSVGSize();
        await this.updateGUIComponentTexture(guiComponent);

        guiComponent.doRender = false;
    }


    // Source: https://developer.mozilla.org/en-US/docs/Web/SVG/SVG_as_an_Image
    // External resources (e.g. images, stylesheets) cannot be loaded, though they can be used if inlined through data: Ls.
    public updateGUIComponentTexture = async (guiComponent) => {
        const svgDataUrl = await svgToDataURL(guiComponent.svg);

        let image = new Image();
        // image.setAttribute('loading', 'lazy');
        // image.setAttribute('decoding', 'async');
        image.src = svgDataUrl;

        image.onload = () =>  {
            // Should dispose and solved the memeory leak:
            guiComponent.htmlTexture.dispose();
            // guiComponent.material.dispose(); /////////// SHOULD Uncomment to solve the memory leak but performance issue.
            guiComponent.throttledDisposeMaterialGUIComponent();
            guiComponent.htmlTexture = new THREE.Texture(image);
            guiComponent.updateTextureConstants();

            if(!guiComponent.htmlTexture.needsUpdate || !guiComponent.material.needsUpdate){
                guiComponent.htmlTexture.needsUpdate = true;
                guiComponent.material.needsUpdate = true; // no need
            }
        
            guiComponent.material.map = guiComponent.htmlTexture;

            // TODO: a user Config to set this or not:
            // guiComponent.material.lightMap = this.texture;
            // guiComponent.material.lightMapIntensity = 1.1;

            image.remove();
            image = null;
        };
    }
    

    public updateVRAim = (meshesToIntersect) => {
        
        if (this.engine.vrControl.controller1Connected) {
            const near = 0;
            const far = 200;
            let controller1Raycaster = new THREE.Raycaster(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), near, far);

            this.engine.vrControl.tempMatrix.identity().extractRotation( this.engine.vrControl.controller1.matrixWorld );
            controller1Raycaster.ray.origin.setFromMatrixPosition( this.engine.vrControl.controller1.matrixWorld );
            controller1Raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( this.engine.vrControl.tempMatrix );
    
            let controller1Intersections = [];
            controller1Intersections = controller1Raycaster.intersectObjects(meshesToIntersect, false);

            if (controller1Intersections.length > 0){
                let newAimingGuiComponent = controller1Intersections[0].object;
                let pointerVector2 = controller1Intersections[0].uv;
    
                this.processAimEvents('controller1', newAimingGuiComponent, pointerVector2, meshesToIntersect);
            }else {
                this.clearAimEvents('controller1', meshesToIntersect);
            }
        }

        if (this.engine.vrControl.controller2Connected) {
            const near = 0;
            const far = 200;
            let controller2Raycaster = new THREE.Raycaster(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), near, far);
            this.engine.vrControl.tempMatrix.identity().extractRotation( this.engine.vrControl.controller2.matrixWorld );
            controller2Raycaster.ray.origin.setFromMatrixPosition( this.engine.vrControl.controller2.matrixWorld );
            controller2Raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( this.engine.vrControl.tempMatrix );
            
            let controller2Intersections = [];
            controller2Intersections = controller2Raycaster.intersectObjects(meshesToIntersect, false);

            if (controller2Intersections.length > 0){
                let newAimingGuiComponent = controller2Intersections[0].object;
                let pointerVector2 = controller2Intersections[0].uv;
    
                this.processAimEvents('controller2', newAimingGuiComponent, pointerVector2, meshesToIntersect);
            }else {
                this.clearAimEvents('controller2', meshesToIntersect);
            }
        }
    }


    public updateAim = (meshesToIntersect) => {
        if (!this.engine.control.controls.isLocked) {
            return;
        }

        let cameraDirection = new THREE.Vector3();
        cameraDirection = this.engine.camera.getWorldDirection(cameraDirection);
        cameraDirection.normalize();
        this.aimRaycaster.ray.origin.copy( this.engine.camera.position );
        this.aimRaycaster.ray.direction.copy( cameraDirection ); 
        
        let intersections = [];
        intersections = this.aimRaycaster.intersectObjects(meshesToIntersect, false);

        if (intersections.length > 0){

            let newAimingGuiComponent = intersections[0].object;
            let pointerVector2 = intersections[0].uv;

            this.processAimEvents('hamster', newAimingGuiComponent, pointerVector2, meshesToIntersect);

        }else {
            // clear only once not infinite times (handled inside the clearAimEvents function)
            this.clearAimEvents('hamster', meshesToIntersect);
        }
    }


    public processAimEvents = (aimType, newAimingGuiComponent, pointerVector2, meshesToIntersect) => {

        newAimingGuiComponent.isAiming = true;
        newAimingGuiComponent.lastAimedProcess = new Date().getTime();

        if (aimType === 'hamster'){
            this.aimingGuiComponent = newAimingGuiComponent;

            this.aimX = pointerVector2.x * this.aimingGuiComponent.rootElement.offsetWidth;
            this.aimY = (1 - pointerVector2.y) * this.aimingGuiComponent.rootElement.offsetHeight;
    
            let newAimingHTMLElement = this.getAimingElement(this.aimX, this.aimY, meshesToIntersect, this.aimingGuiComponent);
            if(this.aimingHTMLElement && newAimingHTMLElement instanceof HTMLElement && !newAimingHTMLElement.isSameNode(this.aimingHTMLElement)) {
                dispatchMouseEvent(this.aimingHTMLElement, 'mouseout', this.aimX, this.aimY);
                dispatchMouseEvent(this.aimingHTMLElement, 'pointerout', this.aimX, this.aimY);
            }
            this.aimingHTMLElement = newAimingHTMLElement;
            if(this.aimingHTMLElement && newAimingHTMLElement instanceof HTMLElement){
                dispatchMouseEvent(this.aimingHTMLElement, 'mouseover', this.aimX, this.aimY);
                dispatchMouseEvent(this.aimingHTMLElement, 'pointerover', this.aimX, this.aimY);
            }
        }

        if (aimType === 'controller1'){
            this.aimingGuiComponentVR11 = newAimingGuiComponent;
            this.aimXVR11 = pointerVector2.x * this.aimingGuiComponentVR11.rootElement.offsetWidth;
            this.aimYVR11 = (1 - pointerVector2.y) * this.aimingGuiComponentVR11.rootElement.offsetHeight;
            
            let newAimingHTMLElement = this.getAimingElement(this.aimXVR11, this.aimYVR11, meshesToIntersect, this.aimingGuiComponentVR11);
            if(this.aimingHTMLElementVR11 && newAimingHTMLElement instanceof HTMLElement && !newAimingHTMLElement.isSameNode(this.aimingHTMLElementVR11)) {
                dispatchMouseEvent(this.aimingHTMLElementVR11, 'mouseout', this.aimXVR11, this.aimYVR11);
                dispatchMouseEvent(this.aimingHTMLElementVR11, 'pointerout', this.aimXVR11, this.aimYVR11);
            }
            this.aimingHTMLElementVR11 = newAimingHTMLElement;
            if(this.aimingHTMLElementVR11 && newAimingHTMLElement instanceof HTMLElement){
                dispatchMouseEvent(this.aimingHTMLElementVR11, 'mouseover', this.aimXVR11, this.aimYVR11);
                dispatchMouseEvent(this.aimingHTMLElementVR11, 'pointerover', this.aimXVR11, this.aimYVR11);
            }
        }

        if (aimType === 'controller2'){
            this.aimingGuiComponentVR22 = newAimingGuiComponent;

            this.aimXVR22 = pointerVector2.x * this.aimingGuiComponentVR22.rootElement.offsetWidth;
            this.aimYVR22 = (1 - pointerVector2.y) * this.aimingGuiComponentVR22.rootElement.offsetHeight;
    
            let newAimingHTMLElement = this.getAimingElement(this.aimXVR22, this.aimYVR22, meshesToIntersect, this.aimingGuiComponentVR22);
            if(this.aimingHTMLElementVR22 && newAimingHTMLElement instanceof HTMLElement && !newAimingHTMLElement.isSameNode(this.aimingHTMLElementVR22)) {
                dispatchMouseEvent(this.aimingHTMLElementVR22, 'mouseout', this.aimXVR22, this.aimYVR22);
                dispatchMouseEvent(this.aimingHTMLElementVR22, 'pointerout', this.aimXVR22, this.aimYVR22);
            }
            this.aimingHTMLElementVR22 = newAimingHTMLElement;
            if(this.aimingHTMLElementVR22 && newAimingHTMLElement instanceof HTMLElement){
                dispatchMouseEvent(this.aimingHTMLElementVR22, 'mouseover', this.aimXVR22, this.aimYVR22);
                dispatchMouseEvent(this.aimingHTMLElementVR22, 'pointerover', this.aimXVR22, this.aimYVR22);
            }
        }
    }


    public clearAimEvents = (aimType, meshesToIntersect) => {

        // TODO: When aiming at no components send clear events to all html elements for all gui components:
        // Maybe later implement this. For now just dispatching clear events recursively on elements from last aimingHTMLElement
        if (this.aimingGuiComponent || this.aimingGuiComponentVR11 || this.aimingGuiComponentVR22) {
            // for (let guiComponent of meshesToIntersect) {
                // callbackOChildrenRecursive(guiComponent.rootElement);
            // }
        }
        
        for (let guiComponent of meshesToIntersect) {
            guiComponent.isAiming = false;
        }

        // Below commented, was not working and hover css was not getting removed after not aiming...
        if (aimType === 'hamster'){
            // This if condition makes it to run only once and not infinite clear events dispatched
            if (this.aimingHTMLElement) {
                dispatchMouseEventRucursive(this.aimingHTMLElement, 'mouseout', this.aimX, this.aimY);
                dispatchMouseEventRucursive(this.aimingHTMLElement, 'pointerout', this.aimX, this.aimY);
            }
            // Not really necessary at this point but still:
            if (this.aimingGuiComponent) {
                dispatchMouseEventRucursive(this.aimingGuiComponent.rootElement, 'mouseout', this.aimX, this.aimY);
                dispatchMouseEventRucursive(this.aimingGuiComponent.rootElement, 'pointerout', this.aimX, this.aimY);
            }
            this.aimingGuiComponent = null;
            this.aimX = null;
            this.aimY = null;
            this.aimingHTMLElement = null;
        }

        if (aimType === 'controller1'){
            // This if condition makes it to run only once and not infinite clear events dispatched
            if (this.aimingHTMLElementVR11) {
                dispatchMouseEventRucursive(this.aimingHTMLElementVR11, 'mouseout', this.aimXVR11, this.aimYVR11);
                dispatchMouseEventRucursive(this.aimingHTMLElementVR11, 'pointerout', this.aimXVR11, this.aimYVR11);
            }
            // Not really necessary at this point but still:
            if (this.aimingGuiComponentVR11) {
                dispatchMouseEventRucursive(this.aimingGuiComponentVR11.rootElement, 'mouseout', this.aimXVR11, this.aimYVR11);
                dispatchMouseEventRucursive(this.aimingGuiComponentVR11.rootElement, 'pointerout', this.aimXVR11, this.aimYVR11);
            }
            this.aimingGuiComponentVR11 = null;
            this.aimXVR11 = null;
            this.aimYVR11 = null;
            this.aimingHTMLElementVR11 = null;
        }
        
        if (aimType === 'controller2'){
            // This if condition makes it to run only once and not infinite clear events dispatched
            if (this.aimingHTMLElementVR22) {
                dispatchMouseEventRucursive(this.aimingHTMLElementVR22, 'mouseout', this.aimXVR22, this.aimYVR22);
                dispatchMouseEventRucursive(this.aimingHTMLElementVR22, 'pointerout', this.aimXVR22, this.aimYVR22);
            }
            // Not really necessary at this point but still:
            if (this.aimingGuiComponentVR22) {
                dispatchMouseEventRucursive(this.aimingGuiComponentVR22.rootElement, 'mouseout', this.aimXVR22, this.aimYVR22);
                dispatchMouseEventRucursive(this.aimingGuiComponentVR22.rootElement, 'pointerout', this.aimXVR22, this.aimYVR22);
            }
            this.aimingGuiComponentVR22 = null;
            this.aimXVR22 = null;
            this.aimYVR22 = null;
            this.aimingHTMLElementVR22 = null;
        }
    }


    // A elementsFromPoint shim: https://gist.github.com/oslego/7265412
    public getAimingElement = (x, y, meshesToIntersect, aimingGuiComponent) => {
        let aimingElm = null;
        this.engine.canvas.style.setProperty('pointer-events', 'none', 'important');

        // Skipping the canvas div wrapper in VR Mode:
        if (this.engine.vrEnabled && this.engine.renderer.xr.isPresenting) {
            this.engine.canvas.parentElement.style.setProperty('pointer-events', 'none', 'important');
        }

        meshesToIntersect.forEach((mesh) => {
            mesh.rootElement.style.setProperty('pointer-events', 'none', 'important');
        });

        aimingGuiComponent.rootElement.style.setProperty('pointer-events', 'initial', 'important');
        aimingElm = document.elementFromPoint(x, y);
        this.engine.canvas.style.setProperty('pointer-events', 'initial', 'important');
        if (this.engine.vrEnabled && this.engine.renderer.xr.isPresenting) {
            this.engine.canvas.parentElement.style.setProperty('pointer-events', 'initial', 'important');
        }
        return aimingElm;
    }


    public bindClickEvents = () => {
        // this is both for click and css active pseudoclasses (also in general dispatching mouse down and up...)
        this.downEventHandled = false;
        this.upEventSent = false;
        this.focusedElement = null; // previous one

        this.boundEvents = true;
        

        if (this.engine.vrEnabled) {
            this.engine.vrControl.controller1.addEventListener( 'selectstart', () => {
                if (!this.engine.renderer.xr.isPresenting) {
                    return;
                }
                this.sendDownEvent(this.aimingHTMLElementVR11, this.aimXVR11, this.aimYVR11);
            });
            
            this.engine.vrControl.controller1.addEventListener( 'selectend', () => {
                if (!this.engine.renderer.xr.isPresenting) {
                    return;
                }
                this.sendUpEvent(this.aimingHTMLElementVR11, this.aimXVR11, this.aimYVR11);
            });
    
            this.engine.vrControl.controller2.addEventListener( 'selectstart', () => {
                if (!this.engine.renderer.xr.isPresenting) {
                    return;
                }
                this.sendDownEvent(this.aimingHTMLElementVR22, this.aimXVR22, this.aimYVR22);
            });
            
            this.engine.vrControl.controller2.addEventListener( 'selectend', () => {
                if (!this.engine.renderer.xr.isPresenting) {
                    return;
                }
                this.sendUpEvent(this.aimingHTMLElementVR22, this.aimXVR22, this.aimYVR22);
            });
        }


        document.addEventListener( 'mousedown', (e) => {
            if (this.engine.renderer.xr.isPresenting) {
                return;
            }
            if (this.downEventHandled){ // to also prevent infinite
                this.downEventHandled = false;
                return;
            }
            if (!this.engine.control.controls.isLocked) {
                return;
            }
            
            this.sendDownEvent(this.aimingHTMLElement, this.aimX, this.aimY);
        });

        document.addEventListener( 'mouseup', (e) => {
            if (this.engine.renderer.xr.isPresenting) {
                return;
            }
            if (this.upEventSent){ // to also prevent infinite
                this.upEventSent = false;
                return;
            }
            if (!this.engine.control.controls.isLocked) {
                return;
            }

            this.sendUpEvent(this.aimingHTMLElement, this.aimX, this.aimY);
        });
    }


    public sendDownEvent = (aimingHTMLElement, aimX, aimY) => {

        if (this.engine && aimingHTMLElement) { // click not captured until gui system executed
            this.downEventHandled = true;
            dispatchMouseEvent(aimingHTMLElement, 'mousedown', aimX, aimY);
            dispatchMouseEvent(aimingHTMLElement, 'pointerdown', aimX, aimY); // TODO: should add more events such as touchend?
            dispatchMouseEvent(aimingHTMLElement, 'focus', aimX, aimY);
            aimingHTMLElement.focus(); // only this focuses on element
            if (this.focusedElement && !this.focusedElement.isSameNode(aimingHTMLElement)) {
                dispatchMouseEvent(this.focusedElement, 'blur', aimX, aimY);
            }

            this.focusedElement = aimingHTMLElement;

            if (isTextBox(this.focusedElement)) {
                this.engine.control.typingMode = true;
            }else {
                this.engine.control.typingMode = false;
            }
        }
    }


    public sendUpEvent = (aimingHTMLElement, aimX, aimY) => {

        if (this.engine && aimingHTMLElement) { // click not captured until gui system executed
            this.upEventSent = true;
            dispatchMouseEvent(aimingHTMLElement, 'mouseup', aimX, aimY);
            dispatchMouseEvent(aimingHTMLElement, 'pointerup', aimX, aimY); // TODO: should add more events such as touchend?
            dispatchMouseEvent(aimingHTMLElement, 'click', aimX, aimY);
            // this.this.aimingHTMLElement.click(); // no need for this
        }
    }
}
