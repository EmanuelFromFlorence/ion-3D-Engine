import * as THREE from 'three';
import { concreteNormalDataURL } from '../core/constants';
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
        const lineMaterial = new THREE.LineBasicMaterial({
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
        width = 80, 
        height = 20, 
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
    
    const templateScene = new THREE.Scene(); // new THREE.Object3D();

    const backgroundColor = '#ffffff';
    templateScene.background = new THREE.Color(backgroundColor);

    if (setDefault(lights)) {
        let dirLight = new THREE.DirectionalLight('#ffffff', 0.4);
        dirLight.position.set(0, height/2, 0);
        dirLight.target.position.set(0, 0, 0);
        dirLight.castShadow = true;
        // dirLight.shadow.autoUpdate = false;
        templateScene.add(dirLight);

        const pointLight = new THREE.PointLight( '#ffffff', 10, 200 );
        pointLight.castShadow = true;
        pointLight.position.set( width/10, height/3, width/10 );
        templateScene.add(pointLight);

        const pointLight2 = new THREE.PointLight( '#ffffff', 10, 200 );
        pointLight2.castShadow = true;
        pointLight2.position.set( -width/10, height/3, -width/10 );
        templateScene.add(pointLight2);
        
        let ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.4);
        // ambientLight.shadow.autoUpdate = false; // errored
        templateScene.add(ambientLight);

    }

    if (setDefault(surfaces)) {
        const normalMap = getRepeatingTexture(concreteNormalDataURL, width, height);
        // const normalMap = new THREE.TextureLoader().load(concreteNormalDataURL);
        normalMap.needsUpdate = true;

        
        const surfaceMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#9abeda'),
            normalMap: normalMap,
            normalScale: new THREE.Vector2(0.7, 0.7),
            // lightMapIntensity : 1,
            side: THREE.DoubleSide,
        });
        // surfaceMaterial.receiveShadow = true;
        surfaceMaterial.needsUpdate = true;


        const floorGeometry = new THREE.PlaneGeometry( width, width );
        floorGeometry.rotateX( - Math.PI / 2 );

        const floorMesh = new THREE.Mesh( floorGeometry, surfaceMaterial );
        // floorMesh.castShadow = true; //default is false
        floorMesh.receiveShadow = true; //default
        floorMesh.position.y = 0;
        

        templateScene.add(floorMesh);


        // Wall Material:   
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#466882'),
            side: THREE.DoubleSide,
        });


        const backWallGeometry = new THREE.PlaneGeometry( width, height );
        const backWallMesh = new THREE.Mesh( backWallGeometry, wallMaterial );
        backWallMesh.position.set(0, height/2, width/2);
        backWallMesh.rotation.x = Math.PI
        templateScene.add(backWallMesh);


        const frontWallMesh = backWallMesh.clone();
        frontWallMesh.position.set(0, height/2, -width/2);
        templateScene.add(frontWallMesh);


        const rightWallMesh = backWallMesh.clone();
        rightWallMesh.position.set(width/2, height/2, 0);
        rightWallMesh.rotation.y = Math.PI/2;
        templateScene.add(rightWallMesh);


        const leftWallMesh = backWallMesh.clone();
        leftWallMesh.position.set(-width/2, height/2, 0);
        leftWallMesh.rotation.y = Math.PI/2;
        templateScene.add(leftWallMesh);


        const ceilingMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#ffffff'),
        });
        const ceilingMesh = floorMesh.clone();
        ceilingMesh.material = ceilingMaterial;
        ceilingMesh.position.set(0, height, 0);
        const grid = new THREE.GridHelper( width/2, width/2, 0x000000, 0x000000 );
        grid.material.opacity = 0.6;
        grid.material.transparent = true;
        grid.position.set(0, -height*0.001, 0);
        grid.scale.set(2, 0, 2);
        ceilingMesh.add(grid);
        templateScene.add(ceilingMesh);


        const geometry = new THREE.BoxGeometry( 2,2,2);
        const box = new THREE.Mesh( geometry, surfaceMaterial );
        box.castShadow = true;
        // box.receiveShadow = true;
        box.position.y = 2;
        templateScene.add(box);

    }

    if (setDefault(gridHelper)) {
        const grid = new THREE.GridHelper( width, width, 0x000000, 0x000000 );
        grid.material.opacity = 0.1;
        grid.material.transparent = true;
        grid.position.y = 0.01;
        templateScene.add( grid );
    }
    
    if (setDefault(platform)) {
        platformOptions.radius = platformOptions.radius || Math.sqrt(width/2);
        platformOptions.platformHeight = platformOptions.platformHeight || 0.4;
        platformOptions.platformSegments = platformOptions.platformSegments || 64;
        const platform = getPlatformMesh(platformOptions.platformMaterial, platformOptions.radius, platformOptions.platformHeight, platformOptions.platformSegments);
        templateScene.add(platform);
    }


    templateScene.fog = new THREE.Fog(backgroundColor, width/8, width/0.9);
  
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
    
    let material;
    if (!platformMaterial) {
        material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#aac1d2'),
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
