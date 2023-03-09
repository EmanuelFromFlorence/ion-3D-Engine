import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';


import * as ION from '../../../src/ion-3d-engine';
// import * as ION from 'ion-3d-engine';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();





window.addEventListener('load', () => {


  // const engine = new ION.Engine({
  //   canvas: canvas,
  //   fullScreen: true,
  //   control: ION.SpaceControl, 
  //   vrEnabled: true,
  //   stats: true,
  // });

  
  // /* Renderer: */
  // const renderer = new THREE.WebGLRenderer({canvas});
  // renderer.setSize( window.innerWidth, window.innerHeight );

  // /* Scene: */
  // const scene = new THREE.Scene();
  // scene.background = new THREE.Color( 0xffffff );
 
  // /* Camera: */
  // const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 5);
  
  // /* Engine: */
  // const canvas = document.querySelector('#viewport');
  // const engine = new ION.Engine({
  //   canvas,
  //   scene,
  //   camera,
  //   control: ION.SpaceControl, 
  //   vrEnabled: true,
  // });

  // engine.start();


  /* Render: */
  // function render(time) {
  //   renderer.render(scene, camera);
  //   requestAnimationFrame(render);
  // }
  // requestAnimationFrame(render);


  // engine.setRuntimeCallback(() => {
  //   console.log('Running at each frame...');
  // });



  
  // /* Engine */
  const canvas = document.getElementById('viewport');


  // let guiScene = ION.getTemplateScene({
  //   type: 'ground_0',
  //   gridHelper: false,
  //   lights: true,
  // });


  const engine = new ION.Engine({
    canvas: canvas,
    // scene: guiScene,
    fullScreen: true,
    control: ION.SpaceControl,
    // control: ION.FirstPersonControl,
    // control: ION.ArcBallControl,
    // control: ION.FlyControl,
    
    stats: true,

    controlOptions: {
      vrTeleportEnabled: false, 
      vrTeleportList: [], 
      framebufferScaleFactor: 2.0, // lower this for for higher performance
    },
    vrEnabled: true,

    graphicsOptions: {
      shadowMapEnabled: false,  // was true // this lowers the vr fps from 90~ to 45~
      shadowMapType: null,
      outputEncoding: null, 
      toneMapping: null, // was null
      physicallyCorrectLights: false, // was true
    },
  });




  // /* React Component */
  // const reactRootElement = document.getElementById('root');
  // reactRootElement.style.width = `720px`;
  // reactRootElement.style.height = `720px`;
  
  // const reactGuiComponent = new ION.GUIComponent({
  //   rootElement: reactRootElement,
  //   ratio: 0.5,
  //   transparent: false,
  // });
  // // reactGuiComponent.rotateY(0.2);
  // reactGuiComponent.position.set(-2, 5, -10);

  // /* Entity */
  // let reactGuiEntity = new ION.Entity();
  // reactGuiEntity.addComponent(reactGuiComponent);
  // engine.addEntity(reactGuiEntity);


  // let degree = 10; 
  // const logoELm = document.getElementById('logo');
  // setInterval(() => {
  //   degree = degree + 1;
  //   // logoELm.style.transform = `rotate(${degree}deg)`;
  //   logoELm.style.setProperty('transform', `rotate(${degree}deg)`);
  // }, 40);








  // /* React Component */
  // const sliderRootElement = document.getElementsByClassName('slider')[0];
  
  // const sliderGuiComponent = new ION.GUIComponent({
  //   rootElement: sliderRootElement,
  //   ratio: 0.5,
  //   transparent: true,
  // });
  // sliderGuiComponent.rotateY(-0.2);
  // sliderGuiComponent.position.set(+4, 5, -8);

  // /* Entity */
  // let sliderGuiEntity = new ION.Entity();
  // sliderGuiEntity.addComponent(sliderGuiComponent);
  // engine.addEntity(sliderGuiEntity);




    /* Sample Component */
    const rootElement = document.getElementById('sample');
  
    const guiComponent = new ION.GUIComponent({
      rootElement: rootElement,
      ratio: 0.5,
      transparent: true,
    });
    // guiComponent.rotateY(-0.2);
    // guiComponent.position.set(+4, 2, -8);
  
    /* Entity */
    const guiEntity = new ION.Entity();
    guiEntity.addComponent(guiComponent);
    engine.addEntity(guiEntity);
  





  // /* Form Component */
  // const rootElement = document.getElementById('container');
  // // rootElement.style.background = '#000000';
  // const guiComponent = new ION.GUIComponent({
  //   rootElement: rootElement,
  //   ratio: 0.5,
  //   transparent: false,
  //   // renderTimeout: Infinity,
  // });
  // guiComponent.position.y = 4;
  // guiComponent.position.z = -1;
  // guiComponent.position.x = -1.5;
  // // guiComponent.rotateY(0.2);

  // /* Entity */
  // let guiEntity = new ION.Entity();
  // guiEntity.addComponent(guiComponent);
  // engine.addEntity(guiEntity);


  // setTimeout(() => {
  //   console.log('Appending span element');
  //   const span = document.createElement('span');
  //   span.innerHTML = 'HEY </br></br></br></br></br> SPAN';
  //   // span.append('SPAN');
    
  //   rootElement.appendChild(span);

  //   const div = document.createElement('div');
  //   div.textContent = 'DIV INSIDE';
  //   span.appendChild(div);

    
  //   setTimeout(() => {
  //     console.log('Dispatch mouseover event On btn_1');
  //     dispatchMouseEvent(document.getElementById('btn_1'), 'mouseover', 1, 1);
  
  //   }, (100));

  //   setTimeout(() => div.remove(), 200);

  // }, (700));


  // function dispatchMouseEvent(element, event, clientX, clientY) {    
  //   const mouseEvent = new MouseEvent(event, {
  //       view: window,
  //       bubbles: true,
  //       cancelable: true,
  //       // https://stackoverflow.com/a/63611994
  //       clientX,
  //       clientY,
  //   });
  //   element.dispatchEvent(mouseEvent);
  // }










  let Keyboard = window.SimpleKeyboard.default;

  let keyboard = new Keyboard({
    onChange: input => onChange(input),
    onKeyPress: button => onKeyPress(button),
    theme: "hg-theme-default hg-theme-ios",
    layout: {
      default: [
        "q w e r t y u i o p {bksp}",
        "a s d f g h j k l {enter}",
        "{shift} z x c v b n m , . {shift}",
        "{alt} {smileys} {space} {altright} {downkeyboard}"
      ],
      shift: [
        "Q W E R T Y U I O P {bksp}",
        "A S D F G H J K L {enter}",
        "{shiftactivated} Z X C V B N M , . {shiftactivated}",
        "{alt} {smileys} {space} {altright} {downkeyboard}"
      ],
      alt: [
        "1 2 3 4 5 6 7 8 9 0 {bksp}",
        `@ # $ & * ( ) ' " {enter}`,
        "{shift} % - + = / ; : ! ? {shift}",
        "{default} {smileys} {space} {back} {downkeyboard}"
      ],
      smileys: [
        "😀 😊 😅 😂 🙂 😉 😍 😛 😠 😎 {bksp}",
        `😏 😬 😭 😓 😱 😪 😬 😴 😯 {enter}`,
        "😐 😇 🤣 😘 😚 😆 😡 😥 😓 🙄 {shift}",
        "{default} {smileys} {space} {altright} {downkeyboard}"
      ]
    },
    display: {
      "{alt}": ".?123",
      "{smileys}": "\uD83D\uDE03",
      "{shift}": "⇧",
      "{shiftactivated}": "⇧",
      "{enter}": "return",
      "{bksp}": "⌫",
      "{altright}": ".?123",
      "{downkeyboard}": "🞃",
      "{space}": " ",
      "{default}": "ABC",
      "{back}": "⇦"
    }
  });
  
  /**
   * Update simple-keyboard when input is changed directly
   */
  document.querySelector(".keyboard-input").addEventListener("input", event => {
    console.log('helakdflasdjflsdjflksjdflkj');
    keyboard.setInput(event.target.value);
  });

  
  function onChange(input) {
    console.log("Input changed", input);
    document.querySelector(".keyboard-input").value = input;
    // document.querySelector(".keyboard-input").setAttribute('value', input);
  }
  
  function onKeyPress(button) {
    console.log("Button pressed", button);
  
    /**
     * Handle toggles
     */
    if (button.includes("{") && button.includes("}")) {
      handleLayoutChange(button);
    }
  }
  
  function handleLayoutChange(button) {
    let currentLayout = keyboard.options.layoutName;
    let layoutName;
  
    switch (button) {
      case "{shift}":
      case "{shiftactivated}":
      case "{default}":
        layoutName = currentLayout === "default" ? "shift" : "default";
        break;
  
      case "{alt}":
      case "{altright}":
        layoutName = currentLayout === "alt" ? "default" : "alt";
        break;
  
      case "{smileys}":
        layoutName = currentLayout === "smileys" ? "default" : "smileys";
        break;
  
      default:
        break;
    }
  
    if (layoutName) {
      keyboard.setOptions({
        layoutName: layoutName
      });
    }
  }
  


  keyboard.addButtonTheme(
    "\` ` 1 2 3 4 5 6 7 8 9 0 - = {bksp} {tab} q w e r t y u i o p [ ] \\ {lock} a s d f g h j k l ; ' " 
    + '{enter} {shift} z x c v b n m , . / {shift} .com @ {space} ~ ! @ # $ % ^ & * ( ) _ + {bksp} {tab} Q W E R T Y U I O P { } | {lock} A S D F G H J K L : " {enter} {shift} Z X C V B N M < > ? {shift} .com @ {space}'
    + " 😀 😊 😅 😂 🙂 😉 😍 😛 😠 😎 "
    + " 😏 😬 😭 😓 😱 😪 😬 😴 😯 "
    + " 😐 😇 🤣 😘 😚 😆 😡 😥 😓 🙄 ",
    'customKeyboardBtnClass'
  );
  // this.keyboard.addButtonTheme("a b c {enter}", "myClass1 myClass2");

  keyboard.addButtonTheme(
    "{default} {alt} {smileys} {altright} {downkeyboard} {shiftactivated} {back}",
    'customKeyboardBtnClass1'
  );



  const simpleKeyboardElm = document.getElementsByClassName('simple-keyboard')[0];
  // rootElement.style.background = '#000000';
  const simpleKeyboardComp = new ION.GUIComponent({
    rootElement: simpleKeyboardElm,
    ratio: 0.5,
    transparent: true,
  });
  simpleKeyboardComp.position.y = 3;
  simpleKeyboardComp.position.z = -1;
  simpleKeyboardComp.position.x = 1.9;
  simpleKeyboardComp.rotateY(-0.2);

  /* Entity */
  let simpleKeyboardEntity = new ION.Entity();
  simpleKeyboardEntity.addComponent(simpleKeyboardComp);
  engine.addEntity(simpleKeyboardEntity);


  
  const keyboardInputElm = document.getElementsByClassName('keyboard-input')[0];
  const keyboardInputComp = new ION.GUIComponent({
    rootElement: keyboardInputElm,
    ratio: 0.5,
    transparent: true,
  });
  keyboardInputComp.position.y = 4;
  keyboardInputComp.position.z = -1;
  keyboardInputComp.position.x = 1.9;
  keyboardInputComp.rotateY(-0.2);

  /* Entity */
  let keyboardInputEntity = new ION.Entity();
  keyboardInputEntity.addComponent(keyboardInputComp);
  engine.addEntity(keyboardInputEntity);







  /* System */
  const guiSystem = new ION.GUISystem();
  engine.addSystem(guiSystem);
  
  /* Engine Start */
  engine.start();


});



