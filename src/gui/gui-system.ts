import * as THREE from 'three';
import { System } from '../core/systems/system';
import { GUI_COMPONENT_TYPE, isTextBox, buildPageStyleString, buildPageStyleList } from './utils';
import { bindCSSEvents, dispatchMouseEvent, dispatchMouseEventRucursive } from './gui-event-binder';
import { Engine } from '../ion-3d-engine';
import { throttle } from '../core/utils/utils';
import { getImageSize, svgToDataURL } from './html-to-image/util';
import { cloneNode } from './html-to-image/clone-node';
import { embedWebFonts } from './html-to-image/embed-webfonts';
import { embedImages } from './html-to-image/embed-images';
import { applyStyle } from './html-to-image/apply-style';


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
    }


    public initRaycaster = () => {
        const raycasterOrigin = new THREE.Vector3(0, 0, 0);
        const raycasterDirection = new THREE.Vector3(0, - 2, 0);
        const near = 0;
        const far = 200;
        this.aimRaycaster = new THREE.Raycaster(raycasterOrigin, raycasterDirection, near, far);
    }

    
    public initTrottledMethods = () => {
        this.throttledUpdateAim = throttle((meshesToIntersectArg) => this.updateAim(meshesToIntersectArg), 10);
        this.throttledUpdateVRAim = throttle((meshesToIntersectArg) => this.updateVRAim(meshesToIntersectArg), 10);
    }


    public initUIEvents = () => {
        bindCSSEvents();
        this.pageStyle = buildPageStyleString();

        buildPageStyleList((styleName, value) => {
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

            await this.initGUIComponentObverver(guiComponent);

            meshesToIntersect.push(guiComponent);
        }


        if(engine.vrEnabled && engine.renderer.xr.isPresenting) {
            this.throttledUpdateVRAim(meshesToIntersect);
        }else {
            this.throttledUpdateAim(meshesToIntersect);
        }
        
    }


    public initGUIComponentObverver = async (guiComponent) => {

        if(!guiComponent.onMutation) {

            // Should only run once and for each guiComponent otherwise it also throttles updating different guiComponents as we iterate over them:
            guiComponent.throttledUpdateHTMLImage = throttle((guiCompArg, htmlElementArg, htmlToImageOptionsArg, guiOptionsArg) => this.updateGUIComponentSVGAndTexture(guiCompArg, htmlElementArg, htmlToImageOptionsArg, guiOptionsArg), 100);

            // Calling these once in the beginning:
            guiComponent.svg = await this.createGUIComponentSVG(guiComponent, guiComponent.rootElement, { filter: guiComponent.htmlFilter, addId: true });
            this.updateGUIComponentTexture(guiComponent);

            // Callback function to execute when mutations are observed
            guiComponent.onMutation = (mutationList, observer) => {
                // TODO: optimizng by sending and processing the whole mutationList
                for (const mutation of mutationList) {
                    
                    // update only on updates (users can choose to be like this by passing options)
                    if (guiComponent.renderTimeout < 1) {
                        guiComponent.throttledUpdateHTMLImage(guiComponent, mutation.target, { filter: guiComponent.htmlFilter, addId: false }, { 'pageStyleMap': this.pageStyleMap, });
                    }
                    
                    // Tested without throttling and it significantly impacts the FPS
                    // this.updateGUIComponentSVGAndTexture(guiComponent, mutation.target, { filter: guiComponent.htmlFilter, addId: false }, { 'pageStyleMap': this.pageStyleMap, });
                    
                }
            };

            const observer = new MutationObserver(guiComponent.onMutation);
            observer.observe(guiComponent.rootElement, { attributes: true, childList: true, subtree: false });
            // Later, you can stop observing
            // observer.disconnect();
        }

        // updating and rendering gui texture for a duration after not aiming to the gui components
        let currentTime = new Date().getTime();
        if (!guiComponent.lastProcess) guiComponent.lastProcess = new Date().getTime();
        let duration = currentTime - guiComponent.lastProcess;
        // runs for initially for the duration too. (if not needed change the initial value in guiComponent init func)
        // isAiming and lastProcess are now associated with each component

        if (guiComponent.renderTimeout > 1000000000) {
            guiComponent.throttledUpdateHTMLImage(guiComponent, guiComponent.rootElement, { filter: guiComponent.htmlFilter, addId: false }, { 'pageStyleMap': this.pageStyleMap, });
        } else if (!guiComponent.isAiming && duration < guiComponent.renderTimeout ) {            
            guiComponent.throttledUpdateHTMLImage(guiComponent, guiComponent.rootElement, { filter: guiComponent.htmlFilter, addId: false }, { 'pageStyleMap': this.pageStyleMap, });
        }

    }


    // TODO: htmlToImageOptions should be configured by user
    public createGUIComponentSVG = async (guiComponent, htmlElement, htmlToImageOptions) => {
        const { width, height } = getImageSize(htmlElement, htmlToImageOptions);
        const clonedNode = await this.processHTMLNode(htmlElement, htmlToImageOptions, { 'pageStyleMap': this.pageStyleMap, });        
        const svg = this.createSVGDocument(guiComponent, clonedNode, width, height);
        return svg;
    }


    // TODO: put this as an arrow function when defining as throttled function...
    public updateGUIComponentSVGAndTexture = async (guiComponent, node, htmlToImageOptions, guiOptions) => {
        this.updateNodeInSVG(guiComponent, node, htmlToImageOptions, guiOptions);
        this.updateGUIComponentTexture(guiComponent);
    }


    public updateGUIComponentTexture = async (guiComponent) => {
        const svgDataUrl = await svgToDataURL(guiComponent.svg);
        const image = new Image();
        image.src = svgDataUrl;

        image.onload = () =>  {
            guiComponent.htmlTexture.dispose(); // TODO: check if working correctly
            guiComponent.htmlTexture = new THREE.Texture(image);

            if(!guiComponent.htmlTexture.needsUpdate || !guiComponent.material.needsUpdate){
                guiComponent.htmlTexture.needsUpdate = true;
                guiComponent.material.needsUpdate = true;
            }
        
            guiComponent.material.map = guiComponent.htmlTexture;
        };
    }


    public updateNodeInSVG = async (guiComponent, node, htmlToImageOptions, guiOptions) => {
        const clonedNode = await this.processHTMLNode(node, htmlToImageOptions, guiOptions) as HTMLElement;
        // In case data attr:
        const id = clonedNode.dataset.guiSvgId;        
        const oldNode = guiComponent.svg.querySelector(`[data-gui-svg-id = "${id}"]`);

        oldNode.replaceWith(clonedNode);
        this.appendPageStyle(guiComponent.svg);
    }


    public processHTMLNode = async (node, htmlToImageOptions, guiOptions) => {
        // toSVG modification:
        const clonedNode = (await cloneNode(node, htmlToImageOptions, guiOptions, true)) as HTMLElement; // overwrites width and height!!!
        await embedWebFonts(clonedNode, htmlToImageOptions);
        await embedImages(clonedNode, htmlToImageOptions);
        applyStyle(clonedNode, htmlToImageOptions);
        return clonedNode;
    }


    public createSVGDocument = (guiComponent, node, width, height) => {
        // nodeToDataURL modification:
        const xmlns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(xmlns, 'svg');
        const foreignObject = document.createElementNS(xmlns, 'foreignObject');

        svg.setAttribute('width', `${width}`);
        svg.setAttribute('height', `${height}`);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

        foreignObject.setAttribute('width', '100%');
        foreignObject.setAttribute('height', '100%');
        foreignObject.setAttribute('x', '0');
        foreignObject.setAttribute('y', '0');
        foreignObject.setAttribute('externalResourcesRequired', 'true');

        svg.appendChild(foreignObject);
        foreignObject.appendChild(node);
        
        this.appendPageStyle(svg);
        
        return svg;
    }


    public appendPageStyle = (node) => {
        // First removing previous style tag if exists:
        for (let child of node.childNodes) {
            if (child.tagName.toLowerCase() == 'style') {
                child.remove();
            }
        }
        const style = document.createElement('style');
        style.textContent = this.pageStyle;
        node.append(style);
        return node;
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
        newAimingGuiComponent.lastProcess = new Date().getTime();

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
                // callbackOnNodesRecursive(guiComponent.rootElement);
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
                dispatchMouseEventRucursive(this.aimingHTMLElementVR11.rootElement, 'mouseout', this.aimXVR11, this.aimYVR11);
                dispatchMouseEventRucursive(this.aimingHTMLElementVR11.rootElement, 'pointerout', this.aimXVR11, this.aimYVR11);
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
                dispatchMouseEventRucursive(this.aimingHTMLElementVR22.rootElement, 'mouseout', this.aimXVR22, this.aimYVR22);
                dispatchMouseEventRucursive(this.aimingHTMLElementVR22.rootElement, 'pointerout', this.aimXVR22, this.aimYVR22);
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

            // this.aimingGuiComponent.rootElement.style.zIndex = 10000000000000;
        }
    }
}
