import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {FirstPersonControls} from 'three/addons/controls/FirstPersonControls.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';
import Stats from '../node_modules/stats.js/src/Stats.js';

const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)

// Global Variable
let g_spotOn = true;
let g_ambient = true;
let g_direct = true;
let g_orbit = true;
let controls;
let g_fog = true;
let activeCamera;
let g_snow = true; 

function main() {
  
  // Buttons from 
  document.getElementById('spotlightOn').onclick = function(){g_spotOn = true; updateSpotlightVisibility(); console.log(g_spotOn) };
  document.getElementById('spotlightOff').onclick = function(){g_spotOn = false; updateSpotlightVisibility();console.log(g_spotOn) };
 
  document.getElementById('ambientLightOn').onclick = function(){g_ambient = true; updateAmbientVisibility();console.log(g_ambient) };
  document.getElementById('ambientLightOff').onclick = function(){g_ambient = false; updateAmbientVisibility();console.log(g_ambient) };

  document.getElementById('directOn').onclick = function(){g_direct = true; updateDirectVisibility();console.log(g_direct) };
  document.getElementById('directOff').onclick = function(){g_direct = false; updateDirectVisibility();console.log(g_direct) };
  
  document.getElementById('orbitOn').onclick = function(){g_orbit = true; updateControls();}
  document.getElementById('orbitOff').onclick = function(){g_orbit = false; updateControls();}

  document.getElementById('fogOn').onclick = function(){g_fog = true; updateFog(); }
  document.getElementById('fogOff').onclick = function(){g_fog = false; updateFog();}

  // Camera Switching
  document.getElementById('camera1').onclick = function () { activeCamera = camera; updateControls(); };
  document.getElementById('camera2').onclick = function () { activeCamera = camera2; updateControls(); };

  // Snow Toggle
  document.getElementById('snowOn').onclick = function () { g_snow = true; updateSnowVisibility(); };
  document.getElementById('snowOff').onclick = function () { g_snow = false; updateSnowVisibility(); };

  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  
  const fov = 100;
  const aspect = 2;
  const near = 0.1;
  const far = 50;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 10;
  camera.position.y = -5;

  const camera2 = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera2.position.set(0, 10, -20);
camera2.lookAt(0, -5, 0);

  activeCamera = camera; // Set initial active camera

  const scene = new THREE.Scene();

  function updateFog(){
    if(g_fog){
      const near = 2;
      const far = 22;
      const color = 'lightblue';
      scene.fog = new THREE.Fog(color, near, far);
    }
    else{
      scene.fog = null;
    }
  }


    // Cubemap loading
    const textureLoader = new THREE.CubeTextureLoader();
    const texture = textureLoader.load([
      './img/sky.jpg',
      './img/sky.jpg',
      './img/sky.jpg',
      './img/snow.jpg',
      './img/sky.jpg',
      './img/sky.jpg',
    ]);
    scene.background = texture;

    const textureLoader2 = new THREE.TextureLoader();
    const floorTexture = textureLoader2.load('./img/snow.jpg'); 
    const floorMaterial = new THREE.MeshStandardMaterial({ map: floorTexture });
    const floorGeometry = new THREE.PlaneGeometry(500, 1000);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.position.set(0, -5, 0);
    scene.add(floor);

  ////////////////////////////////////////////////////////////////////////////////
  // Movement and Mouse Controls
  updateControls(); // Initial controls setup

  function updateControls() {
    if (g_orbit) {
      controls = new OrbitControls(activeCamera, renderer.domElement);
      controls.target.set(0, 0, 0);
      controls.update();
    } else {
      controls = new FirstPersonControls(activeCamera, renderer.domElement);
      controls.movementSpeed = 5;
      controls.lookSpeed = 0.3;
    }
  }

  const clock = new THREE.Clock();
  const groundLevel = -5;

// Making snow ball move 
const geometry1 = new THREE.SphereGeometry(0.2, 32, 32);
  const movingSphere = makeInstance(geometry1, 0xffffff,  [1, -4.9, 5])
  let direction = 1;
  const speed = 0.05;
  const rotationSpeed = 0.05; // Adjust rotation speed

  //Snow
  const particleGeometry = new THREE.BufferGeometry();
  const particlesCount = 10000;
  
  const positions = new Float32Array(particlesCount * 3);
  
  for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 50;
  }
  
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
  });
  
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  updateSnowVisibility(); // Initial snow visibility

  function updateSnowVisibility() {
      if (g_snow) {
          scene.add(particles);
      } else {
          scene.remove(particles);
      }
  }

  function animate() {
      // Snow
    if (g_snow) {
      const positions = particleGeometry.attributes.position.array;

      for (let i = 1; i < particlesCount * 3; i += 3) {
          positions[i] -= 0.05 + Math.random() * 0.01;
          positions[i] += Math.random() * 0.01 - 0.005;
          positions[i - 1] += Math.random() * 0.02 - 0.01;
          positions[i + 1] += Math.random() * 0.02 - 0.01;

          if (positions[i] < -25) {
              positions[i] = 25;
          }
      }
    }
    particleGeometry.attributes.position.needsUpdate = true;

    //////////////////
    requestAnimationFrame(animate);
        // Move the sphere back and forth
        movingSphere.position.z += direction * speed;

        // Rotate the sphere
        movingSphere.rotation.x += direction * rotationSpeed; // Rotate along X-axis

        // Change direction when sphere reaches certain limits
        if (movingSphere.position.z > 5) {
            direction = -1;
        } else if (movingSphere.position.z < -5) {
            direction = 1;
        }

    const delta = clock.getDelta();
    controls.update(delta);

    // Ground constraint with raycasting for better accuracy
    const raycaster = new THREE.Raycaster(new THREE.Vector3(activeCamera.position.x, activeCamera.position.y + 1, activeCamera.position.z), new THREE.Vector3(0, -1, 0));
    const intersects = raycaster.intersectObjects([floor]); // Array of ground meshes
    if (intersects.length > 0) {
      const intersectionPoint = intersects[0].point.y;
      const cameraHeight = activeCamera.position.y;
      const desiredHeight = groundLevel + 1.6; // Adjust this value based on your camera height.
      if (cameraHeight < desiredHeight) {
        activeCamera.position.y = desiredHeight;
      }
    }

    renderer.render(scene, activeCamera);
    stats.update();
  }

  animate();
//////////////////////////////////////////////////////////////////////////////////////

  //////////////////
  // Directional Light
  const color = 0xffffff;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
  scene.add(light);

  // Ambient Light
  const ambient = new THREE.AmbientLight(color, 1);
  scene.add(ambient);
////////////////////////////////
  // Spot light ooo
  const spot = new THREE.SpotLight(0xffff00, 50);
  spot.angle = 6.8;
  spot.position.x = 9;
  spot.position.y = 5;
  spot.target.position.x = 8;
  updateSpotlightVisibility();
  

  
  // Change the spotlight color 
  function updateDirectVisibility() {
    if (g_direct) {
      scene.add(light);
    } else {
      scene.remove(light);
    }
  }


  // Change the spotlight color 
  function updateAmbientVisibility() {
    if (g_ambient) {
      scene.add(ambient);

    } else {
      scene.remove(ambient);
    }
  }


  // Change the spotlight color 
  function updateSpotlightVisibility() {
    if (g_spotOn) {
      scene.add(spot);
      scene.add(spot.target);
    } else {
      scene.remove(spot);
      scene.remove(spot.target);
    }
  }
  
  // const helper = new THREE.SpotLightHelper(spot);
  // scene.add(helper);
////////////////////////////////////
// Object
// Load multiple objects
const objectsToLoad = [
  { objPath: './blender/RZ-01.mtl.obj', mtlPath: './blender/RZ-01.mtl.mtl', position: new THREE.Vector3(0, 0, 0), scale: 0.7,  rotationY: 0  },
  { objPath: './blender/gummy.obj', mtlPath: './blender/gummy.mtl', position: new THREE.Vector3(-5, -2.8, 0), scale: 0.7,  rotationY: Math.PI },
  { objPath: './blender/candy-crush-candies.obj', mtlPath: './blender/candy-crush-candies.mtl', position: new THREE.Vector3(5, -5.5, 2), scale: 1,  rotationY: 0 },
  { objPath: './blender/candy2.obj', mtlPath: './blender/candy2.mtl', position: new THREE.Vector3(0, -5, 0), scale: 1,  rotationY: 0 },
  { objPath: './blender/christmas-sleigh.obj', mtlPath: './blender/christmas-sleigh.mtl', position: new THREE.Vector3(-7, -4.5, 0), scale: 3,  rotationY: -130 },
  { objPath: './blender/snow.obj', mtlPath: './blender/snow.mtl', position: new THREE.Vector3(-10, -4.5, 0), scale: 1,  rotationY: -130 },
  { objPath: './blender/snow.obj', mtlPath: './blender/snow.mtl', position: new THREE.Vector3(14, -4.5, 0), scale: 1,  rotationY: -130 },
  { objPath: './blender/snow.obj', mtlPath: './blender/snow.mtl', position: new THREE.Vector3(12, -4.5, -5), scale: 1,  rotationY: 0 },
  { objPath: './blender/snow.obj', mtlPath: './blender/snow.mtl', position: new THREE.Vector3(0, -4.5, -6), scale: 1,  rotationY: 0 },
  { objPath: './blender/snow.obj', mtlPath: './blender/snow.mtl', position: new THREE.Vector3(5, -4.5, -6), scale: 1,  rotationY: 21 },
  { objPath: './blender/bugatti.mtl.obj', mtlPath: './blender/bugatti.mtl.mtl', position: new THREE.Vector3(7, -5, 0), scale: 1,  rotationY: -51 },
];

objectsToLoad.forEach(objectData => {
  const mtlLoader = new MTLLoader();
  mtlLoader.load(objectData.mtlPath, (materials) => {
      materials.preload();

      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);

      objLoader.load(objectData.objPath, (root) => {
          root.scale.set(objectData.scale, objectData.scale, objectData.scale);
          root.position.copy(objectData.position); // Set the object's position
          root.rotation.y = objectData.rotationY; // Apply rotation
          root.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                  child.material.side = THREE.DoubleSide;
              }
          });
          scene.add(root);
      });
  });
});

const geometry = new THREE.SphereGeometry(3, 32, 32); // Radius, width segments, height segments
const geometry2 = new THREE.SphereGeometry(0.6, 32, 32); // Radius, width segments, height segments

function makeInstance(geometry, color, pos){
  const material = new THREE.MeshBasicMaterial({ color }); // Green color
  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  sphere.position.x = pos[0];
  sphere.position.y = pos[1];
  sphere.position.z = pos[2];

  return sphere;
}

// Clouds
makeInstance(geometry, 0xffffff,  [0, 25, -35])
makeInstance(geometry, 0xffffff,  [-5, 25, -35])
makeInstance(geometry, 0xffffff,  [5, 25, -35])

makeInstance(geometry, 0xffffff,  [-30, 25, -22])
makeInstance(geometry, 0xffffff,  [-35, 25, -22])

makeInstance(geometry, 0xffffff,  [25, 15, -15])
makeInstance(geometry, 0xffffff,  [35, 15, -15])
makeInstance(geometry, 0xffffff,  [30, 15, -15])

// snowballs
makeInstance(geometry1, 0xffffff,  [-5, -4.9, 6])
makeInstance(geometry1, 0xffffff,  [2, -4.9, 6])
makeInstance(geometry1, 0xffffff,  [-3, -4.9, 4])
makeInstance(geometry1, 0xffffff,  [6, -4.9, 6])

// Basketball
const ball = new THREE.SphereGeometry(0.6, 32, 32); // Radius, width segments, height segments
const textureLoader3 = new THREE.TextureLoader();
textureLoader3.load('./img/basketball.jpg', (texture) => { // Replace 'your_texture.jpg' with your file path
const material3 = new THREE.MeshBasicMaterial({ map: texture }); // Or MeshStandardMaterial for lighting
const Baseball = new THREE.Mesh(ball, material3);
Baseball.position.set(-3, -4.5, 0.6);
scene.add(Baseball);
});


const bottom = new THREE.SphereGeometry(1, 32, 32); // Radius, width segments, height segments
const middle = new THREE.SphereGeometry(0.7, 32, 32); // Radius, width segments, height segments
const head = new THREE.SphereGeometry(0.5, 32, 32); // Radius, width segments, height segments

// Snowman 
makeInstance(bottom , 0xffffff,  [8, -4.5, 6])
makeInstance(middle , 0xffffff,  [8, -3, 6])
makeInstance(head , 0xffffff,  [8, -2, 6])

  // Create the geometry (a box with the desired dimensions)


function createRectangle(geometry, color, pos, rotation){
  const material = new THREE.MeshBasicMaterial({ color: color });
  const rectangle = new THREE.Mesh(geometry, material);

  rectangle.rotation.set(rotation[0], rotation[1], rotation[2]);

  rectangle.position.x = pos[0];
  rectangle.position.y = pos[1];
  rectangle.position.z = pos[2];
  scene.add(rectangle);

  return rectangle;
}
// Create a rectangle
const rectangleWidth = 1.4;
const rectangleHeight = 0.1;
const rectangleDepth = 0.1;
const rectangleColor = 0x5C4033;
const leftArm = new THREE.BoxGeometry(rectangleWidth, rectangleHeight, rectangleDepth);
createRectangle(leftArm, rectangleColor, [7, -2.5, 6], [0, 0, 2.2]);
createRectangle(leftArm, rectangleColor, [8.8, -3.6, 6], [0, 0, 11.5]);

// Buttons
const buttonWidth = 0.1;
const buttonHeight = 0.1;
const buttonDepth = 0.1;
const buttonColor = 0x000000;
const button = new THREE.BoxGeometry(buttonWidth, buttonHeight, buttonDepth);
createRectangle(button, buttonColor, [8, -2.6, 6.7], [0, 0, 2.2]);
createRectangle(button, buttonColor, [8, -3.4, 6.6], [0, 0, 2.2]);
createRectangle(button, buttonColor, [8, -3.0, 6.7], [0, 0, 2.2]);

// Face
const eye = new THREE.SphereGeometry(0.05, 32, 32); // Radius, width segments, height segments
makeInstance(eye, 0x000000, [7.8, -2.0, 6.5])
makeInstance(eye, 0x000000, [8.2, -2.0, 6.5])

// Making a nose
function createCone(geometry, color, position, rotation) {
  const material = new THREE.MeshBasicMaterial({ color: color });
  const cone = new THREE.Mesh(geometry, material);

  cone.rotation.set(rotation[0], rotation[1], rotation[2]);

  cone.position.x = position[0];
  cone.position.y = position[1];
  cone.position.z = position[2];
  scene.add(cone);

  return cone;
}

const coneRadius = 0.2;
const coneHeight = 1;
const coneRadialSegments = 32;
const coneColor = 0xFFA500; // Green
const nose = new THREE.ConeGeometry(coneRadius, coneHeight, coneRadialSegments);
createCone(nose, coneColor, [8, -2.2, 6.5], [1.7,0,0]);


renderer.render(scene, activeCamera);


// Create a sphere geometry

    //////////////////////////


    //////////////////////////////
    // Shapes


    /////////////////////////////
}
main();