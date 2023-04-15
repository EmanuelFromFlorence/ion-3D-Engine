
<div align="center">
	<img src="docs/logo_0.png" alt="ion 3D Engine"/>
	<p></p>
	<p>A <b>Javascript</b> library for building 3D websites and virtual reality experiences.</p>
</div>


---

<div align="center">

[![Twitter URL](https://img.shields.io/twitter/url/https/twitter.com/bukotsunikki.svg?style=social&label=Twitter%20%40ion3dengine)](https://twitter.com/ion3dengine) 

</div>

**Table of contents:**


<!-- TOC -->

- [Introduction](#introduction)
- [Installation](#installation)
- [Fundamentals](#fundamentals)
- [Getting started](#getting-started) 
	- [GUI Components](#gui-components) 
	- [Integrate With Your ThreeJS Project](#integrate-with-your-threejs-project)
- [Examples](https://github.com/samrun0/ion-3D-Engine/wiki/Examples) 
- [API Reference](https://github.com/samrun0/ion-3D-Engine/wiki/API-Reference) 
- [Roadmap and Contributing](#roadmap-and-contributing) 
- [License](#license)

<!-- /TOC -->


Please visit ion 3D Engine [wiki](https://github.com/samrun0/ion-3D-Engine/wiki) for the full documentation!

🔗 [Home Page](https://samrun0.github.io/ion-3d-engine.html)

❓ *If you need any help create a new issue here:* [issues](https://github.com/samrun0/ion-3D-Engine/issues)


## Introduction

A simple and easy to use library to create 3D user interfaces that is also capable to be lauched in VR headsets. 

This library is powered by [Three.js](https://threejs.org/). As a result, the Scene Hierarchy, Meshes (components here), and Materials are all Three.js objects and the [API](https://github.com/samrun0/ion-3D-Engine/wiki/API-Reference) is consistent with Three.js API. Your components can also be integrated into your existing Three.js scene.

<div align="center">
	<a href="https://samrun0.github.io/gui-examples/gui-html-form.html"><img alt="Example Demo" target="_blank" src="https://samrun0.github.io/resources/examples-preview/gui-html-form.gif" width="35%" ></a>
	<a href="https://samrun0.github.io/gui-examples/gui-canvas.html"><img alt="Example Demo" target="_blank" src="https://samrun0.github.io/resources/examples-preview/gui-canvas.gif" width="35%"></a>
	<a href="https://samrun0.github.io/gui-examples/gui-slider.html"><img alt="Example Demo" target="_blank" src="https://samrun0.github.io/resources/examples-preview/gui-slider.gif" width="35%"></a>
	<a href="https://samrun0.github.io/gui-examples/reactjs/build/index.html"><img alt="Example Demo" target="_blank" src="https://samrun0.github.io/resources/examples-preview/reactjs.gif" width="35%"></a>
</div>



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
const canvas = document.getElementById('viewport');
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
    pixelRatio: 150,
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


### Integrate With Your ThreeJS Project

You can use your own custom ThreeJS scene and camera when creating the engine instance:

```js
/* Scene: */
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xffffff );
 
/* Camera: */
const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 100);

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

See the [live demo](https://samrun0.github.io/other-examples/integrate-example.html) and [full source code](https://github.com/samrun0/samrun0.github.io/blob/main/other-examples/integrate-example.html) of such integration.

## Fundamentals

Please visit ion 3D Engine [wiki](https://github.com/samrun0/ion-3D-Engine/wiki/Funamentals) for the full documentation!

### Entity-component-system (ECS)

ion Engine is based on [entity-component-system (ECS)](https://en.wikipedia.org/wiki/Entity_component_system) architecture which is a popular and powerful pattern to develop 3D applications. The building blocks of this model are:

- **Components:** they are encapsulated data holders and decoupled from the application logic. Components can be attached to entities to describe their attributes and how to be treated by systems.

- **Entities:** each entity represents a different conceptual object with the desired components in the 3D scene. For example, an entity with a GUI component can be rendered as a 3D user interface.

- **Systems:** a system is a process which acts on the entities. For example, a GUI system queries the entities with a GUI Component and handles the GUI related operations and renders them into the 3D scene.



### ion Engine and ThreeJS




## Examples

All the examples and live demos are listed in [examples page](https://github.com/samrun0/ion-3D-Engine/wiki/Examples).



## API Reference

For the complete API documentation visit [API page](https://github.com/samrun0/ion-3D-Engine/wiki/API-Reference).



## Roadmap and Contributing

Let's build together! We'd love to have your input and try to maintain a low response time. This can be:

- Reporting a bug
- Submitting a fix or a code change
- Proposing new features
- Discussing about the project
- Modifying the documentation

See [Roadmap and Contributing](https://github.com/samrun0/ion-3D-Engine/wiki/Roadmap-and-Contributing) for more information.





## License

[Apache License Version 2.0](https://github.com/samrun0/ion-3D-Engine/blob/main/LICENSE)
