import * as THREE from 'three';
import { getRandomInt } from "../core/utils/utils";


const HOVER_REGXP = /.*:.*hover/;
const ACTIVE_REGXP = /.*:.*active/;
const VISITED_REGXP = /.*:.*visited/;
const LINK_REGXP = /.*:.*link/;
const FOCUS_REGXP = /.*:.*focus/;
const CHECKED_REGXP = /.*:.*checked/;
const ENABLED_REGXP = /.*:.*enabled/;


function convertPseudoCSSStyleRule(cssRule: any, pseudoClass: string): any{
    let originalSelector = cssRule.selectorText.split(':')[0];
    let newRule = '';
    let ionClass = `ion__${getRandomInt(100, 10000000)}__${pseudoClass}`;
    newRule = `.${ionClass} { ${cssRule.style.cssText} }`;
    return [originalSelector, ionClass, newRule];
}


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
        // let oldPropValue = oldStyle.getPropertyValue(propName);
        // let oldPropPriority = oldStyle.getPropertyPriority(propName);
        newStyleMap[propName] = {propValue, propPriority}; // , oldPropValue, oldPropPriority
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


function bindToggleEvents(originalSelector: string, ionClass: string, cssRule: CSSStyleRule, onEvent: string, offEvent: string): void{
    let elements = document.querySelectorAll(originalSelector);
    // saving original values for each element:
    let oldStyleMapList = [[...Array(elements.length).keys()].map(() => null)];
    let newStyleMap = getNewStyleMap(cssRule.style);

    for (let [i, element] of elements.entries()) {
        oldStyleMapList[i] = getOldStyleMap(newStyleMap, element.style); // window.getComputedStyle(element)
        
        element.addEventListener(onEvent, (e: any) => {
            setStylesOneByOne(element, newStyleMap);
            element.classList.add(ionClass);            
        });
        element.addEventListener(offEvent, (e: any) => {
            setStylesOneByOne(element, oldStyleMapList[i]);
            element.classList.remove(ionClass);
        });
    }
}


export function bindCSSEvents(){ // <T extends HTMLElement>
    for (let stylesheet of document.styleSheets){
        let newCSSRules = [];
        for (let cssRule of stylesheet.cssRules){
            // cssRule.selectorText
            // cssRule.cssText
            // cssRule.style
            // cssRule.style.cssText

            // https://www.w3schools.com/css/css_pseudo_classes.asp
            // https://davidwalsh.name/dom-events-javascript
            // https://www.w3schools.com/jsref/obj_mouseevent.asp
            // https://www.w3schools.com/jsref/obj_uievent.asp
            switch ( true ) {
                case cssRule instanceof CSSStyleRule && HOVER_REGXP.test(cssRule.selectorText):
                    let [originalSelector, ionClass, newRule] = convertPseudoCSSStyleRule(cssRule, 'hover');
                    newCSSRules.push(newRule);
                    // (mouseenter/mouseleave) = (mouseover/mouseout)
                    bindToggleEvents(originalSelector, ionClass, cssRule, 'mouseover', 'mouseout');
                    bindToggleEvents(originalSelector, ionClass, cssRule, 'pointerover', 'pointerout');
                    break;

                case cssRule instanceof CSSStyleRule && ACTIVE_REGXP.test(cssRule.selectorText):
                    [originalSelector, ionClass, newRule] = convertPseudoCSSStyleRule(cssRule, 'active');
                    newCSSRules.push(newRule);
                    // DOMActivate which is Deprecated in favor of click
                    bindToggleEvents(originalSelector, ionClass, cssRule, 'mousedown', 'mouseup');
                    bindToggleEvents(originalSelector, ionClass, cssRule, 'pointerdown', 'pointerup');
                    break;
                
                case cssRule instanceof CSSStyleRule && VISITED_REGXP.test(cssRule.selectorText):
                    [originalSelector, ionClass, newRule] = convertPseudoCSSStyleRule(cssRule, 'visited');
                    newCSSRules.push(newRule);
                    // Custom events:
                    bindToggleEvents(originalSelector, ionClass, cssRule, 'visited', 'undovisited');
                    break;
                
                case cssRule instanceof CSSStyleRule && LINK_REGXP.test(cssRule.selectorText):
                    [originalSelector, ionClass, newRule] = convertPseudoCSSStyleRule(cssRule, 'link');
                    newCSSRules.push(newRule);
                    // Custom events:
                    bindToggleEvents(originalSelector, ionClass, cssRule, 'link', 'unlink');
                    break;
                
                case cssRule instanceof CSSStyleRule && FOCUS_REGXP.test(cssRule.selectorText):
                    [originalSelector, ionClass, newRule] = convertPseudoCSSStyleRule(cssRule, 'focus');
                    newCSSRules.push(newRule);
                    bindToggleEvents(originalSelector, ionClass, cssRule, 'focus', 'blur');
                    // bindDOMCaptureToggleEvents(originalSelector, ionClass, 'focus', 'blur');
                    break;
                                
                case cssRule instanceof CSSStyleRule && CHECKED_REGXP.test(cssRule.selectorText):
                    [originalSelector, ionClass, newRule] = convertPseudoCSSStyleRule(cssRule, 'checked');
                    newCSSRules.push(newRule);
                    // Custom events:
                    bindToggleEvents(originalSelector, ionClass, cssRule, 'checked', 'unchecked');
                    break;
                
                case cssRule instanceof CSSStyleRule && ENABLED_REGXP.test(cssRule.selectorText):
                    [originalSelector, ionClass, newRule] = convertPseudoCSSStyleRule(cssRule, 'enabled');
                    newCSSRules.push(newRule);
                    // Custom events for users to send these in case want to enable or disable input element:
                    bindToggleEvents(originalSelector, ionClass, cssRule, 'enabled', 'disabled');
                    break;
                
                // All CSSRule types: https://developer.mozilla.org/en-US/docs/Web/API/CSSRule
                case cssRule instanceof CSSMediaRule: 
                    break;
                case cssRule instanceof CSSKeyframesRule: 
                    break;

                default:
                    console.debug('DEFAULT in bindCSSEvents!!');
                    // console.log(cssRule);
                    break;
            };
        }
        newCSSRules.forEach((newRule) => {
            stylesheet.insertRule(newRule);
        });
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

