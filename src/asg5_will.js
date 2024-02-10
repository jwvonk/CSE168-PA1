import * as THREE from "three";
import { MathUtils } from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { XRControllerModelFactory } from "three/addons/webxr/XRControllerModelFactory.js";
import { XRHandModelFactory } from "three/addons/webxr/XRHandModelFactory.js";

let raycaster = new THREE.Raycaster();
let controller1, controller2;
let intersectionPoint;
let steeringWheel;
let currentAngle = 0.0;
let base;
const intersected = [];
let lastPoint;
function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  document.body.addEventListener("keydown", keyPressed);

  renderer.xr.enabled = true;
  document.body.appendChild(VRButton.createButton(renderer));

  renderer.shadowMap.enabled = false; // too laggy
  renderer.shadowMap.type = THREE.BasicShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  base = new THREE.Object3D();
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
  cameraParent.position.set(-7.5, 0, 7.5);
  cameraParent.rotation.set(0, -45, 0);
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
    // scene.rotation.y = (-45 * Math.PI) / 180;
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

    let controllerGrip1, controllerGrip2;
    let controls;

    let grabbing = false;
    controller1 = renderer.xr.getController(0);
    controller1.addEventListener("selectstart", onSelectStart);
    controller1.addEventListener("selectend", onSelectEnd);
    scene.add(controller1);

    controller2 = renderer.xr.getController(1);
    controller2.addEventListener("selectstart", onSelectStart);
    controller2.addEventListener("selectend", onSelectEnd);
    scene.add(controller2);

    const controllerModelFactory = new XRControllerModelFactory();
    //const handModelFactory = new XRHandModelFactory();

    // Hand 1
    controllerGrip1 = renderer.xr.getControllerGrip(0);
    controllerGrip1.add(
      controllerModelFactory.createControllerModel(controllerGrip1)
    );
    scene.add(controllerGrip1);

    /*hand1 = renderer.xr.getHand( 0 );
    hand1.addEventListener( 'pinchstart', onPinchStartLeft );
    hand1.addEventListener( 'pinchend', () => {

      scaling.active = false;

    } );
    hand1.add( handModelFactory.createHandModel( hand1 ) );*/

    //scene.add( hand1 );

    // Hand 2
    controllerGrip2 = renderer.xr.getControllerGrip(1);
    controllerGrip2.add(
      controllerModelFactory.createControllerModel(controllerGrip2)
    );
    scene.add(controllerGrip2);

    /*hand2 = renderer.xr.getHand( 1 );
    hand2.addEventListener( 'pinchstart', onPinchStartRight );
    hand2.addEventListener( 'pinchend', onPinchEndRight );
    hand2.add( handModelFactory.createHandModel( hand2 ) );
    scene.add( hand2 );*/

    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -1),
    ]);

    const line = new THREE.Line(geometry);
    line.name = "line";
    line.scale.z = 5;

    controller1.add(line.clone());
    controller2.add(line.clone());
    cameraParent.add(controller1);
    cameraParent.add(controller2);
    cameraParent.add(controllerGrip1);
    cameraParent.add(controllerGrip2);
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

  const steeringWheel = new THREE.Object3D();
  {
    base.add(steeringWheel);
    const numSpokes = 6;
    const spokeLength = 2.3;
    const angleStep = (Math.PI * 2) / numSpokes;
    const spokeGeometry = new THREE.CylinderGeometry(
      0.1,
      0.1,
      spokeLength,
      4
    );
    const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0xd6a755, flatShading: true });
    for (var i = 0; i < numSpokes / 2; i++) {
      const spoke = new THREE.Mesh(spokeGeometry, wheelMaterial);
      const angle = i * angleStep;
      spoke.rotation.z = angle;
      steeringWheel.add(spoke);
      // const refGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      // const refMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      // const wheelRef = new THREE.Mesh(refGeo, refMat);
      // steeringWheel.add(wheelRef);
      // wheelRef.position.set(0, 0, 0);
    }
    const wheelGeometry = new THREE.TorusGeometry(0.6, 0.245, 4, 12);
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    steeringWheel.add(wheel)

    steeringWheel.rotation.set(2.8, .7, 0);
    steeringWheel.position.set(-6.85, 0.1, 6.2);
  }

  let border = [];
  {
    const wallBox = new THREE.Box3(
      new THREE.Vector3(-0.5, 0, -375),
      new THREE.Vector3(0.5, 10, 375)
    );
    const rightBox = wallBox.clone();
    rightBox.translate(new THREE.Vector3(375, 0, 0));
    border.push(rightBox);
    const leftBox = wallBox.clone();
    leftBox.translate(new THREE.Vector3(-375, 0, 0));
    border.push(leftBox);
    wallBox.set(
      new THREE.Vector3(-375, 0, -0.5),
      new THREE.Vector3(375, 10, 0.5)
    );
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
    const rotation = object.rotation.clone();
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyEuler(rotation);
    const sideways = new THREE.Vector3(1, 0, 0);
    sideways.applyEuler(rotation);
    const diagonalDirection = direction.add(sideways).normalize();
    diagonalDirection.multiplyScalar(distance);
    object.position.add(direction);
    if (checkCollision(ship, border)) {
      object.position.add(direction.negate());
    }
  }

  function render(time) {
    cleanIntersected();
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
      moveObjectForward(base, 0.1);
      base.position.y = Math.sin(time) * 0.5 + 10;
      boundingBox
        .copy(ship.geometry.boundingBox)
        .applyMatrix4(ship.matrixWorld);
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
    intersectObjects(controller1);
    intersectObjects(controller2);
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
  function intersectObjects(controller) {
    // Do not highlight in mobile-ar
  
    if (controller.userData.targetRayMode === "screen") return;
  
    // Do not highlight when already selected
  
    //if ( controller.userData.selected !== undefined ) return;
  
    const line = controller.getObjectByName("line");
    const intersections = getIntersections(controller);
  
    if (intersections.length > 0) {
      const intersection = intersections[0];
      //if we have selected the wheel, rotate it
      if (controller.userData.selected != null) {
        //console.log(intersection.point)
        RotateWheel(intersection.point);
      } else {
        const object = intersection.object;
        object.material.emissive.r = 1;
        intersected.push(object);
  
        line.scale.z = intersection.distance;
      }
    } else {
      line.scale.z = 5;
    }
  }
  
  function RotateWheel(newPoint) {
    let totalAngle = FindWheelAngle(newPoint);
    //console.log(totalAngle);
    let angleDifference = currentAngle - totalAngle;
    currentAngle = totalAngle;
    if (angleDifference > 1 || angleDifference < -1) {
      return;
    }
    steeringWheel.rotateZ(angleDifference);
    currentAngle = totalAngle;
    base.rotateY(MathUtils.degToRad(angleDifference * 30));
    lastPoint = newPoint
  }
  
  function FindWheelAngle(newPoint) {
    let totalAngle = 0;
  
    let direction = FindLocalPoint(newPoint);
    totalAngle += ConvertToAngle(direction);
  
    return totalAngle;
  }
  
  function FindLocalPoint(point) {
    return steeringWheel.worldToLocal(point);
  }
  
  function ConvertToAngle(dir) {
    if (lastPoint == null) {
      lastPoint = steeringWheel.up
    }
    return steeringWheel.up.angleTo(dir)
  }
  
  function getIntersections(controller) {
    controller.updateMatrixWorld();
    let tempMatrix = new THREE.Matrix4();
    tempMatrix.identity().extractRotation(controller.matrixWorld);
  
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
  
    return raycaster.intersectObjects(steeringWheel.children, false);
  }
  
  function cleanIntersected() {
    while (intersected.length) {
      const object = intersected.pop();
      object.material.emissive.r = 0;
    }
  }
  
  function onSelectStart(event) {
    const controller = event.target;
  
    const intersections = getIntersections(controller);
  
    if (intersections.length > 0) {
      const intersection = intersections[0];
  
      const object = intersection.object;
      intersectionPoint = intersection.point;
      object.material.emissive.b = 1;
      //controller.attach( object );
  
      controller.userData.selected = object;
    }
  
    controller.userData.targetRayMode = event.data.targetRayMode;
  }
  
  function onSelectEnd(event) {
    const controller = event.target;
    if (controller.userData.selected !== undefined) {
      const object = controller.userData.selected;
      object.material.emissive.b = 0;
      steeringWheel.attach(object);
      controller.userData.selected = undefined;
      currentAngle = FindWheelAngle(intersectionPoint)
      intersectionPoint = null
    }
  }
}



main();
