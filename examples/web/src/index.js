import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';


import * as ION from '../../../src/ion-3d-engine'


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
  
  /* Engine */
  const canvas = document.getElementById('viewport');
  

  let guiScene = ION.createGUITemplateScene({
    lights: true,
    fog: true,
  });

  const engine = new ION.Engine({
    canvas: canvas, 
    scene: guiScene, 
    fullScreen: true,
    control: ION.SpaceControl,
    // control: ION.FirstPersonControl,
    // control: ION.ArcBallControl,
    // control: ION.FlyControl,
    
    controlOptions: {vrTeleportEnabled: false, vrTeleportList: []},
    vrEnabled: true,
  });

  // /* Component */
  // const rootElement = document.getElementById('root');
  // // should do these in GUIComponent init step:
  // rootElement.style.position = 'fixed';
  // rootElement.style.width = `512px`;
  // rootElement.style.height = `512px`;
  // rootElement.style.overflow = 'hidden'; // This will not allow the content to exceed the container
  // // rootElement.style.overflow = 'auto'; // This will automatically add scrollbars to the container when...
  // rootElement.style.margin = '0 auto';

  const rootElement = document.getElementById('container');
  // rootElement.style.background = '#000000';
  const guiComponent = new ION.GUIComponent({
    rootElement: rootElement,
    ratio: 1,
    transparent: true,
  });
  guiComponent.position.y = 5;
  guiComponent.position.z = -2;
  guiComponent.position.x = -4;
  guiComponent.rotateY(0.2);

  /* Entity */
  let guiEntity = new ION.Entity();
  guiEntity.addComponent(guiComponent);
  engine.addEntity(guiEntity);



  // const rootElement2 = document.getElementById('root');
  // const guiComponent2 = new ION.GUIComponent({
  //   rootElement: rootElement2,
  //   ratio: 1,
  // });
  // guiComponent2.position.y = 5;
  // guiComponent2.position.x = 4;
  // guiComponent2.rotateY(-0.3);

  // /* Entity */
  // let guiEntity2 = new ION.Entity();
  // guiEntity2.addComponent(guiComponent2);
  // engine.addEntity(guiEntity2);




  /* keyboard GUI Component */

  // let Keyboard = window.SimpleKeyboard.default;

  // let keyboard = new Keyboard({
  //   onChange: input => onChange(input),
  //   onKeyPress: button => onKeyPress(button)
  // });

  // keyboard.addButtonTheme(
  //   "\` ` 1 2 3 4 5 6 7 8 9 0 - = {bksp} {tab} q w e r t y u i o p [ ] \\ {lock} a s d f g h j k l ; ' " 
  //   + '{enter} {shift} z x c v b n m , . / {shift} .com @ {space} ~ ! @ # $ % ^ & * ( ) _ + {bksp} {tab} Q W E R T Y U I O P { } | {lock} A S D F G H J K L : " {enter} {shift} Z X C V B N M < > ? {shift} .com @ {space}',
    
  //   "customKeyboardBtnClass"
  // );

  // // let layout = {
  // //   'default': [
  // //     '` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
  // //     '{tab} q w e r t y u i o p [ ] \\',
  // //     '{lock} a s d f g h j k l ; \' {enter}',
  // //     '{shift} z x c v b n m , . / {shift}',
  // //     '.com @ {space}'
  // //   ],
  // //   'shift': [
  // //     '~ ! @ # $ % ^ &amp; * ( ) _ + {bksp}',
  // //     '{tab} Q W E R T Y U I O P { } |',
  // //     '{lock} A S D F G H J K L : " {enter}',
  // //     '{shift} Z X C V B N M &lt; &gt; ? {shift}',
  // //     '.com @ {space}'
  // //   ]
  // // };

  // // keyboard.setOptions({layout});


  // keyboard.setOptions({
  //   layoutName: 'appleIOS'
  // });
  



  // /**
  //  * Update simple-keyboard when input is changed directly
  //  */
  // document.querySelector(".input").addEventListener("input", event => {
  //   keyboard.setInput(event.target.value);
  // });
  // // console.log(keyboard);

  // function onChange(input) {
  //   document.querySelector(".input").value = input;
  //   // console.log("Input changed", input);
  // }

  // function onKeyPress(button) {
  //   // console.log("Button pressed", button);

  //   /**
  //    * If you want to handle the shift and caps lock buttons
  //    */
  //   if (button === "{shift}" || button === "{lock}") handleShift();
  // }

  // function handleShift() {
  //   let currentLayout = keyboard.options.layoutName;
  //   let shiftToggle = currentLayout === "default" ? "shift" : "default";

  //   keyboard.setOptions({
  //     layoutName: shiftToggle
  //   });
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
    keyboard.setInput(event.target.value);
  });
  
  // console.log(keyboard);
  
  function onChange(input) {
    console.log("Input changed", input);
    document.querySelector(".keyboard-input").value = input;
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
    + '{enter} {shift} z x c v b n m , . / {shift} .com @ {space} ~ ! @ # $ % ^ & * ( ) _ + {bksp} {tab} Q W E R T Y U I O P { } | {lock} A S D F G H J K L : " {enter} {shift} Z X C V B N M < > ? {shift} .com @ {space}',
    
    "customKeyboardBtnClass"
  );








  const simpleKeyboardElm = document.getElementsByClassName('simple-keyboard')[0];
  // rootElement.style.background = '#000000';
  const simpleKeyboardComp = new ION.GUIComponent({
    rootElement: simpleKeyboardElm,
    ratio: 1,
    transparent: true,
  });
  simpleKeyboardComp.position.y = 5;
  simpleKeyboardComp.position.z = -2;
  simpleKeyboardComp.position.x = 3;
  // simpleKeyboardComp.rotateY(0.2);

  /* Entity */
  let simpleKeyboardEntity = new ION.Entity();
  simpleKeyboardEntity.addComponent(simpleKeyboardComp);
  engine.addEntity(simpleKeyboardEntity);


  
  const keyboardInputElm = document.getElementsByClassName('keyboard-input')[0];
  const keyboardInputComp = new ION.GUIComponent({
    rootElement: keyboardInputElm,
    ratio: 1,
    transparent: true,
  });
  keyboardInputComp.position.y = 8;
  keyboardInputComp.position.z = -2;
  keyboardInputComp.position.x = 3;
  // keyboardInputComp.rotateY(0.2);

  /* Entity */
  let keyboardInputEntity = new ION.Entity();
  keyboardInputEntity.addComponent(keyboardInputComp);
  engine.addEntity(keyboardInputEntity);






  /* System */
  const guiSystem = new ION.GUISystem();
  engine.addSystem(guiSystem);
  
  /* Engine Start */
  engine.start();


  const unit = 0.1;

  // x -> towards x
  // y -> towards y
  // z -> towards z



  





});



