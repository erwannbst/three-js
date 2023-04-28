import {
  ACESFilmicToneMapping,
  EquirectangularReflectionMapping,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  sRGBEncoding,
} from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

let camera: PerspectiveCamera;
let scene: Scene;
let renderer: WebGLRenderer;
let bones: any = [];

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

    const loader = new GLTFLoader().setPath("/public/");
    loader.load("tentacule.gltf", (gltf) => {
      const tentacule = gltf.scene;

      for (let i = 0; i < 8; i++) {
        const tentaculeClone = clone(tentacule);
        let bone = tentaculeClone.getObjectByName("Bone");
        let currentBone = bone?.children;
        bones[i] = [];

        while (!(currentBone === undefined) && currentBone.length > 0) {
          bones[i].push(currentBone[0]);
          currentBone = currentBone[0].children;
        }

        // position the 8 tentacules around the main one
        tentaculeClone.position.x = Math.cos((i * Math.PI) / 4) * 0.5;
        tentaculeClone.position.y = Math.sin((i * Math.PI) / 4) * 0.5;
        tentaculeClone.position.z = 0;

        // rotate the 8 tentacules around the main one
        tentaculeClone.rotation.z = (i * Math.PI) / 4;

        scene.add(tentaculeClone);
      }

      // scene.add(tentacule);
    });

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

function animate() {
  requestAnimationFrame(animate);

  bones.forEach((tent: any, tentNb: number) => {
    const dephase = ((tentNb + 1) / 8 + 20) / 30;
    tent.forEach((bone: any, index: number) => {
      bone.rotation.x = -Math.abs((Math.sin(Date.now() * 0.002 * dephase) * 0.1 * index) / 3);
    });
  });

  render();
}
