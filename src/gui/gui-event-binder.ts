import { setIONClass } from "./utils";

const HOVER_REGXP = /.*:.*hover/;
const ACTIVE_REGXP = /.*:.*active/;
const VISITED_REGXP = /.*:.*visited/;
const LINK_REGXP = /.*:.*link/;
const FOCUS_REGXP = /.*:.*focus/;
const CHECKED_REGXP = /.*:.*checked/;
const ENABLED_REGXP = /.*:.*enabled/;



function copyStyleObject(style: CSSStyleDeclaration) {
    let styleCopy = {};
    for (let i = 0; i<style.length; i++) {
        let propName = style.item(i);
        let propValue = style.getPropertyValue(propName);
        let propPriority = style.getPropertyPriority(propName);
        styleCopy[propName] = {propValue, propPriority};
    }
    
    return styleCopy;
}


function getNewStyleMap(newStyle: CSSStyleDeclaration) {
    let newStyleMap = {};
    // only considering the mutating style props (deltas):
    for (let i = 0; i<newStyle.length; i++) {
        let propName = newStyle.item(i);
        let propValue = newStyle.getPropertyValue(propName);
        let propPriority = newStyle.getPropertyPriority(propName);
        newStyleMap[propName] = {propValue, propPriority};
    }
    return newStyleMap;
}


function getOldStyleMap(newStyleMap: any, oldStyle: CSSStyleDeclaration) {
    let oldStyleMap = {};
    for (let propName of Object.keys(newStyleMap)) {
        let propValue = oldStyle.getPropertyValue(propName);
        let propPriority = oldStyle.getPropertyPriority(propName);
        oldStyleMap[propName] = {propValue, propPriority};
    }
    return oldStyleMap;
}


// TODO: optimization: looping and setProperty is slow let's try styles.cssText later... it sets all styles auto
// TODO: should use the same pageStyleMap for updating these...
function setStylesOneByOne(element, style: any) {
    for (let [propName, values] of Object.entries(style)) {
        element.style.setProperty(propName, values.propValue, values.propPriority);
    }
}


function bindToggleEvents(originalSelector: string, pseudoName: string, pseudoCSSRule: CSSStyleRule, onEvent: string, offEvent: string, callbackPageSVGStyleMap): void{
    let elements = document.querySelectorAll(originalSelector);
    if (!elements || elements.length === 0) return;
    // saving original values for each element:
    let oldStyleMapList = [[...Array(elements.length).keys()].map(() => null)];
    let newStyleMap = getNewStyleMap(pseudoCSSRule.style); // newStyleMap is pseudo css rules...

    let flagsIfOnEventProcessed = [...Array(elements)].map(() => false);
    for (let [i, element] of elements.entries()) {
        // skip if already processed
        // TODO: not a good idea what if we have two hovers css rules...
        // if (element.dataset['ion_pseudo__' + pseudoName]) continue;

        // Making sure it already has ionClass:
        setIONClass(element);
        callbackPageSVGStyleMap(element, newStyleMap);
        
        oldStyleMapList[i] = getOldStyleMap(newStyleMap, element.style);

        element.addEventListener(onEvent, (e: any) => {
            if (!flagsIfOnEventProcessed[i]) {
                flagsIfOnEventProcessed[i] = true;
                setStylesOneByOne(element, newStyleMap);
            }
        });
        element.addEventListener(offEvent, (e: any) => {
            flagsIfOnEventProcessed[i] = false;
            setStylesOneByOne(element, oldStyleMapList[i]);
        });

        // element.dataset['ion_pseudo__' + pseudoName] = true;
    }
}


export function bindCSSEvents(callbackPageSVGStyleMap){ // <T extends HTMLElement>
    for (let stylesheet of document.styleSheets){
        for (let cssRule of stylesheet.cssRules){
            // cssRule.selectorText
            // cssRule.cssText
            // cssRule.style
            // cssRule.style.cssText

            // https://www.w3schools.com/css/css_pseudo_classes.asp
            // https://davidwalsh.name/dom-events-javascript
            // https://www.w3schools.com/jsref/obj_mouseevent.asp
            // https://www.w3schools.com/jsref/obj_uievent.asp
            let originalSelector;
            switch ( true ) {
                case cssRule instanceof CSSStyleRule && HOVER_REGXP.test(cssRule.selectorText):
                    originalSelector = cssRule.selectorText.split(':')[0];
                    // (mouseenter/mouseleave) = (mouseover/mouseout)
                    bindToggleEvents(originalSelector, 'hover', cssRule, 'mouseover', 'mouseout', callbackPageSVGStyleMap);
                    bindToggleEvents(originalSelector, 'hover', cssRule, 'pointerover', 'pointerout', callbackPageSVGStyleMap);
                    break;

                case cssRule instanceof CSSStyleRule && ACTIVE_REGXP.test(cssRule.selectorText):
                    originalSelector = cssRule.selectorText.split(':')[0];
                    // DOMActivate which is Deprecated in favor of click
                    bindToggleEvents(originalSelector, 'active', cssRule, 'mousedown', 'mouseup', callbackPageSVGStyleMap);
                    bindToggleEvents(originalSelector, 'active', cssRule, 'pointerdown', 'pointerup', callbackPageSVGStyleMap);
                    break;
                
                case cssRule instanceof CSSStyleRule && VISITED_REGXP.test(cssRule.selectorText):
                    originalSelector = cssRule.selectorText.split(':')[0];
                    // Custom events:
                    bindToggleEvents(originalSelector, 'visited', cssRule, 'visited', 'undovisited', callbackPageSVGStyleMap);
                    break;
                
                case cssRule instanceof CSSStyleRule && LINK_REGXP.test(cssRule.selectorText):
                    originalSelector = cssRule.selectorText.split(':')[0];
                    // Custom events:
                    bindToggleEvents(originalSelector, 'link', cssRule, 'link', 'unlink', callbackPageSVGStyleMap);
                    break;
                
                case cssRule instanceof CSSStyleRule && FOCUS_REGXP.test(cssRule.selectorText):
                    originalSelector = cssRule.selectorText.split(':')[0];
                    bindToggleEvents(originalSelector, 'focus', cssRule, 'focus', 'blur', callbackPageSVGStyleMap);
                    // bindDOMCaptureToggleEvents(originalSelector, 'focus', 'focus', 'blur');
                    break;
                                
                case cssRule instanceof CSSStyleRule && CHECKED_REGXP.test(cssRule.selectorText):
                    originalSelector = cssRule.selectorText.split(':')[0];
                    // Custom events:
                    bindToggleEvents(originalSelector, 'checked', cssRule, 'checked', 'unchecked', callbackPageSVGStyleMap);
                    break;
                
                case cssRule instanceof CSSStyleRule && ENABLED_REGXP.test(cssRule.selectorText):
                    originalSelector = cssRule.selectorText.split(':')[0];
                    // Custom events for users to send these in case want to enable or disable input element:
                    bindToggleEvents(originalSelector, 'enabled', cssRule, 'enabled', 'disabled', callbackPageSVGStyleMap);
                    break;
                
                // All CSSRule types: https://developer.mozilla.org/en-US/docs/Web/API/CSSRule
                case cssRule instanceof CSSMediaRule: 
                    break;
                case cssRule instanceof CSSKeyframesRule: 
                    break;

                default:
                    console.debug('DEFAULT in bindCSSEvents!!');
                    break;
            };
        }
    }
}


export function dispatchMouseEvent(element, event, clientX, clientY) {
    const mouseEvent = new MouseEvent(event, {
        view: window,
        bubbles: true,
        cancelable: true,
        // https://stackoverflow.com/a/63611994
        clientX,
        clientY,
    });
    element.dispatchEvent(mouseEvent);
}


export function dispatchMouseEventRucursive(element, event, clientX, clientY) {
    for (const child of element.children) {
        dispatchMouseEvent(child, event, clientX, clientY);
        dispatchMouseEventRucursive(child, event, clientX, clientY);
      }
}

