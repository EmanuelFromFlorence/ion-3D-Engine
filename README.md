
<div align="center">
	<img src="docs/logo_0.png" alt="ion 3D Engine"/>
	<p>A <b>Javascript</b> library for building 3D websites and virtual reality experiences.</p>
</div>


---

**Table of contents:**


<!-- TOC -->

- [Introduction](#introduction)
- [Installation](#installation)
- [Fundamentals](#fundamentals)
- [Getting started](#getting-started) 
	- [GUI Components](#gui-components) 
	- [Integrate With Your Project](#integrate-with-your-project)
- [Examples](#examples) 
- [API Reference](https://github.com/samrun0/ion-3D-Engine/wiki/API-Reference) 
- [Roadmap and Contributing](https://github.com/samrun0/ion-3D-Engine/wiki/Roadmap-and-Contributing) 

<!-- /TOC -->


Please visit ion-3D-Engine [wiki](https://github.com/samrun0/ion-3D-Engine/wiki) for the full documentation!




## Introduction

Demo



A simple and easy to use library to create 3D user interfaces that is also capable to be lauched in VR headsets. 

This library is powered by [Three.js](https://threejs.org/). As a result, the Scene Hierarchy, Meshes (components here), and Materials are all Three.js objects and the [API](https://github.com/samrun0/ion-3D-Engine/wiki/API-Reference) is consistent with Three.js API. Your components can also be integrated into your existing Three.js scene.





## Installation

#### As NPM Module

ion 3D Engine is available as an [npm package](https://www.npmjs.com/package/ion-3d-engine):

```sh
npm install ion-3d-engine
```

This library depends on Three.js:

```sh
npm install three
```

NPM instiallation is recommended to be used with a bundler such as [Webpack](https://webpack.js.org/).

ES6 style import:

```js
import ION from 'ion-3d-engine';
```

CommonJS style import:

```js
const ION = require('ion-3d-engine');
```

Using the module in a script tag:

```html
<!-- Add the polyfill es-module-shims.js because the import maps are not yet supported by all browsers -->
<script async src="https://unpkg.com/es-module-shims@1.6.3/dist/es-module-shims.js"></script>
<script type="importmap">
    {
        "imports": { 
            "three": "https://unpkg.com/three@0.150.1/build/three.module.js",
            "ion-3d-engine": "https://unpkg.com/ion-3d-engine/dist/ion-3d-engine.module.js"
        }
    }
</script>

<script type="module">
    import * as THREE from "three";
    import * as ION from "ion-3d-engine";

    // code...
</script>

```


#### As Browser Script (CDN)

```html
<!-- ThreeJS Scripts deprecated with r150+, and will be removed with r160. Please use ES Modules. -->
<script src="https://unpkg.com/three@0.150.0/build/three.min.js"></script>
<script src="https://unpkg.com/ion-3d-engine/dist/ion-3d-engine.js"></script>

<script>
    // THREE and ION available globally...
</script>
```




## Getting started



### GUI Components

There are only a few steps to setup the engine and render HTML in a 3D scene:

- **Step 1:** create an instance of ION Engine:
- **Step 2:** create a GUI component with a `rootElement` and add it to an entity. The HTML element is root of the DOM tree that we want to render in 3D.
- **Step 3:** add the GUI system and start the engine.


```js
/* Engine */
const engine = new ION.Engine({
    canvas: canvas,
    fullScreen: true,
    control: ION.SpaceControl, 
    vrEnabled: true,
    stats: true,
});

/* GUI Component */
const rootElement = document.getElementById('sample');
const guiComponent = new ION.GUIComponent({
    rootElement: rootElement,
    ratio: 0.5,
    transparent: true,
});

/* Entity */
const guiEntity = new ION.Entity();
guiEntity.addComponent(guiComponent);
engine.addEntity(guiEntity);

/* System */
const guiSystem = new ION.GUISystem();
engine.addSystem(guiSystem);
 
/* Engine Start */
engine.start();

```


### Integrate With Your Project

You can use your own custom ThreeJS scene and camera when creating an engine instance:

```js
/* Scene: */
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xffffff );
 
/* Camera: */
const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 5);

/* Engine: */
const canvas = document.querySelector('#viewport');
const engine = new ION.Engine({
    canvas,
    scene,
    camera,
    control: ION.SpaceControl, 
    vrEnabled: true,
});

engine.start();
```

Setting runtime callbacks gives you the ability to execute your own update functions in the animation loop at each frame:

```js
engine.setRuntimeCallback(() => {
    console.log('Running at each frame...');
});
```



## Fundamentals


### Entity-component-system (ECS)

ion Engine is based on [entity-component-system (ECS)](https://en.wikipedia.org/wiki/Entity_component_system) architecture which is a popular and powerful pattern to develop 3D applications. The building blocks of this model are:

- **Components:** they are encapsulated data holders and decoupled from the application logic. Components can be attached to entities to describe their attributes and how to be treated by the systems.

- **Entities:** each entity represents a different conceptual object with the desired components in the 3D scene. For example, an entity with a GUI component can be rendered as a 3D user interface.

- **Systems:** a system is a process which acts on the entities. For example, a GUI system queries the entities with a GUI Component and handles the GUI related operations and renders them into the 3D scene.



### ion Engine and ThreeJS





## Examples


| Example | Demo |
| --- | --- |
| git status | List all new or modified files |
| git diff | Show file differences that haven't been staged |





## API Reference







