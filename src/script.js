import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { RGBELoader } from 'three/examples/jsm/Addons.js';
import { GroundedSkybox } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';

/**
 * Base
 */
// Debug
const gui = new GUI();
const backgroundFolder = gui.addFolder('Background');

// Loaders
const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
const textureLoader = new THREE.TextureLoader();
const rgbeLoader = new RGBELoader();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Environment map
scene.environmentIntensity = 1;
scene.backgroundBlurriness = 0;
scene.backgroundIntensity = 1;
// scene.backgroundRotation.x = 1;
// scene.environmentRotation.x = 1;

backgroundFolder.add(scene, 'environmentIntensity').min(0).max(10).step(0.001).name('Light intensity');
backgroundFolder.add(scene, 'backgroundBlurriness').min(0).max(1).step(0.001).name('Background blurriness');
backgroundFolder.add(scene, 'backgroundIntensity').min(1).max(10).step(0.001).name('Background intensity');
backgroundFolder
	.add(scene.backgroundRotation, 'y')
	.min(0)
	.max(Math.PI * 2)
	.step(0.001)
	.name('Background rotation');
backgroundFolder
	.add(scene.environmentRotation, 'y')
	.min(0)
	.max(Math.PI * 2)
	.step(0.001)
	.name('Environment rotation');

// LDR cube texture
// const environmentMap = cubeTextureLoader.load([
// 	'/environmentMaps/0/px.png',
// 	'/environmentMaps/0/nx.png',
// 	'/environmentMaps/0/py.png',
// 	'/environmentMaps/0/ny.png',
// 	'/environmentMaps/0/pz.png',
// 	'/environmentMaps/0/nz.png',
// ]);
// scene.environment = environmentMap;
// scene.background = environmentMap;

// Ground projected skybox
// rgbeLoader.load('/environmentMaps/2/2k.hdr', (environmentMap) => {
// 	environmentMap.mapping = THREE.EquirectangularRefractionMapping;
// 	scene.environment = environmentMap;

// Skybox
// 	const skybox = new GroundedSkybox(environmentMap, 15, 70);
// 	skybox.position.y = 15;
// 	scene.add(skybox);
// });

// Real time environment map
const environmentMap = textureLoader.load('/environmentMaps/blockadesLabsSkybox/interior.jpg');
environmentMap.mapping = THREE.EquirectangularReflectionMapping;
environmentMap.colorSpace = THREE.SRGBColorSpace;

scene.background = environmentMap;

// Holy donut
const holyDonut = new THREE.Mesh(
	new THREE.TorusGeometry(8, 0.5),
	new THREE.MeshBasicMaterial({ color: new THREE.Color(10, 4, 2) })
);
holyDonut.layers.enable(1);
holyDonut.position.y = 3.5;
scene.add(holyDonut);

// Cube redner targer
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, { type: THREE.HalfFloatType });
scene.environment = cubeRenderTarget.texture;

// Cuber camera
const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);
cubeCamera.layers.set(1);

/**
 * Torus Knot
 */
const torusKnot = new THREE.Mesh(
	new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
	new THREE.MeshStandardMaterial({ roughness: 0.1, metalness: 1, color: 0xaaaaaa })
);
torusKnot.position.x = -4;
torusKnot.position.y = 4;
scene.add(torusKnot);

// Models
gltfLoader.load('/models/FlightHelmet/glTF/FlightHelmet.gltf', (gltf) => {
	gltf.scene.scale.set(10, 10, 10);
	scene.add(gltf.scene);
});

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener('resize', () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(4, 5, 4);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.y = 3.5;
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
const tick = () => {
	// Time
	const elapsedTime = clock.getElapsedTime();

	// Real time environment map
	if (holyDonut) {
		holyDonut.rotation.x = Math.sin(elapsedTime) * 2;
		cubeCamera.update(renderer, scene);
	}

	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
