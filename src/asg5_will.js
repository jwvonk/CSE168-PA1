import * as THREE from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";

function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

  renderer.xr.enabled = true;
  document.body.appendChild(VRButton.createButton(renderer));

  renderer.shadowMap.enabled = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const base = new THREE.Object3D();

  const helpers = [];

  const fov = 75;
  const aspect = canvas.clientWidth / canvas.clientHeight;
  const near = 0.1;
  const far = 50;

  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  const cameraHelper = new THREE.CameraHelper(camera);
  helpers.push(cameraHelper);

  const cameraGroup = new THREE.Object3D();
  cameraGroup.position.set(1, 1, -1);
  cameraGroup.add(camera)
  base.add(cameraGroup);

  const scene = new THREE.Scene();
  {
    const loader = new THREE.TextureLoader();
    const texture = loader.load("../assets/Will/goegap_2k.jpg", () => {
      const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
      rt.fromEquirectangularTexture(renderer, texture);
      scene.background = rt.texture;
    });
    scene.rotation.y = (-45 * Math.PI) / 180;
  }

  scene.add(base);

  {
    const color = 0xd9c896;
    const near = 5;
    const far = 45;
    scene.fog = new THREE.Fog(color, near, far);
  }

  {
    const planeSize = 100;
    const loader = new THREE.TextureLoader();
    const disp = loader.load("../assets/Will/aerial_beach_01_disp_2k.jpg");
    disp.wrapS = THREE.RepeatWrapping;
    disp.wrapT = THREE.RepeatWrapping;
    disp.magFilter = THREE.NearestFilter;
    disp.repeat.set(planeSize / 32, planeSize / 32);

    const norm = loader.load("../assets/Will/aerial_beach_01_nor_gl_2k.jpg");
    norm.wrapS = THREE.RepeatWrapping;
    norm.wrapT = THREE.RepeatWrapping;
    norm.magFilter = THREE.NearestFilter;
    norm.repeat.set(planeSize / 32, planeSize / 32);

    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize, 500, 500);
    const planeMat = new THREE.MeshPhongMaterial({
      color: 0xd9c896,
      displacementMap: disp,
      displacementScale: 0.7,
      normalMap: norm,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.receiveShadow = true;
    mesh.rotation.x = Math.PI * -0.5;
    scene.add(mesh);
  }

  {
    const ambientColor = 0xd9c896;
    const intensity = 0.2;
    const light = new THREE.AmbientLight(ambientColor, intensity);
    scene.add(light);
  }

  {
    const color = 0xffffff;
    const intensity = 0.9;
    const light = new THREE.DirectionalLight(color, intensity);
    light.castShadow = true;
    light.position.set(50, 15, -50);
    light.target.position.set(0, 0, 0);
    light.shadow.camera.zoom = 1;
    light.shadow.camera.left *= 5;
    light.shadow.camera.right *= 5;
    light.shadow.camera.top *= 2;
    light.shadow.camera.bottom *= 1.2;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    scene.add(light);
    scene.add(light.target);

    const helper = new THREE.DirectionalLightHelper(light);
    helpers.push(helper);
    const cameraHelper = new THREE.CameraHelper(light.shadow.camera);
    helpers.push(cameraHelper);
  }

  {
    const pyramidMat = new THREE.MeshPhongMaterial({ color: "#CA8" });
    let y = 0.25;
    for (let x = 15; x > 0; x--) {
      const pyramidGeo = new THREE.BoxGeometry(x, 0.5, x);
      const mesh = new THREE.Mesh(pyramidGeo, pyramidMat);
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      mesh.position.set(9, y, 8);
      scene.add(mesh);
      y += 0.5;
    }
  }

  {
    const pyramidMat = new THREE.MeshPhongMaterial({ color: "#CA8" });
    let y = 0.25;
    for (let x = 15; x > 0; x--) {
      const pyramidGeo = new THREE.BoxGeometry(x, 0.5, x);
      const mesh = new THREE.Mesh(pyramidGeo, pyramidMat);
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      mesh.position.set(-8, y, -9);
      scene.add(mesh);
      y += 0.5;
    }
  }

  const jewels = [];
  {
    const jewelGeo = new THREE.IcosahedronGeometry();
    const jewelMat = new THREE.MeshPhongMaterial({
      color: "#289964",
      specular: "#FFFFFF",
      shininess: 30,
    });

    const jewel = new THREE.Mesh(jewelGeo, jewelMat);
    jewel.position.set(9, 9, 8);
    jewel.castShadow = true;
    scene.add(jewel);
    jewels.push(jewel);
  }

  {
    const jewelGeo = new THREE.TetrahedronGeometry();
    const jewelMat = new THREE.MeshPhongMaterial({
      color: "#997d28",
      specular: "#FFFFFF",
      shininess: 30,
    });

    const jewel = new THREE.Mesh(jewelGeo, jewelMat);
    jewel.position.set(-8, 9, -9);
    jewel.castShadow = true;
    scene.add(jewel);
    jewels.push(jewel);
  }

  const spotLights = [];
  {
    const color = 0x289964;
    const intensity = 1;
    const light = new THREE.SpotLight(color, intensity);
    light.position.set(9, 9, 8);
    light.target.position.set(0, 1, 0);
    light.penumbra = 0.1;
    light.angle = (10 * Math.PI) / 180;
    light.castShadow = true;
    light.shadow.camera.far = 40;
    scene.add(light);
    base.add(light.target);
    spotLights.push(light);
    const helper = new THREE.SpotLightHelper(light);
    scene.add(helper);
    helpers.push(helper);
    const cameraHelper = new THREE.CameraHelper(light.shadow.camera);
    scene.add(cameraHelper);
    helpers.push(cameraHelper);
  }

  {
    const color = 0x997d28;
    const intensity = 1;
    const light = new THREE.SpotLight(color, intensity);
    light.position.set(-8, 9, -9);
    light.target.position.set(0, 1, 0);
    light.penumbra = 0.1;
    light.angle = (10 * Math.PI) / 180;
    light.castShadow = true;
    light.shadow.camera.far = 40;
    scene.add(light);
    base.add(light.target);
    spotLights.push(light);
    const helper = new THREE.SpotLightHelper(light);
    scene.add(helper);
    helpers.push(helper);
    const cameraHelper = new THREE.CameraHelper(light.shadow.camera);
    scene.add(cameraHelper);
    helpers.push(cameraHelper);
  }

  let ship;
  {
    // Pirate Ship by Braden Brunk [CC-BY] (https://creativecommons.org/licenses/by/3.0/) via Poly Pizza (https://poly.pizza/m/7aHmBgTur3V)
    const mtlLoader = new MTLLoader();
    mtlLoader.load("../assets/Will/pirateship/materials.mtl.bak", (mtl) => {
      mtl.preload();
      const objLoader = new OBJLoader();
      objLoader.setMaterials(mtl);
      objLoader.load("../assets/Will/pirateship/model.obj", (root) => {
        root.scale.set(4, 4, 4);
        root.position.set(0, 1, 0);
        root.rotation.y = (90 * Math.PI) / 180;
        base.add(root);
        root.traverse((child) => {
          child.castShadow = true;
          child.receiveShadow = true;
        });
        ship = root;
      });
    });
  }

  function render(time) {
    time *= 0.001; // convert time to seconds

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    // Debug
    let visible = false;
    helpers.forEach((helper) => {
      if (helper.visible != visible) {
        helper.visible = visible;
        helper.update();
      }
    });

    jewels.forEach((jewel, ndx) => {
      const speed = 1 + ndx * 0.1;
      const rot = time * speed;
      const ele = (Math.sin(time + ndx) * speed) / 2 + 9;
      jewel.rotation.x = rot;
      jewel.rotation.y = rot;
      jewel.position.y = ele;
    });

    spotLights.forEach((light, ndx) => {
      const speed = 1 + ndx * 0.1;
      const ele = (Math.sin(time + ndx) * speed) / 2 + 10.5;
      light.position.y = ele;
    });

    base.position.x = (time % 40) - 20;
    base.position.z = -((time % 40) - 20);
    base.position.y = Math.sin(time) * 0.05 + 0.1;

    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(render);

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = (canvas.clientWidth * pixelRatio) | 0;
    const height = (canvas.clientHeight * pixelRatio) | 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }
}

main();
