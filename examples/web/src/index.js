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


console.log('In index.js....');

window.addEventListener('load', () => {

  /* Engine */
  const canvas = document.getElementById('viewport');
  canvas.style.zIndex = 100000;
  canvas.style.position = 'fixed';
  canvas.style.display = 'block';
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`; // clientHeight
  let guiScene = ION.createGUIScene();
  const engine = new ION.Engine(canvas, guiScene);

  /* Component */
  const htmlElement = document.getElementById('root');
  // canvas.style.zIndex = 1000000;
  // canvas.style.display = 'fixed';
  const guiComponent = new ION.GUIComponent({
    htmlElement: htmlElement,
  });

  /* Entity */
  let guiEntity = new ION.Entity();
  guiEntity.addComponent(guiComponent);
  engine.addEntity(guiEntity);

  /* System */
  const guiSystem = new ION.GUISystem();
  engine.addSystem(guiSystem);
  
  /* Engine Start */
  engine.start();



  // let id = setTimeout(() => {
  //   engine.start();
  // }, 1000);
  
});



