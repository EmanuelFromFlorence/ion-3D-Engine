import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';


export const loadGLTF = (url, scene) => {
    const loader = new GLTFLoader();

    // Load a glTF resource
    loader.load(
        // resource URL
        url, 
        // called when the resource is loaded
        ( gltf ) => {
    
            scene.add( gltf.scene );
            
            gltf.animations; // Array<THREE.AnimationClip>
            gltf.scene; // THREE.Group
            gltf.scenes; // Array<THREE.Group>
            gltf.cameras; // Array<THREE.Camera>
            gltf.asset; // Object
    
    
    
            // this.mixer = new THREE.AnimationMixer( gltf.scene );
            // gltf.animations.forEach((clip) => {
            //     console.log('heeeee');
            //     this.mixer.clipAction( clip ).play();
            // });
    
    
            gltf.scene.position.set(0,-4,0);
            // gltf.scene.scale.set(2,2,2);
    
            // const mesh = gltf.scene.children[0];
            // const fooExtension = mesh.userData.gltfExtensions.EXT_foo;
    
            // gltf.parser.getDependency( 'bufferView', fooExtension.bufferView )
            //     .then( function ( fooBuffer ) { ... } );
    
            
            // Note: normals not needed since it's in the gltf file already!
    
            
            // for (let child of gltf.scene.children) {  this is not traversing all children (boundary)!!! 
            gltf.scene.traverse((child) => {
                // child.geometry
                let meshName = child.userData.name;
                console.log(`meshName: ${meshName}`);

            });
    
            
            console.log('GLTF loaded...');
    
        },
        // called while loading is progressing
        function ( xhr ) {
            // console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        // called when loading has errors
        function ( error ) {
            console.log( 'An GLTF error happened: ' );
            console.log(error);
        }
    );
}


