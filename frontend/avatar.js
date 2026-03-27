// avatar.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRMLoaderPlugin } from '@pixiv/three-vrm';

const initVRM = () => {
    const container = document.getElementById('app');

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    // Move camera back to see the torso and head
    const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 20);
    camera.position.set(0, 1.4, 3);

    // Controls (lets you spin the 3D model around with your mouse!)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.4, 0); // Focus crosshairs on the face
    controls.update();

    // Lights
    const light = new THREE.DirectionalLight(0xffffff, Math.PI);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040, 2));

    // VRM Model Loading Pipeline
    let currentVrm = null;
    const loader = new GLTFLoader();

    // Register the VRM handler plugin to the standard GLTF loader
    loader.register((parser) => new VRMLoaderPlugin(parser));

    // ==========================================
    // HOW TO REPLACE THE CHARACTER:
    // Change this URL to point to your custom .vrm file (like from VRoid Studio)
    // Example: const vrmUrl = './assets/my_anime_character.vrm';
    // ==========================================
    // We strictly use a `.vrm` standard test avatar over CDN (Alicia Solid, official VRM Consortium test model)
    const vrmUrl = 'C:\Users\Ashish\my code\neuroavatar\rehan\frontend\Bizdude.vrm';

    loader.load(
        vrmUrl,
        (gltf) => {
            const vrm = gltf.userData.vrm;

            // Fix rotation so model faces camera
            vrm.scene.rotation.y = Math.PI;

            // Add VRM to scene
            scene.add(vrm.scene);
            currentVrm = vrm;

            console.log('3D VRM loaded cleanly!');
        },
        (progress) => console.log('Loading 3D model...', 100.0 * (progress.loaded / progress.total), '%'),
        (error) => console.error(error)
    );

    // Lip Sync Simulation Logic
    let isTalking = false;
    let time = 0;
    const clock = new THREE.Clock();

    const animate = () => {
        requestAnimationFrame(animate);
        const deltaTime = clock.getDelta();

        if (currentVrm) {
            // Update kinematics and VRM specific blendshapes
            currentVrm.update(deltaTime);

            if (isTalking) {
                time += deltaTime * 12.0; // Talk speed
                // Create a bouncy wave between 0 and 1
                const openAmount = Math.max(0, Math.sin(time));

                // Directly manipulate the 'aa' (ah) blendshape for Speech
                currentVrm.expressionManager.setValue('aa', openAmount);
            } else {
                // Smoothly close the mouth when quiet
                currentVrm.expressionManager.setValue('aa', 0);
            }
        }

        renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Button Triggers
    const btn = document.getElementById('talkBtn');
    btn.addEventListener('mousedown', () => isTalking = true);
    btn.addEventListener('mouseup', () => isTalking = false);
    btn.addEventListener('mouseleave', () => isTalking = false);
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); isTalking = true; });
    btn.addEventListener('touchend', (e) => { e.preventDefault(); isTalking = false; });
};

initVRM();
