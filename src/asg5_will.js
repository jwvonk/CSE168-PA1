import * as THREE from "three";
import { MathUtils } from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { XRHandModelFactory } from 'three/addons/webxr/XRHandModelFactory.js';


function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  document.body.addEventListener("keydown", keyPressed);

  renderer.xr.enabled = true;
  document.body.appendChild(VRButton.createButton(renderer));

  renderer.shadowMap.enabled = false; // too laggy
  renderer.shadowMap.type = THREE.BasicShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const base = new THREE.Object3D();
  base.position.set(200, 0, 200);
  const helpers = [];

  const fov = 75;
  const aspect = canvas.clientWidth / canvas.clientHeight;
  const near = 0.1;
  const far = 200;

  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  const cameraHelper = new THREE.CameraHelper(camera);
  helpers.push(cameraHelper);

  const cameraParent = new THREE.Object3D();
  cameraParent.position.set(-7.5, 50, 7.5);
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
    const far = 200;
    scene.fog = new THREE.Fog(color, near, far);
  }

  {
    let hand1, hand2;
    let controller1, controller2;
    let controllerGrip1, controllerGrip2;
    let controls;

    let grabbing = false;
    controller1 = renderer.xr.getController( 0 );

    scene.add( controller1 );

    controller2 = renderer.xr.getController( 1 );
    scene.add( controller2 );

    const controllerModelFactory = new XRControllerModelFactory();
    //const handModelFactory = new XRHandModelFactory();

    // Hand 1
    controllerGrip1 = renderer.xr.getControllerGrip( 0 );
    controllerGrip1.add( controllerModelFactory.createControllerModel( controllerGrip1 ) );
    scene.add( controllerGrip1 );

    /*hand1 = renderer.xr.getHand( 0 );
    hand1.addEventListener( 'pinchstart', onPinchStartLeft );
    hand1.addEventListener( 'pinchend', () => {

      scaling.active = false;

    } );
    hand1.add( handModelFactory.createHandModel( hand1 ) );*/

    //scene.add( hand1 );

    // Hand 2
    controllerGrip2 = renderer.xr.getControllerGrip( 1 );
    controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
    scene.add( controllerGrip2 );

    /*hand2 = renderer.xr.getHand( 1 );
    hand2.addEventListener( 'pinchstart', onPinchStartRight );
    hand2.addEventListener( 'pinchend', onPinchEndRight );
    hand2.add( handModelFactory.createHandModel( hand2 ) );
    scene.add( hand2 );*/

    
    const geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] );

    const line = new THREE.Line( geometry );
    line.name = 'line';
    line.scale.z = 5;

    controller1.add( line.clone() );
    controller2.add( line.clone() );
    cameraParent.add(controller1)
    cameraParent.add(controller2)
    cameraParent.add(controllerGrip1)
    cameraParent.add(controllerGrip2)
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

    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize, 500, 500);
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
    light.castShadow = false; // too laggy
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
    light.castShadow = false; // too laggy
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
    light.castShadow = false; // too laggy
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
  let boundingBox = new THREE.Box3();

  {
    const scale = 40;
    // Pirate Ship by Braden Brunk [CC-BY] (https://creativecommons.org/licenses/by/3.0/) via Poly Pizza (https://poly.pizza/m/7aHmBgTur3V)
    const mtlLoader = new MTLLoader();
    mtlLoader.load("../assets/Will/pirateship/materials.mtl.bak", (mtl) => {
      mtl.preload();
      const objLoader = new OBJLoader();
      objLoader.setMaterials(mtl);
      objLoader.load("../assets/Will/pirateship/model.obj", (root) => {
        root.scale.set(scale, scale, scale);
        root.rotation.y = (90 * Math.PI) / 180;
        base.add(root);
        root.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            ship = child;
            child.castShadow = true;
            child.receiveShadow = true;
            child.geometry.computeBoundingBox();
          }
        });
      });
    });
  }

  let border = [];
  {
    const wallBox = new THREE.Box3(new THREE.Vector3(-0.5, 0, -375), new THREE.Vector3(0.5, 10, 375));
    const rightBox = wallBox.clone();
    rightBox.translate(new THREE.Vector3(375, 0, 0));
    border.push(rightBox);
    const leftBox = wallBox.clone();
    leftBox.translate(new THREE.Vector3(-375, 0, 0));
    border.push(leftBox);
    wallBox.set(new THREE.Vector3(-375, 0, -0.5), new THREE.Vector3(375, 10, 0.5))
    const forwardBox = wallBox.clone();
    forwardBox.translate(new THREE.Vector3(0, 0, 375));
    border.push(forwardBox);
    const backBox = wallBox.clone();
    backBox.translate(new THREE.Vector3(0, 0, -375));
    border.push(backBox);
  }

  function checkCollision(mesh, obstacles) {
    boundingBox.copy(mesh.geometry.boundingBox).applyMatrix4(mesh.matrixWorld);
    for (let obstacle of obstacles) {
      if (boundingBox.intersectsBox(obstacle)) {
        return true;
      }
    }
    return false;
  }

  function moveObjectForward(object, distance) {
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyEuler(object.rotation);
    direction.multiplyScalar(distance);
    object.position.add(direction);
    if (checkCollision(ship, border)) {
      object.position.add(direction.negate());
    }
    
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

    if (ship instanceof THREE.Mesh) {
      moveObjectForward(base, 1);
      base.position.y = Math.sin(time) * 0.5 + 10;
      boundingBox.copy(ship.geometry.boundingBox).applyMatrix4(ship.matrixWorld);
    }

    // Debug
    let visible = true;
    helpers.forEach((helper) => {
        helper.applyMatrix4(helper.matrixWorld);
        if (helper.visible != visible) {
          helper.visible = visible;
          helper.update();
        }
    });
    /*const indexTip1Pos = hand1.joints[ 'index-finger-tip' ].position;
    const indexTip2Pos = hand2.joints[ 'index-finger-tip' ].position;
    const distance = indexTip1Pos.distanceTo( indexTip2Pos );
    const newScale = scaling.initialScale + distance / scaling.initialDistance - 1;
    scaling.object.scale.setScalar( newScale );*/
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
  function keyPressed(e) {
    switch (e.key) {
      case "ArrowLeft":
        base.rotateY(MathUtils.degToRad(1));
        break;
      case "ArrowRight":
        base.rotateY(MathUtils.degToRad(-1));
        break;
      default:
        break;
    }
  }
}

main();
