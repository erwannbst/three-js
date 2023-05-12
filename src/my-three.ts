import {
  ACESFilmicToneMapping,
  EquirectangularReflectionMapping,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  sRGBEncoding,
} from "three";
import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

let camera: PerspectiveCamera;
let scene: Scene;
let renderer: WebGLRenderer;
// let bones: any = [];
const cubes: any = [];

init();
animate();

function init() {
  const container = document.querySelector("#app") as HTMLElement;
  document.body.appendChild(container);

  camera = new PerspectiveCamera(93, window.innerWidth / window.innerHeight, 0.15, 30);
  camera.position.set(-25, 0.6, 2.7);

  scene = new Scene();

  new RGBELoader().setPath("/public/").load("venice_sunset_1k.hdr", (texture) => {
    texture.mapping = EquirectangularReflectionMapping;

    scene.background = texture;
    scene.environment = texture;

    for (let i = 0; i < 30; i++) {
      addCube(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
    }

    // const quaternion = new THREE.Quaternion();
    // quaternion.setFromAxisAngle(new THREE.Vector3(2, 10, 3), Math.PI);
    // const cube = addCube(10, 2, 2);
    // cube.applyQuaternion(quaternion);

    // const loader = new GLTFLoader().setPath("/public/");
    // loader.load("tentacule.gltf", (gltf) => {
    //   const tentacule = gltf.scene;

    //   for (let i = 0; i < 8; i++) {
    //     const tentaculeClone = clone(tentacule);
    //     let bone = tentaculeClone.getObjectByName("Bone");
    //     let currentBone = bone?.children;
    //     bones[i] = [];

    //     while (!(currentBone === undefined) && currentBone.length > 0) {
    //       bones[i].push(currentBone[0]);
    //       currentBone = currentBone[0].children;
    //     }

    //     // position the 8 tentacules around the main one
    //     tentaculeClone.position.x = Math.cos((i * Math.PI) / 4) * 0.5;
    //     tentaculeClone.position.y = Math.sin((i * Math.PI) / 4) * 0.5;
    //     tentaculeClone.position.z = 0;

    //     // rotate the 8 tentacules around the main one
    //     tentaculeClone.rotation.z = (i * Math.PI) / 4;

    //     scene.add(tentaculeClone);
    //   }

    //   // scene.add(tentacule);
    // });

    animate();
  });

  // renderer
  renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputEncoding = sRGBEncoding;
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener("change", render); // use if there is no animation loop
  controls.minDistance = 2;
  controls.maxDistance = 15;
  controls.target.set(0, 0, -0.2);
  controls.update();

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  animate();
}

function render() {
  renderer.render(scene, camera);
}

function addCube(px: number, py: number, pz: number) {
  var colorandom = new THREE.Color(0xffffff);
  colorandom.setHex(Math.random() * 0xffffff);
  var geometry = new THREE.BoxGeometry(1, 1, 1); //x,y,z
  var boxMaterial = new THREE.MeshBasicMaterial({ color: colorandom });
  var cube = new THREE.Mesh(geometry, boxMaterial);

  cube.position.set(px, py, pz);
  cube.geometry.computeBoundingBox(); // null sinon
  const direction = new THREE.Vector3(
    Math.random() * 0.1 - 0.05,
    Math.random() * 0.1 - 0.05,
    Math.random() * 0.1 - 0.05
  );
  cubes.push({ cube, direction });
  scene.add(cube);
  return cube;
}

function animate() {
  requestAnimationFrame(animate);

  // make each cube move in a random direction
  cubes.forEach(({ cube, direction }: any, index: number) => {
    cube.position.x += direction.x * (index + 5) * 0.05;
    cube.position.y += direction.y * (index + 5) * 0.05;
    cube.position.z += direction.z * (index + 5) * 0.05;

    cubes.forEach(({ cube: cube2 }: any, index2: number) => {
      if (index !== index2) {
        const box1 = new THREE.Box3().setFromObject(cube);
        const box2 = new THREE.Box3().setFromObject(cube2);

        if (box1.intersectsBox(box2)) {
          console.log("collision");

          // make the cube rebondir on the other cube according to the angle of collision
          const angle = Math.atan2(
            cube.position.y - cube2.position.y,
            cube.position.x - cube2.position.x
          );
          const angle2 = Math.atan2(
            cube.position.z - cube2.position.z,
            cube.position.x - cube2.position.x
          );
          const angle3 = Math.atan2(
            cube.position.y - cube2.position.y,
            cube.position.z - cube2.position.z
          );
          cube.position.x = cube2.position.x + Math.cos(angle) * 1.1;
          cube.position.y = cube2.position.y + Math.sin(angle2) * 1.1;
          cube.position.z = cube2.position.z + Math.sin(angle3) * 1.1;
        }
      }
    });

    // if the cube is out of the screen, put it back in the screen
    if (
      cube.position.x > 10 ||
      cube.position.x < -10 ||
      cube.position.y > 10 ||
      cube.position.y < -10 ||
      cube.position.z > 10 ||
      cube.position.z < -10
    ) {
      console.log("out of screen", cube.position.x, cube.position.y, cube.position.z);
      // make the cube stay in the screen
      direction.x = -direction.x;
      direction.y = -direction.y;
      direction.z = -direction.z;
    }
  });

  // bones.forEach((tent: any, tentNb: number) => {
  //   const dephase = ((tentNb + 1) / 8 + 20) / 30;
  //   tent.forEach((bone: any, index: number) => {
  //     bone.rotation.x = -Math.abs((Math.sin(Date.now() * 0.002 * dephase) * 0.1 * index) / 3);
  //   });
  // });

  render();
}
