import * as THREE from 'three';
import { ionicTileImageURI, } from '../core/constants';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { setDefault } from '../core/utils/utils';


export const createGlowMaterial = ({glowCoefficient = 0.01, glowColor = '#fce17d', glowPower = 5, materialSide = THREE.FrontSide, blending = THREE.NormalBlending} = {}) => {
    const fragmentShader = `
        uniform vec3 color;
        uniform float coefficient;
        uniform float power;
        varying vec3 vVertexNormal;
        varying vec3 vVertexWorldPosition;
        void main() {
        vec3 worldCameraToVertex = vVertexWorldPosition - cameraPosition;
        vec3 viewCameraToVertex	= (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;
        viewCameraToVertex = normalize(viewCameraToVertex);
        float intensity	= pow(
            coefficient + dot(vVertexNormal, viewCameraToVertex),
            power
        );
        gl_FragColor = vec4(color, intensity);
        }
    `;
    const vertexShader = `
        varying vec3 vVertexWorldPosition;
        varying vec3 vVertexNormal;
        void main() {
        vVertexNormal	= normalize(normalMatrix * normal);
        vVertexWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    // https://threejs.org/docs/#api/en/materials/ShaderMaterial
    // ====>>>> !!! https://threejs.org/docs/#api/en/constants/Materials
    const glowMaterial = new THREE.ShaderMaterial({
        fragmentShader,
        uniforms: {
            coefficient: {
                value: glowCoefficient,
            },
            color: {
                value: new THREE.Color(glowColor),
            },
            power: {
                value: glowPower,
            },
        },
        vertexShader,
        depthWrite: false,
        // side: THREE.BackSide, // original was: THREE.BackSide
        side: materialSide,
        blending: blending,
        transparent: true,
        // opacity: 0,  // 0-1, 0 fully transparent...
        // visible: false,
    });

    return glowMaterial;
}


export const range = (start, stop, step = 1) => Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step);


export const createCirclePoints = ({pointCircleRadius = null, pointCount = null, noiseOffset = null, pointSize = 0.1} = {}) => {
    let pointPosisions = [];

    let radientStep = 2*Math.PI/pointCount;
    let circleRange = range(0, 2*Math.PI, radientStep);
    
    for (let i=0; i<pointCount; i++){
        let vector3 = new THREE.Vector3(Math.cos(circleRange[i]), Math.sin(circleRange[i]), Math.random());
        vector3.normalize();

        let noise = Math.random() * (noiseOffset - 0) + 0; // random in a range: Math.random() * (max - min) + min
        vector3.multiplyScalar(pointCircleRadius + noise);

        pointPosisions.push(vector3.x, vector3.y, vector3.z);
    }

    const pointsGeometry = new THREE.BufferGeometry();
    pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pointPosisions, 3));

    // THREE.Points INSTANCE UISNG THREE.PointsMaterial
    const pointsMaterial = new THREE.PointsMaterial({
        color: 0xf5bc0e,
        size: pointSize,
        transparent: true,
        blending: THREE.AdditiveBlending,
        map: generateSprite([
            {offset: 0, color: 'rgba(255, 246, 217, 1)'},
            {offset: 0.2, color: 'rgba(230, 184, 31, 1)'},
            // {offset: 0.36, color: 'rgba(64, 39, 0, 1)'},
            {offset: 0.7, color: 'rgba(0,0,0,1)'}, // up to 1
        ]),
        // side: THREE.BackSide,
        depthWrite: false,
        sizeAttenuation: true,
        // emissive: 0Xffcb0d,
        // emissiveIntensity: 14, // Modulates the emissive color. Default is 1.
    });

    const circlePointsMesh = new THREE.Points(pointsGeometry, pointsMaterial);
    circlePointsMesh.sortParticles = true; // means the points are rendererd in the order they exist in the buffer
    return circlePointsMesh;
}

    
export const createCubicPoints = ({cubeSize = null, pointCount = null, noiseOffset = null, pointSize = 0.1,} = {}) => {
    // geometry
    let pointPosisions = [];

    let i = 0;
    while (i < pointCount) {
        let noise = Math.random() * (noiseOffset - 0) + 0; // random in a range: Math.random() * (max - min) + min
        let pt = new THREE.Vector3();
        pt.set(
            THREE.MathUtils.randFloatSpread(cubeSize + noise), // original for all these was 45
            THREE.MathUtils.randFloatSpread(cubeSize + noise),
            THREE.MathUtils.randFloatSpread(cubeSize + noise));
        
            pointPosisions.push(pt.x, pt.y, pt.z);
        i += 1;
    }
    
    const pointsGeometry = new THREE.BufferGeometry();
    pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pointPosisions, 3));

    // THREE.Points INSTANCE UISNG THREE.PointsMaterial
    const pointsMaterial = new THREE.PointsMaterial({
        color: 0xf5bc0e,
        size: pointSize,
        transparent: true,
        blending: THREE.AdditiveBlending,
        map: generateSprite([
            {offset: 0, color: 'rgba(255, 246, 217, 1)'}, 
            {offset: 0.2, color: 'rgba(230, 184, 31, 1)'}, 
            // {offset: 0.36, color: 'rgba(64, 39, 0, 1)'}, 
            {offset: 0.7, color: 'rgba(0,0,0,1)'}, // up to 1
        ]),
        // side: THREE.BackSide,
        depthWrite: false,
        sizeAttenuation: true,
        // emissive: 0Xffcb0d,
        // emissiveIntensity: 14, // Modulates the emissive color. Default is 1.
    });

    const cubicPointsMesh = new THREE.Points(pointsGeometry, pointsMaterial);
    cubicPointsMesh.sortParticles = true; // means the points are rendererd in the order they exist in the buffer
    return cubicPointsMesh;
}


export const generateSprite = (gradientColors) => {
    let canvas = document.createElement('canvas');
    // canvas.width = 8;
    // canvas.height = 8;
    canvas.width = 16;
    canvas.height = 16;

    let context = canvas.getContext('2d');
    let gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);

    gradientColors.forEach((gradientColor) => {
        gradient.addColorStop(gradientColor.offset, gradientColor.color);
    });

    // gradient.addColorStop(0, 'rgba(255, 246, 217, 1)'); // 'rgba(255,255,255,1)'
    // gradient.addColorStop(0.2, 'rgba(230, 184, 31, 1)');   // 'rgba(0,255,255,1)' 
    // gradient.addColorStop(0.4, 'rgba(64, 39, 0, 1)'); // 'rgba(0,0,64,1)'
    // gradient.addColorStop(1, 'rgba(0,0,0,1)'); // 'rgba(0,0,0,1)'

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    let texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}


export const createCircleLine = (lineCircleRadius) => {
    let linePosisions = [];
    let lineColors = [];

    let linePointCount = 100;
    let lineRadientStep = 2*Math.PI/linePointCount;
    let lineCircleRange = range(0, 2*Math.PI, lineRadientStep);

    const color = new THREE.Color();
    for (let i=0; i<linePointCount; i++){
        let vector3 = new THREE.Vector3(Math.cos(lineCircleRange[i]), Math.sin(lineCircleRange[i]), 0);
        vector3.normalize();
        vector3.multiplyScalar(lineCircleRadius );

        linePosisions.push(vector3.x, vector3.y, vector3.z);

        color.setHSL( i/linePointCount, 1.0, 0.5 );
        lineColors.push( color.r, color.g, color.b );
    }

    return createLine(linePosisions, lineColors, null);
}


export const createLine = (linePosisions, lineColors, lineMaterial) => {
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePosisions, 3));

    if(lineColors) {
        lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));
    }

    if (!lineMaterial){
        lineMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 1, // in world units with size attenuation, pixels otherwise
            vertexColors: true,
            // opacity: 0.2,
            // depthTest: false,
            // visible: false,
            //resolution:  // to be set by renderer, eventually
            // alphaToCoverage: true,
        });
    }
    
    const circleLineMesh = new THREE.Line(lineGeometry, lineMaterial);
    circleLineMesh.computeLineDistances();
    return circleLineMesh;
}


export function getTemplateScene({
        type = 'ground_0',
        width = 60, 
        height = 60, 
        surfaces = null,
        gridHelper = false, 
        lights = null,
        platform = null,
        platformOptions = {
            platformMaterial: null, 
            radius: null, 
            platformHeight: null,  
            platformSegments: null, 
        },
    } = {}){
    
    if (type === 'ground_0') {
        return getGround0Scene({
            type: type,
            width: 60, 
            height: height,
            surfaces: surfaces,
            lights: lights,
        });
    }

}


export function getGround0Scene({
        type = 'ground_0',
        width = 80,
        height = 80,
        background = true,
        surfaces = true,
        lights = null,
        points = true,
    } = {}){
    const templateScene = new THREE.Scene(); // new THREE.Object3D();

    const backgroundColor = '#667176';
    templateScene.background = new THREE.Color(backgroundColor);

    if (setDefault(background)) {
        const loader = new THREE.CubeTextureLoader();
        background = loader.load([
            '../../resources/background/px.png',
            '../../resources/background/nx.png',
            '../../resources/background/py.png',
            '../../resources/background/ny.png',
            '../../resources/background/pz.png',
            '../../resources/background/nz.png',
        ]);
    }
    templateScene.background = background;

    if (setDefault(lights)) {
        let ambientLight = new THREE.AmbientLight('#fff2de', 4);
        templateScene.add(ambientLight);
    }

    if (setDefault(surfaces)) {
        const texture = getRepeatingTexture(ionicTileImageURI, width/2, height/2);
        
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#c2e9fa'), // You can change the texture color!
            map: texture,
        });
        floorMaterial.receiveShadow = true;

        const floorGeometry = new THREE.PlaneGeometry( width, height );
        floorGeometry.rotateX( - Math.PI / 2 );

        const floorMesh = new THREE.Mesh( floorGeometry, floorMaterial );
        floorMesh.position.y = 0;

        templateScene.add(floorMesh);
    }

    if (setDefault(points)) {
        const size = width;
        let circleRadius = size/2;
        let offset = size/6;
    
        const circlePointsMesh1 = createCirclePoints({
            pointCircleRadius: circleRadius,
            pointCount: 500,
            noiseOffset: offset,
            pointSize: 0.15,
        });
        circlePointsMesh1.rotateX( Math.PI / 2 );
        circlePointsMesh1.position.y = size/3.8;
        templateScene.add( circlePointsMesh1 );
    
        const cubicPointsMesh1 = createCubicPoints({
            cubeSize: circleRadius,
            pointCount: 70,
            noiseOffset: offset,
            pointSize: 0.15,
        });
        cubicPointsMesh1.position.set(0, size/4, 0);
        templateScene.add( cubicPointsMesh1 );
    }else {
        templateScene.add(points);
    }
 
    return templateScene;
}


export function getRepeatingTexture(imgDataURI, width, height) {
    const texture = new THREE.TextureLoader().load(imgDataURI);
    texture.repeat.set(width, height); // (timesToRepeatHorizontally, timesToRepeatVertically)
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;
    return texture;
}


export function getPlatformMesh(platformMaterial, radius, platformHeight, platformSegments) {
    const radiusTop = radius * 0.96;
    const radiusBottom = radius;
    const height = platformHeight;
    const radialSegments = platformSegments;
    const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments );
    geometry.computeVertexNormals();
    geometry.computeTangents();
    geometry.normalizeNormals();
    geometry.computeBoundingSphere();
    geometry.computeBoundingBox();
    
    // const normalMap = new THREE.TextureLoader().load(concreteNormalDataURL);
    // normalMap.repeat.set(radiusTop, radiusTop);
    // normalMap.wrapS = THREE.RepeatWrapping;
    // normalMap.wrapT = THREE.RepeatWrapping;
    // // normalMap.needsUpdate = true;

    let material;
    if (!platformMaterial) {
        material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#bbbbbb'),
            // normalMap: normalMap,
            normalScale: new THREE.Vector2(0.06, 0.06),
            metalness: 0.6, // 0-1
            roughness: 0.2,
        });
        material.receiveShadow = true;
        material.needsUpdate = true;
        material.flatShading = false;
    } else {
        material = platformMaterial;
    }

    const platform = new THREE.Mesh( geometry, material );
    platform.receiveShadow = true;
    platform.castShadow = true;
    platform.position.set(0, platformHeight / 2, 0);
    platform.rotateY(Math.PI);


    /* Neon Light */
    const neonRadius = radiusTop + (radiusBottom - radiusTop) / 2;
    const tubeRadius = platformHeight / 37;
    const radialSegmentsThickness = 8;
    const tubularSegments = radialSegments;
    const neonGeometry = new THREE.TorusGeometry(neonRadius, tubeRadius, radialSegmentsThickness, tubularSegments );
    neonGeometry.computeVertexNormals();
    neonGeometry.computeTangents();
    neonGeometry.normalizeNormals();
    neonGeometry.computeBoundingSphere();
    neonGeometry.computeBoundingBox();

    const neonMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#fff99f'),
        emissive: new THREE.Color('#fff99f'),
        emissiveIntensity: 2,
    });
    neonMaterial.needsUpdate = true;
    neonMaterial.flatShading = false;

    const neon = new THREE.Mesh( neonGeometry, neonMaterial );
    // neon.position.set(0, platformHeight/2, 0);
    neon.rotateX(Math.PI/2);
    platform.add(neon);

    return platform;
}
