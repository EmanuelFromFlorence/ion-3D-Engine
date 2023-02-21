import * as THREE from 'three';
import { CompleteStyleList, ExcluderKey } from '../core/constants';


export const GUI_COMPONENT_TYPE  = 'gui_1000'


export function getRepeatingTexture(imgDataURI, surfWidth, surfHeight) {
  const texture = new THREE.TextureLoader().load(imgDataURI);
  texture.repeat.set(surfWidth, surfHeight); // (timesToRepeatHorizontally, timesToRepeatVertically)
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}


export function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.crossOrigin = 'anonymous';
    img.decoding = 'sync';
    img.src = url;
  })
}


export function isTextBox(element) {
  let tagName = element.tagName || '';
  tagName = tagName.toLowerCase();
  if (tagName === 'textarea') return true;
  if (tagName !== 'input') return false;
  let type = element.getAttribute('type') || '';
  type = type.toLowerCase();
  // if any of these input types is not supported by a browser, it will behave as input type text.
  let inputTypes = ['text', 'password', 'number', 'email', 'tel', 'url', 'search', 'date', 'datetime', 'datetime-local', 'time', 'month', 'week'];
  return inputTypes.indexOf(type) >= 0;
}


export function isRadioCheckBox(element) {
  let tagName = element.tagName.toLowerCase();
  if (tagName !== 'input') return false;
  let type = element.getAttribute('type').toLowerCase();
  let inputTypes = ['checkbox', 'radio'];
  return inputTypes.indexOf(type) >= 0;
}


export function buildPageStyleString() {
  let pageStyle = ' ';
  for (let stylesheet of document.styleSheets) {
      // console.log(stylesheet);
      for (let cssRule of stylesheet.cssRules){
          pageStyle = `${pageStyle} \n ${cssRule.cssText}`;
      }
  }
  return pageStyle;
}


export function buildPageStyleMap(setPageStyleMap) {

  for (let script of document.scripts) {

    if (script.hasAttribute('src')) {
      let url = '';
      if (script.src.includes('http')) {
        url = script.src;
      } else {
        url = `${window.location.origin}/${script.src}`;
      }

      fetch(url).then((response) => response.body)
      .then((readableStream) => {

        const reader = readableStream.getReader();
        return new ReadableStream({
          start(controller) {
            // The following function handles each data chunk
            function push() {
              // "done" is a Boolean and value a "Uint8Array"
              reader.read().then(({ done, value }) => {
                // If there is no more data to read
                if (done) {
                  // console.log('done', done);
                  controller.close();
                  return;
                }
                // Get the data and send it to the browser via the controller
                controller.enqueue(value);
                // Check chunks by logging to the console
                // console.log(done, value);
                push();
              });
            }
    
            push();
          },
        });
      })
      .then((stream) => {
        // Respond with our stream
        return new Response(stream, { headers: { 'Content-Type': 'text/html' } }).text();
      }).then((textContent) => {
        if (textContent.includes(ExcluderKey)) return;

        /* BUILDING THE STYLE LIST */
        for (let styleName of CompleteStyleList) {
          
          if (textContent.includes(styleName)) {
            
            setPageStyleMap(styleName, true);
            
          }
        }
        
      })
      .catch((err) => {
        console.error(err);
      });

    } else { // if inline script

      for (let styleName of CompleteStyleList) {
        
        if (script.textContent.includes(styleName)) {

          setPageStyleMap(styleName, true);

        }
      }
      

    }
  }
  
  
  /* Hardcoding these so they are always cloned */
  // TODO: maybe later add these too:
  // const leftBorder = getPixelValue(htmlElement, 'border-left-width');
  // const rightBorder = getPixelValue(htmlElement, 'border-right-width');
  // const topBorder = getPixelValue(htmlElement, 'border-top-width');
  // const bottomBorder = getPixelValue(htmlElement, 'border-bottom-width');
  setPageStyleMap('width', true);
  setPageStyleMap('height', true);
  setPageStyleMap('x', false);
  setPageStyleMap('y', false);
  setPageStyleMap('d', false);
  setPageStyleMap('r', false);

}


export function callbackOnChildrenRecursive<T extends HTMLElement>(
  node: T,
  callback: Function,
): void {

  for (const child of node.children) {
    callback(child);
    callbackOnChildrenRecursive(child, callback);
  }

}


export function callbackOnNodesRecursive<T extends HTMLElement>(
  node: T,
  callback: Function,
): void {

  for (const child of node.childNodes) {
    callback(child);
    callbackOnNodesRecursive(child, callback);
  }

}


export const createGUISVGWrapper = (guiComponent) => {
  // nodeToDataURL modification:
  const xmlns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(xmlns, 'svg');
  const foreignObject = document.createElementNS(xmlns, 'foreignObject');

  const { width, height } = getElementSize(guiComponent.rootElement);
  svg.setAttribute('width', `${width}`);
  svg.setAttribute('height', `${height}`);
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('externalResourcesRequired', 'true');
  svg.style.setProperty('pointer-events', 'none', 'important'); 

  svg.id = 'svg_id__' + guiComponent.compId;

  foreignObject.setAttribute('width', '100%');
  foreignObject.setAttribute('height', '100%');
  foreignObject.setAttribute('x', '0');
  foreignObject.setAttribute('y', '0');
  foreignObject.setAttribute('externalResourcesRequired', 'true'); // TODO: check if externalResourcesRequired is needed?
  foreignObject.style.setProperty('pointer-events', 'none', 'important');

  const parentNode = guiComponent.rootElement.parentNode;
  
  svg.appendChild(foreignObject);
  foreignObject.appendChild(guiComponent.rootElement);

  parentNode.appendChild(svg);

  fixElementTopLeft(svg);

  return svg;
}


// // TODO: optimization: appending only style map rules to svg (image loading faster?) 
// // TODO: IMPORTANT: should check if it's better to insert a style tag with id for each element and update only that one for each mutation
export const appendSVGStyle = (svg, pageStyle) => {

  const foreignObject = svg.childNodes[0];
  if (foreignObject.tagName !== 'foreignObject') throw new Error('Could not find foreignObject in SVG!');

  // First removing previous style tag if exists:
  for (let child of foreignObject.childNodes) {
    if (child.tagName.toLowerCase() == 'style') {
        child.remove();
    }
  }

  const style = document.createElement('style');
  style.textContent = pageStyle;
  foreignObject.append(style);

  return svg;
}


export const fixElementTopLeft = (htmlNode) => {
  htmlNode.style.position = 'fixed';
  htmlNode.style.left = '0';
  htmlNode.style.top = '0';
  htmlNode.style.overflow = 'hidden'; // This will not allow the content to exceed the container
  // htmlNode.style.overflow = 'auto'; // This will automatically add scrollbars to the container when...
  htmlNode.style.margin = '0 auto';
};


export const get2DSizeInWorldUnit = (width, height, ratio): any => {
  let unitPX = 100;
  unitPX = unitPX / ratio;

  let widthInWorldUnit = width / unitPX;
  let heightInWorldUnit = height / unitPX;

  return [widthInWorldUnit, heightInWorldUnit];
}


export const processHTMLNodeTree = (htmlNode) => {
  
  processSingleHTMLNode(htmlNode);

  let childNodes = [];
  if (isSlotElement(htmlNode) && htmlNode.assignedNodes) {
    childNodes = Array.from(htmlNode.assignedNodes());
  } else if (isInstanceOfElement(htmlNode, HTMLIFrameElement) && htmlNode.contentDocument?.body) {
    // TODO: should appendChild in another way below in case of IFRAME
    childNodes = Array.from(htmlNode.contentDocument.body.childNodes)
  } else {
    childNodes = Array.from((htmlNode.shadowRoot ?? htmlNode).childNodes)
  }

  for (let childNode of htmlNode.childNodes) {
    processHTMLNodeTree(childNode);
  }

}


export const processSingleHTMLNode = (htmlNode) => {
  if (isInstanceOfElement(htmlNode, HTMLInputElement)) {
    // svg needs to have 'value' attribute
    let attrValue = htmlNode.getAttribute('value');
    if (htmlNode.value && htmlNode.value !== attrValue) {
      htmlNode.setAttribute('value', htmlNode.value);
    }
    
    if (htmlNode.type === 'checkbox' || htmlNode.type === 'radio') {
      // htmlNode.checked default is false and 'checked' attribute default is null
      const checked = htmlNode.getAttribute('checked');
      if (checked !== 'checked' && htmlNode.checked) {
        htmlNode.setAttribute('checked', 'checked');
      }
      if (checked === 'checked' && !htmlNode.checked) {
        htmlNode.removeAttribute('checked');
      }
    }

  }
};


const concatStyle = (preCssText, style, styleName, value) => ` ${preCssText} ${styleName}: ${value} ${style.getPropertyPriority(styleName)}; `;


const isSlotElement = (node: HTMLElement): node is HTMLSlotElement => node.tagName != null && node.tagName.toUpperCase() === 'SLOT';


export function getPixelValue(htmlElement: HTMLElement, styleProperty: string) {
  const win = htmlElement.ownerDocument.defaultView || window;
  const val = win.getComputedStyle(htmlElement).getPropertyValue(styleProperty);
  return val ? parseFloat(val.replace('px', '')) : 0;
}


// TODO: what about outline width??
export function getElementSize(htmlElement: HTMLElement) {
  // const leftBorder = getPixelValue(htmlElement, 'border-left-width');
  // const rightBorder = getPixelValue(htmlElement, 'border-right-width');
  // const topBorder = getPixelValue(htmlElement, 'border-top-width');
  // const bottomBorder = getPixelValue(htmlElement, 'border-bottom-width');  
  // const width = htmlElement.clientWidth + leftBorder + rightBorder;
  // const height = htmlElement.clientHeight + topBorder + bottomBorder;

  let rect = htmlElement.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  return { width, height };
}


// export async function cloneCanvasElement(canvas: HTMLCanvasElement) {
//   const dataURL = canvas.toDataURL()
//   if (dataURL === 'data:,') {
//     return canvas.cloneNode(false) as HTMLCanvasElement
//   }
//   return createImage(dataURL)
// }


// export async function cloneVideoElement(video: HTMLVideoElement, options) {
//   const poster = video.poster;
//   const contentType = getMimeType(poster);
//   const dataURL = await resourceToDataURL(poster, contentType, options);
//   return createImage(dataURL);
// }


// export function cloneInputValue<T extends HTMLElement>(nativeNode: T, clonedNode: T) {
//   if (nativeNode instanceof HTMLTextAreaElement) {
//     clonedNode.innerHTML = nativeNode.value
//   }
//   if (nativeNode instanceof HTMLInputElement) {
//     clonedNode.setAttribute('value', nativeNode.value)
//   }
// }


// export function cloneSelectValue<T extends HTMLElement>(nativeNode: T, clonedNode: T) {
//   if (nativeNode instanceof HTMLSelectElement) {
//     const clonedSelect = clonedNode as any as HTMLSelectElement
//     const selectedOption = Array.from(clonedSelect.children).find(
//       (child) => nativeNode.value === child.getAttribute('value'),
//     )

//     if (selectedOption) {
//       selectedOption.setAttribute('selected', '')
//     }
//   }
// }


export const isInstanceOfElement = (node, instance) => {
  if (node instanceof instance) return true;
  const nodePrototype = Object.getPrototypeOf(node);
  if (!nodePrototype) return false;
  return (nodePrototype.constructor.name === instance.name || isInstanceOfElement(nodePrototype, instance));
}


export async function svgToDataURL(svg: SVGElement): Promise<string> {
  return Promise.resolve()
    .then(() => new XMLSerializer().serializeToString(svg))
    .then(encodeURIComponent)
    .then((html) => `data:image/svg+xml;charset=utf-8,${html}`)
}
