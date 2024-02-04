import * as THREE from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";

function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

  renderer.xr.enabled = true;
  document.body.appendChild(VRButton.createButton(renderer));

  renderer.shadowMap.enabled = false;
  renderer.shadowMap.type = THREE.BasicShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const base = new THREE.Object3D();

  const helpers = [];

  const fov = 75;
  const aspect = canvas.clientWidth / canvas.clientHeight;
  const near = 0.1;
  const far = 500;

  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  const cameraHelper = new THREE.CameraHelper(camera);
  helpers.push(cameraHelper);

  const cameraParent = new THREE.Object3D();
  cameraParent.position.set(-7.5, .7, 7.5);
  cameraParent.add(camera);
  base.add(cameraParent);

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
    const far = 450;
    scene.fog = new THREE.Fog(color, near, far);
  }

  {
    const planeSize = 1000;
    const loader = new THREE.TextureLoader();
    const disp = loader.load("../assets/Will/aerial_beach_01_disp_2k.jpg");
    disp.wrapS = THREE.RepeatWrapping;
    disp.wrapT = THREE.RepeatWrapping;
    disp.magFilter = THREE.NearestFilter;
    disp.repeat.set(planeSize / 320, planeSize / 320);

    const norm = loader.load("../assets/Will/aerial_beach_01_nor_gl_2k.jpg");
    norm.wrapS = THREE.RepeatWrapping;
    norm.wrapT = THREE.RepeatWrapping;
    norm.magFilter = THREE.NearestFilter;
    norm.repeat.set(planeSize / 320, planeSize / 320);

    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize, 4000, 4000);
    const planeMat = new THREE.MeshPhongMaterial({
      color: 0xd9c896,
      displacementMap: disp,
      displacementScale: 7,
      normalMap: norm,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.position.set(0, -3, 0);
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
    light.position.set(500, 150, -500);
    light.target.position.set(0, 0, 0);
    light.shadow.camera.zoom = 1;
    light.shadow.camera.left *= 50;
    light.shadow.camera.right *= 50;
    light.shadow.camera.top *= 20;
    light.shadow.camera.bottom *= 12;
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
      const pyramidGeo = new THREE.BoxGeometry(10 * x, 5, 10 * x);
      const mesh = new THREE.Mesh(pyramidGeo, pyramidMat);
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      mesh.position.set(90, y, 80);
      scene.add(mesh);
      y += 5;
    }
  }

  {
    const pyramidMat = new THREE.MeshPhongMaterial({ color: "#CA8" });
    let y = 0.25;
    for (let x = 15; x > 0; x--) {
      const pyramidGeo = new THREE.BoxGeometry(10 * x, 5, 10 * x);
      const mesh = new THREE.Mesh(pyramidGeo, pyramidMat);
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      mesh.position.set(-80, y, -90);
      scene.add(mesh);
      y += 5;
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
    jewel.position.set(90, 0, 80);
    jewel.scale.set(10, 10, 10);
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
    jewel.position.set(-80, 0, -90);
    jewel.scale.set(10, 10, 10);
    jewel.castShadow = true;
    scene.add(jewel);
    jewels.push(jewel);
  }

  const spotLights = [];
  {
    const color = 0x289964;
    const intensity = 1;
    const light = new THREE.SpotLight(color, intensity);
    light.position.set(90, 0, 80);
    light.penumbra = 0.1;
    light.angle = (10 * Math.PI) / 180;
    light.castShadow = true;
    light.shadow.camera.far = 20;
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
    light.position.set(-80, 0, -90);
    light.penumbra = 0.1;
    light.angle = (10 * Math.PI) / 180;
    light.castShadow = true;
    light.shadow.camera.far = 20;
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
        root.scale.set(40, 40, 40);
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

    jewels.forEach((jewel, ndx) => {
      const speed = 1 + ndx * 0.1;
      const rot = time * speed;
      const ele = Math.sin(time + ndx) * speed * 5 + 90;
      jewel.rotation.x = rot;
      jewel.rotation.y = rot;
      jewel.position.y = ele;
    });

    spotLights.forEach((light, ndx) => {
      const speed = 1 + ndx * 0.1;
      const ele = Math.sin(time + ndx) * speed * 5 + 90;
      light.position.y = ele;
    });

    base.position.x = (time % 40) - 20;
    base.position.z = -((time % 40) - 20);
    base.position.y = Math.sin(time) * 0.5 + 10;

    // Debug
    let visible = true;
    helpers.forEach((helper) => {
      if (helper.visible != visible) {
        helper.visible = visible;
        helper.update();
      }
    });

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
