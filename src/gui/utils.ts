import * as THREE from 'three';
import { CompleteStyleList, ExcluderKey } from '../core/constants';
import { createCirclePoints, createCubicPoints, createGlowMaterial } from '../nodes/utils';


export const GUI_COMPONENT_TYPE  = 'gui_1000'


const setDefault = (x: any): boolean => x !== false && ( x === undefined || x === null || x === true );


// A default scene creator
export function createGUITemplateScene({
    background = null,
    surfaces = null,
    lights = null,
    horizonGlow = null,
    points = null,
    size = 200,
    fog = null,
  } = {}): THREE.Scene{
    let scene = new THREE.Scene();
    const backgroundColor = '#7f94a7'; // #eef7ff

    if (setDefault(background)) {
      background = new THREE.Color( backgroundColor ); // '#a0a0a0' // scene.fog = new THREE.Fog( '#a0a0a0', 200, 1000 ); // 9cb8c6
    }
    scene.background = background;

    if (setDefault(surfaces)) {
      surfaces = new THREE.Object3D();
      
      let textureImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAI1HpUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHjarVlrdvMgDv2vVcwSQIjXcnieMzuY5c8VtlM3Tb6kcePWOICFpKsHIjT+999J/8FH2CUSH1PIIRh8JEvmgodktk9Zd2tk3denHWP2ez/dBhhdDq3bvqaw9w/0M+bz3t92OgX9/kQoj32gfh8oOyFO+wJ7/7GQs9sCpu+Eyk7I8b6ybN/rvnLIKZ5F2N9T8e3ern/Sm7jIwQcbBXdhE2PIeE5sJEJvXRmdjbO+5+tG5/47HVMZPPFw1pl1l41Lt/0X9DDuEAjzrAt4Fpdxdy4u/RoCZGABnOddt8PctPlNN0f75EPviLWbwze4b0+7GdCPgTszCGPvd3fohVu7+ul+wPrHcC9MTxxFuS3M3ziCluc3odPX/5w9zTk26YoEiBx2oQ5JLC0oZ69qBOu1gCvi3+M5rivjSnCXBhvrppmKq9lsWRe3YrstdpId66HZBh6FB0e0zI3d6kvAInNT4AE4Ljs5AvjuEgyiwVQcenlO2nmxa9281ms2YeVuMZUtiKkNvbzonUn/uuZUX7KWdp+xG8Csbgg2FDm9YxoQsXNXql8KPq7vBrkD6wChX2pOELCYupGo3n7ZlltAO8zzaDfntrFv7yshwdoezFgHCEywzttgTWSO1kKRCQAVaxI74QoErPfcwSSLcwHYwAmwNOGdaNdc9rz1I0oCCQ/XjMAGrgmwRDzsJ0qCDRXvvHjvg48++exLcEEIHhZCDBpuS3RRoo8hxphijiW5JMmnkGJKKaeSOTtEY5/hjjnlnEvBmgWUS6CC+QU9laurUn0NNdZUcy0N5tOk+RZabKnlVjp31+HHPfTYU8+9DDtgSkOGpxFGHGnkUSZsbbop088w40wzz3JDbUf1x/UL1OyOGi+kdF68oYbeGLeWlr2AiGIGxFgsEI+KAAyaFTOTrAgrcoqZyQyv8AwmvWLTrSk2sJCTYdlPe8PuC7lf4UZB/okbv4scKXQXkVu40fAn3B6g1jVtt4XY5oWqU+PgfVNKHXWkKjMZoe5M4AImZisOocbnqZMMQk7Sp8hxzjoElDuMJmpfNr5o26O3s6WOkIUsEtjn7E3Gqn3UWKIMYNV7btNzUc22BGYnMInVzjFkrgUa1rHFHf10N9DMHE27sO5IfWasCZpg03VbJ5cyQ5SWR8y5nnmnO+bnY6FgqSCAjjZFlVBSS7UyEJ/CosZAxUwEjpIdYK9PyDwjH9nCmmKFN1TEbEljMXlWAlhesmrmdvPZyBBOBQvAczrtdF6o8q7/TGEnQFc5ORihq5wcjNBVTo6pdJWTYzm6ysmxIF3l5FiOrnJyMELPOCmjIf3BC6QM3xL8gLEjNDVaxC0Hf/M6fzd4mDvp15MnnIZOI/eulnbP3v1aZnWEcPvDk+8cFpG2T/EFIoaQRJN/r3EE7Hsy4mMYpftABpncJgSKhqDWHSocCCw29Dl9XzpjC+/m3BD7RwI1TYch3Ac5+opyYB76mSEjyiLwjIJovfhkpLc5tWMizSA2Nyjdje4we3hfQGBYylgPITHUGQMSSwzVasYNznvXWnYQEGrovnTIqcup5qqXUX0aDYrrLUI1THHGXqcrAVlG94YhIb0kJFsgj8ro7ZZeTsSu1jbkkRiMG1W69to+sEeeHemmjTwtjAabiBLb6GB8JTe1gbIpOSbP2JnWDrRnQdIpPWj/QzgSLPuNaUgobqYQupmpLQy0f2EAnhcKpDDADrLnYW1O2N43ZMmEpO6eZjFs/sQNw6HMBoRqx+adkMal6DbTFIjkra/sAzaHYyCw48/p/lKfzL9bejXhUYuCD7ulVGRim4Q9S0Jap1pjRypC1WDgk5Jg3vZs3nhPVaWKUnlhetAppK1qVdAceoOFZpDXQpcMODeb3xRyVkeHv639gFKuC4I42SldV3QrX2psAtGU4dCCbCrRMvujlt5/YfH20DhUZtqEXiCfxXbQhnEeFoId5TPRVGWHidAPG8Hq2DjxEvwXctMlxZzkpu+CvwP2D6mXzLS/fC/2DzN4JTH9jWRPCf0b6kdI0ydQP0KaPoH6UUufQP0IafoE6kdI0ydQX3Tal4R+D/UjmekTqB/J/VdO+5KQf9ep6ROoHyFNH8axd5329/GbPoH6EdL0CdR/5bQvCfkr8Zs+gfqRxCR/57TXUvWBNF1N1QfSdDVV/1XKvslNV1P1gTS9gHoG7Eyj5Dwj6g4paWTdo02LidaHqSf50mqyKEVzKAUKyb371jqqum3Xn1Nam/+iP7K8bundiUd7VxsY40JV4KihLEyMumbUkiE2qga3+A0ZlQhquPokJmAr24eNLhQp3SFlWzcXqaikUGNKqDlWt8qJidICK6H68s9Ps7Y6j26FHuuyjVHiBFGKq8pAsREDSh2Uo6NZlsqcBeAYZ3vAvrinMYB9zKiOCqMSr1o2ZI6RoekSZ7VdZUZVgrJCuAEoFIjN6s8KpYycSuOtEDjM94/ikXfEvbQ2is0e9cVE5YsiDWV1Cnkr3xdAgEcqytOqZjriRGUX2RcZehyAMl3P/HvDm8X2nJ3WXSi9USceUN0BBbGezqADy1eFnR5PDM4G664fvxjlb62tjmqhYZPIiHM2mGJrjA0F7NeRZmp+O0wY6zAhwTu9dIbaUwutlZJleM6ophpmUEgNVW5TX6wSZI4BkxI1mUeE7JN+P6n6EgQGmLPSvZGFdzbfe07T67lrjzAGBuuwh7mFu1n03ECOfrof6F5/pItSQlunPseZETSBcZjWOhiCMvVAZh0ZbSN0PxRHR9kLqNnpKYI6pDqLBIaF1rlcp08BRssVbiN0NxSU6pkKvp6pfNG466Un77/FxXmErnBxZoKucHFmgq5wcWaCrnBxZoKucHFeij7goiI8jtr0IFFP6EwscCrqv/Qqjr6YhvArm7MeTkXXnBUuUKW5nhu14UesGQFRTPDGmVhXzniUgp6R05NK6hhB5jDBJkGAR4arI+i5nR6Uef05q2cbzfrpSc8NO1I2/R8QiXw8SPIHfAAAAYVpQ0NQSUNDIHByb2ZpbGUAAHicfZE9SMNAHMVfW6WilQ52KOIQpDpZKCriKFUsgoXSVmjVweTSL2jSkKS4OAquBQc/FqsOLs66OrgKguAHiJOjk6KLlPi/pNAixoPjfry797h7B3ibVaYYPTFAUU09nYgLufyq4H/FAMIIIoZRkRlaMrOYhev4uoeHr3dRnuV+7s8xKBcMBngE4jmm6SbxBvHMpqlx3icOsbIoE58TT+h0QeJHrksOv3Eu2ezlmSE9m54nDhELpS6WupiVdYV4mjgiKyrle3MOy5y3OCvVOmvfk78wUFBXMlynOYIElpBECgIk1FFBFSaitKqkGEjTftzFP2z7U+SSyFUBI8cCalAg2n7wP/jdrVGcmnSSAnGg98WyPsYA/y7QaljW97FltU4A3zNwpXb8tSYw+0l6o6NFjoDgNnBx3dGkPeByBwg/aaIu2pKPprdYBN7P6JvywNAt0L/m9Nbex+kDkKWulm+Ag0NgvETZ6y7v7uvu7d8z7f5+ANQocs498i2MAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAB3RJTUUH5AwBEDElrTIJ1QAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAISSURBVHja7dvBDYIwGIBRMVxZgLMX5nASJ3MSh4CEcPHMAgyAZ4kxoTa0je/dNJqY0i+/PbTqx2E9AR+dLQEIBAQCsdXbN+6Pp1Xhb92uFxME/MUCgYBAIJ9D+jdd20T/AdO8eApku/dMEBAICATSnkGcH0glxl4LOceYICAQEAgIBAQCAgGBgEBAICAQQCAgEBAICAQEAgKBsuy6MOWCFCUL2b8mCAgEBAICAYGAQEAgIBAQCAgEEAgIBAQCAgGBgEBAICAQEAgIBBAICAQEAgIBgYBAQCAgEBAIIBAQCAgEBAICAYGAQEAgIBAQCCAQEAgIBAQCAgGBgEBAICAQQCAgEBAICAQEAgIBgYBAQCAgEEAgIBAQCAgEBAICAYGAQEAggEBAICAQEAgIBAQCAgGBgEBAIIBAQCAgEBAICAQEAgIBgYBAAIGAQEAgIBAQCAgEBAICAYGAQACBgEBAICAQEAgIBAQCAgGBgEAAgYBAQCAgEBAICAQEAgIBgQACAYGAQEAgIBAQCAgEBAICAYEAAgGBgEBAICAQEAgIBAQCAgEEAgIBgYBA4Hj1ng93bfP2epoXK0gxQvavCQICAYGAQEAgIBAQCAgEBAICAQQCAgGBgEBAICAQKEv9y5e3F1BCuHTFUXvNBAGBgECgvDOI8wKppNp7JggIBAQCAgGBQCaqfhxWywAmCAgEBAIHeQHqnStLsO/vmAAAAABJRU5ErkJggg==';  
      const texture = new THREE.TextureLoader().load(textureImageData);
      // texture.image = img;
      texture.repeat.set(size, size); // (timesToRepeatHorizontally, timesToRepeatVertically)
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.needsUpdate = true;

      // const floorMaterial = new THREE.MeshBasicMaterial({
      //   color: '#ffffff',
      //   map: texture,
      //   // side: THREE.DoubleSide
      // });

      // MeshStandardMaterial needs lights:
      const floorMaterial = new THREE.MeshStandardMaterial({ 
        // color: '#ffffff',
        map: texture,
        // side: THREE.DoubleSide,
        // shininess: 40,
        // emissive: '#ffffff',
        // emissiveIntensity: 0.05,
        // metalness: 0.4,
      });
      // floorMaterial.needsUpdate = true;

      const floorGeometry = new THREE.PlaneGeometry( size, size );
      floorGeometry.rotateX( - Math.PI / 2 );

      const floorMesh = new THREE.Mesh( floorGeometry, floorMaterial );
      // floorMesh.receiveShadow = true;
      floorMesh.position.y = 0;
      surfaces.add(floorMesh);
      


      // createImage(textureImageData).then((img) => {
      //   const texture = new THREE.Texture();
      //   texture.image = img;
      //   texture.repeat.set(size, size); // (timesToRepeatHorizontally, timesToRepeatVertically)
      //   texture.wrapS = THREE.RepeatWrapping;
      //   texture.wrapT = THREE.RepeatWrapping;
      //   texture.needsUpdate = true;

      //   const floorMaterial = new THREE.MeshBasicMaterial( { 
      //     color: '#ffffff',
      //     map: texture,
      //     // side: THREE.DoubleSide
      //   }); //  wireframe: true // #373737

      //   // const floorMaterial = new THREE.MeshStandardMaterial({ 
      //   //   color: '#ffffff',
      //   //   map: texture,
      //   //   side: THREE.DoubleSide,
      //   //   // shininess: 40,
      //   //   // emissive: '#ffffff',
      //   //   // emissiveIntensity: 0.1,
      //   // });
      //   // floorMaterial.needsUpdate = true;

      //   const floorGeometry = new THREE.PlaneGeometry( size, size );
      //   floorGeometry.rotateX( - Math.PI / 2 );

      //   const floorMesh = new THREE.Mesh( floorGeometry, floorMaterial );
      //   // floorMesh.receiveShadow = true;
      //   floorMesh.position.y = 0;
      //   surfaces.add(floorMesh);
      // });
    }
    scene.add(surfaces);

    if (setDefault(horizonGlow)) {
      const glowMaterial = createGlowMaterial({
        glowCoefficient: 0.1,
        glowColor: '#d0ffa9',
        glowPower: 4,
        // materialSide: THREE.BackSide,
        blending: THREE.AdditiveBlending,
      });
      // const edgeGeometry = new THREE.CylinderGeometry( size/8, size/8, size + size/10, 12 );
      // const edgeGeometry = new THREE.CapsuleGeometry( size/8, size + size/10, 12, 12 );
      const edgeGeometry = new THREE.TorusGeometry( size/2 + size/8, size/8, 6, 40 );
      
      horizonGlow = new THREE.Mesh( edgeGeometry, glowMaterial );
      horizonGlow.position.y = 0;
      // edgeMesh0.position.z = - size / 2;
      horizonGlow.rotateX( - Math.PI / 2 ); //  + Math.PI / 8
      horizonGlow.rotateZ( Math.PI / 2 );
    }
    scene.add(horizonGlow);
    
    if (setDefault(points)) {
      let circleRadius = size/2;
      const circlePointsMesh1 = createCirclePoints({
        pointCircleRadius: circleRadius,
        pointCount: 300,
        noiseOffset: size,
        pointSize: 0.9,
      });
      circlePointsMesh1.rotateX( Math.PI / 2 );
      circlePointsMesh1.position.y = size;
      scene.add( circlePointsMesh1 );

      const cubicPointsMesh1 = createCubicPoints({
        cubeSize: circleRadius,
        pointCount: 70,
        noiseOffset: size,
        pointSize: 0.9,
      });
      cubicPointsMesh1.position.set(0, size, 0);
      scene.add( cubicPointsMesh1 );
    }else {
      scene.add(points)
    }
    
    if (setDefault(lights)) {
      scene = initDefaultGUILights(scene);
    }

    if (setDefault(fog)) {
      // scene.fog = new THREE.Fog( backgroundColor, 50, size/2 ); // b5d3e2 // cef4de
    }
    
    return scene;
}


export function initDefaultGUILights (scene: THREE.Scene): void {
  let dirLight = new THREE.DirectionalLight(0xfff8e2, 1); // 0xFFFFFF
  // let pos = new THREE.Vector3(100, 1000, 100);
  dirLight.position.set(-50, 40, 20);
  dirLight.target.position.set(0, 0, 0);
  // dirLight.castShadow = true;
  // dirLight.shadow.autoUpdate = false;
  // scene.add(dirLight);
  
  let ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.3);
  // ambientLight.shadow.autoUpdate = false; // errored
  scene.add(ambientLight);
  return scene;


  // const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
  // hemiLight.position.set( 0, 200, 0 );
  // scene.add( hemiLight );

  // const dirLight = new THREE.DirectionalLight( 0xffffff );
  // dirLight.position.set( 0, 200, 100 );
  // dirLight.castShadow = true;
  // dirLight.shadow.camera.top = 180;
  // dirLight.shadow.camera.bottom = - 100;
  // dirLight.shadow.camera.left = - 120;
  // dirLight.shadow.camera.right = 120;
  // scene.add( dirLight );

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
  let tagName = element.tagName.toLowerCase();
  if (tagName === 'textarea') return true;
  if (tagName !== 'input') return false;
  let type = element.getAttribute('type').toLowerCase();
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
  let pageStyle = '';
  for (let stylesheet of document.styleSheets) {
      // console.log(stylesheet);
      for (let cssRule of stylesheet.cssRules){
          pageStyle = `${pageStyle} \n ${cssRule.cssText}`;
      }
  }
  return pageStyle;
}


export function buildPageStyleList(setPageStyleMap) {

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
  
}

