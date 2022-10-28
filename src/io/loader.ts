import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';


export const loadGLTF = (url: string, onLoad: Function): void => {
    const loader = new GLTFLoader();
    // (url, onLoad, onProgress, onError)
    loader.load( url, onLoad(), function ( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        function ( error ) {
            console.log( 'An GLTF error happened: ' );
            console.log(error);
        }
    );
}
