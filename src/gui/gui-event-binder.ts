import * as THREE from 'three';
import { getRandomInt } from "../core/utils/utils";


const HOVER_REGXP = /.*:.*hover/;
const ACTIVE_REGXP = /.*:.*active/;
const FOCUS_REGXP = /.*:.*focus/;
const CHECKED_REGXP = /.*:.*checked/;
const ENABLED_REGXP = /.*:.*enabled/;


// export function bindEvents(rootElement: any){ // <T extends HTMLElement>

//     for (let child of rootElement.children) { // rootElement.childNodes
//         // child is Element type now

//         // https://stackoverflow.com/questions/11495535/why-doesnt-getcomputedstyle-work-with-pseudo-classes-like-hover

//         if(child.id == 'btn_1'){
//             // Not possible to get pseudo class: https://stackoverflow.com/questions/11495535/why-doesnt-getcomputedstyle-work-with-pseudo-classes-like-hover
//             // console.log(window.getComputedStyle(child, ':hover'));
//         }
        
//         bindEvents(child);
//     }
// }


function convertPseudoCSSStyleRule(cssRule: any, pseudoClass: string): any{
    let originalSelector = cssRule.selectorText.split(':')[0];
    let newRule = '';
    let ionClass = `ion__${getRandomInt(100, 10000000)}__${pseudoClass}`;
    newRule = `.${ionClass} { ${cssRule.style.cssText} }`;
    return [originalSelector, ionClass, newRule];
}


function bindToggleEvents(originalSelector: string, ionClass: string, onEvent: string, offEvent: string): void{
    let elements = document.querySelectorAll(originalSelector);
    for (let element of elements) {
        element.addEventListener(onEvent, (e: any) => {
            element.classList.add(ionClass);
        });
        element.addEventListener(offEvent, (e: any) => {
            element.classList.remove(ionClass);
        });
    }
}


// Should finish and test in the future::
function bindDOMCaptureToggleEvents(originalSelector: string, ionClass: string, onEvent: string, offEvent: string): void{
    let elements = document.querySelectorAll(originalSelector);
    // let totalClassList = [];
    let focusedElm = null;
    for (let element of elements) {
        // totalClassList = totalClassList.concat(Array.from(element.classList));
        element.addEventListener(onEvent, (e: any) => {
            if(focusedElm === null || !e.target.isSameNode(focusedElm)) {
                focusedElm.classList.remove(ionClass);
            }
            element.classList.add(ionClass);
            focusedElm = element;
        });
    }

    // // focus changes only when other elements are focused
    // // Capturing events up in parent (event delegation)
    // // remove the ion focus class of all elements except the one event is dispatched on
    // rootElement.addEventListener(onEvent, (e: any) => {
    //     elements.forEach((element) => {
    //         if(!e.target.isSameNode(element)) {
    //             element.classList.remove(ionClass);
    //         }
    //     });
    // });
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
                    bindToggleEvents(originalSelector, ionClass, 'mouseover', 'mouseout');
                    break;

                case cssRule instanceof CSSStyleRule && ACTIVE_REGXP.test(cssRule.selectorText):
                    [originalSelector, ionClass, newRule] = convertPseudoCSSStyleRule(cssRule, 'active');
                    newCSSRules.push(newRule);
                    // DOMActivate which is Deprecated in favor of click
                    bindToggleEvents(originalSelector, ionClass, 'mousedown', 'mouseup');
                    break;
                
                case cssRule instanceof CSSStyleRule && FOCUS_REGXP.test(cssRule.selectorText):
                    [originalSelector, ionClass, newRule] = convertPseudoCSSStyleRule(cssRule, 'focus');
                    newCSSRules.push(newRule);
                    bindDOMCaptureToggleEvents(originalSelector, ionClass, 'focus', 'blur');
                    break;
                                
                case cssRule instanceof CSSStyleRule && CHECKED_REGXP.test(cssRule.selectorText):
                    [originalSelector, ionClass, newRule] = convertPseudoCSSStyleRule(cssRule, 'checked');
                    newCSSRules.push(newRule);
                    // Custom events:
                    bindToggleEvents(originalSelector, ionClass, 'checked', 'unchecked');
                    break;
                
                case cssRule instanceof CSSStyleRule && ENABLED_REGXP.test(cssRule.selectorText):
                    [originalSelector, ionClass, newRule] = convertPseudoCSSStyleRule(cssRule, 'enabled');
                    newCSSRules.push(newRule);
                    // Custom events:
                    bindToggleEvents(originalSelector, ionClass, 'enabled', 'disabled');
                    break;
                
                // All CSSRule types: https://developer.mozilla.org/en-US/docs/Web/API/CSSRule
                case cssRule instanceof CSSMediaRule: 
                    break;
                case cssRule instanceof CSSKeyframesRule: 
                    break;

                default:
                    console.warn('DEFAULT in bindCSSEvents!!');
                    // console.log(cssRule);
                    break;
            };
        }
        newCSSRules.forEach((newRule) => {
            stylesheet.insertRule(newRule);
        });
    }
    

    // setTimeout(() => {
        
    //     // let node = document.getElementsByClassName('App-header')[0];
    //     let node = document.getElementById('btn_1');
    //     let pointerVector2 = new THREE.Vector2(0.5, 0.5);

    //     const mouseEvent = new MouseEvent("mouseover", {
    //         view: window,
    //         bubbles: true,
    //         cancelable: true,
    //         offsetX: node.scrollWidth * pointerVector2.x, // node.scrollWidth mnot what we want ultimately because of scrolling and overflow...
    //         offsetY: node.scrollHeight * pointerVector2.y,

    //         clientX: node.scrollWidth * pointerVector2.x, // node.scrollWidth mnot what we want ultimately because of scrolling and overflow...
    //         clientY: node.scrollHeight * pointerVector2.y,

    //         screenX: node.scrollWidth * pointerVector2.x, // node.scrollWidth mnot what we want ultimately because of scrolling and overflow...
    //         screenY: node.scrollHeight * pointerVector2.y,

    //         pageX: node.scrollWidth * pointerVector2.x, // node.scrollWidth mnot what we want ultimately because of scrolling and overflow...
    //         pageY: node.scrollHeight * pointerVector2.y,
    //     });
    //     // console.log(node.scrollWidth * pointerVector2.x);

    //     console.log(node);
        
        
    //     // for (let i=0;i<10000;i++){
    //     //     node.dispatchEvent(mouseEvent);
    //     // }
        
    //     node.dispatchEvent(mouseEvent);
        
        
    //     // var event2 = document.createEvent("MouseEvents");
    //     // event2.initMouseEvent("mouseover", true, true, window,
    //     // 1, 1, 1, 1, 1,
    //     // false, false, false, false,
    //     // 0, null);
    //     // node.dispatchEvent(event2);

    // }, 1000);

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


// export function bindClickEvents() {
//     document.addEventListener( 'click', onKeyDown );

//     // const onKeyDown = ( event ) => {
//     //     console.log(event.code);
        

//     //     if ( event.altKey ) return;

//     //     switch ( event.code ) {
//     //         case 'ShiftLeft':
//     //         case 'ShiftRight': this.movementSpeedMultiplier = .1; break;
//     //     }
//     // }

//     // const onKeyUp = ( event ) => {
//     //     switch ( event.code ) {
//     //     }
//     // }

//     // document.addEventListener( 'click', onKeyDown );

// }
