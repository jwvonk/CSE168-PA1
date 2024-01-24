import * as THREE from "three";
import { OrbitControls } from "./assets/lib/OrbitControls.js";
import { OBJLoader } from "./assets/lib/OBJLoader.js";
import { MTLLoader } from "./assets/lib/MTLLoader.js";
import { Lensflare, LensflareElement } from "./assets/lib/Lensflare.js";
import { VRButton } from 'three/addons/webxr/VRButton.js';

let cam;
let scene;
let renderer;
let orbitControls;

function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);
  document.body.appendChild( VRButton.createButton( renderer ) );
  renderer.xr.enabled = true;

  scene = new THREE.Scene();

  cam = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    5000
  );
  // cam.position.z = 300;
  // cam.position.y = 1000;
  // cam.position.x = 300;

  const cameraGroup = new THREE.Object3D();
  cameraGroup.position.set(300, 150, 300);
  cameraGroup.add(cam);
  scene.add(cameraGroup);

  orbitControls = new OrbitControls(cam, renderer.domElement);
  orbitControls.update();
}
function onWindowResize() {
  cam.aspect = window.innerWidth / window.innerHeight;
  cam.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
window.addEventListener("resize", onWindowResize, false);

// Loaded textures
const stairTexture = new THREE.TextureLoader().load("assets/textures/stair.jpg");
const groundTexture = new THREE.TextureLoader().load("assets/textures/ground.png");
const grassTexture = new THREE.TextureLoader().load("assets/textures/grass.jpg");

const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
  'assets/textures/posx.jpg',
  'assets/textures/negx.jpg',
  'assets/textures/posy.jpg',
  'assets/textures/negy.jpg',
  'assets/textures/posz.jpg',
  'assets/textures/negz.jpg',
]);
scene.background = texture;

const amblight = new THREE.AmbientLight(0xffffff , 0.05);
scene.add(amblight);

const light = new THREE.DirectionalLight(0x363993 , 3);
light.position.set(0, 500, 500);
light.castShadow = true;

scene.add(light);

// Make the floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(5000, 5000),
  new THREE.MeshPhongMaterial({ map: groundTexture })
);
floor.rotation.x = Math.PI * -0.5;
floor.receiveShadow = true;
scene.add(floor);

//make stairs
const stair1 = new THREE.Mesh(
  new THREE.BoxGeometry(1000, 20, 1000),
  new THREE.MeshPhongMaterial({ map: stairTexture })
);
stair1.position.set(0, 10, 0);
stair1.castShadow = true;
stair1.receiveShadow = true;
scene.add(stair1);

const stair2 = new THREE.Mesh(
  new THREE.BoxGeometry(800, 30, 800),
  new THREE.MeshPhongMaterial({ map: stairTexture })
);
stair2.position.set(0, 30, 0);
stair2.castShadow = true;
stair2.receiveShadow = true;
scene.add(stair2);

function makeGrass(x, y, z){
  const grass = new THREE.Mesh(
    new THREE.BoxGeometry(1000, 10, 1000),
    new THREE.MeshPhongMaterial({ map: grassTexture })
  );
  grass.position.set(x, y, z);
  grass.receiveShadow = true;
  scene.add(grass);
}

makeGrass(2000, 5, 2000);
makeGrass(1000, 5, 2000);
makeGrass(-1000, 5, 2000);
makeGrass(-2000, 5, 2000);
makeGrass(2000, 5, 1000);
makeGrass(1000, 5, 1000);
makeGrass(-1000, 5, 1000);
makeGrass(-2000, 5, 1000);
makeGrass(2000, 5, -1000);
makeGrass(1000, 5, -1000);
makeGrass(-1000, 5, -1000);
makeGrass(-2000, 5, -1000);
makeGrass(2000, 5, -2000);
makeGrass(1000, 5, -2000);
makeGrass(-1000, 5, -2000);
makeGrass(-2000, 5, -2000);

const mtlLoader = new MTLLoader();

// Make standing ligts
const sides = [
  [1000, 400, 0],
  [-1000, 400, 0],
  [400, 1000, 1.57],
  [400, -1000, 1.57],

  [1000, -400, 3.14],
  [-1000, -400, 3.14],
  [-400, 1000, 4.71],
  [-400, -1000, 4.71],

  [2000, 400, 0],
  [-2000, 400, 0],
  [400, 2000, 1.57],
  [400, -2000, 1.57],

  [2000, -400, 3.14],
  [-2000, -400, 3.14],
  [-400, 2000, 4.71],
  [-400, -2000, 4.71],
];
sides.map((side, index) => {
  mtlLoader.load("./assets/obj/materials.mtl", (materials) => {
    materials.preload();
    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load("./assets/obj/model.obj", (lamp) => {
      lamp.scale.set(100, 100, 100);
      lamp.position.set(side[0], 230, side[1]);
      lamp.rotation.y = side[2];
      lamp.traverse(function(child){child.castShadow = true;}); 
      scene.add(lamp);
    });

  });
});

const light1 = new THREE.PointLight(0xfd8267, 0.5);
light1.position.set(-1000, 230, -400);
light1.castShadow = true;
scene.add(light1);

const light2 = new THREE.PointLight(0xfd8267, 0.5);
light2.position.set(1000, 230, 400);
light2.castShadow = true;
scene.add(light2);

const light3 = new THREE.PointLight(0xfd8267, 0.5);
light3.position.set(400, 230, -1000);
light3.castShadow = true;
scene.add(light3);

const light4 = new THREE.PointLight(0xfd8267, 0.5);
light4.position.set(-400, 230, 1000);
light4.castShadow = true;
scene.add(light4);

const light5 = new THREE.PointLight(0xfd8267, 0.5);
light5.position.set(-2000, 230, 400);
light5.castShadow = true;
scene.add(light5);

const light6 = new THREE.PointLight(0xfd8267, 0.5);
light6.position.set(400, 230, 2000);
light6.castShadow = true;
scene.add(light6);

const light7 = new THREE.PointLight(0xfd8267, 0.5);
light7.position.set(2000, 230, -400);
light7.castShadow = true;
scene.add(light7);

const light8 = new THREE.PointLight(0xfd8267, 0.5);
light8.position.set(-400, 230, -2000);
light8.castShadow = true;
scene.add(light8);

const fences = [
  [500, 0, 500],
  [700, 0, 500],
  [900, 0, 500],
  [1100, 0, 500],
  [1300, 0, 500],
  [1500, 0, 500],
  [1700, 0, 500],
  [1900, 0, 500],
  [2100, 0, 500],
  [2300, 0, 500],
  [2500, 0, 500],
  [500, 0, 700],
  [500, 0, 900],
  [500, 0, 1100],
  [500, 0, 1300],
  [500, 0, 1500],
  [500, 0, 1700],
  [500, 0, 1900],
  [500, 0, 2100],
  [500, 0, 2300],
  [500, 0, 2500],
  
  [500, 0, -500],
  [700, 0, -500],
  [900, 0, -500],
  [1100, 0, -500],
  [1300, 0, -500],
  [1500, 0, -500],
  [1700, 0, -500],
  [1900, 0, -500],
  [2100, 0, -500],
  [2300, 0, -500],
  [2500, 0, -500],
  [-500, 0, 700],
  [-500, 0, 900],
  [-500, 0, 1100],
  [-500, 0, 1300],
  [-500, 0, 1500],
  [-500, 0, 1700],
  [-500, 0, 1900],
  [-500, 0, 2100],
  [-500, 0, 2300],
  [-500, 0, 2500],

  [-500, 0, 500],
  [-700, 0, 500],
  [-900, 0, 500],
  [-1100, 0, 500],
  [-1300, 0, 500],
  [-1500, 0, 500],
  [-1700, 0, 500],
  [-1900, 0, 500],
  [-2100, 0, 500],
  [-2300, 0, 500],
  [-2500, 0, 500],
  [500, 0, -700],
  [500, 0, -900],
  [500, 0, -1100],
  [500, 0, -1300],
  [500, 0, -1500],
  [500, 0, -1700],
  [500, 0, -1900],
  [500, 0, -2100],
  [500, 0, -2300],
  [500, 0, -2500],

  [-500, 0, -500],
  [-700, 0, -500],
  [-900, 0, -500],
  [-1100, 0, -500],
  [-1300, 0, -500],
  [-1500, 0, -500],
  [-1700, 0, -500],
  [-1900, 0, -500],
  [-2100, 0, -500],
  [-2300, 0, -500],
  [-2500, 0, -500],
  [-500, 0, -700],
  [-500, 0, -900],
  [-500, 0, -1100],
  [-500, 0, -1300],
  [-500, 0, -1500],
  [-500, 0, -1700],
  [-500, 0, -1900],
  [-500, 0, -2100],
  [-500, 0, -2300],
  [-500, 0, -2500], 
];

fences.map((place, index) => {
  const fence = new THREE.Mesh(
    new THREE.BoxGeometry(20, 80, 20),
    new THREE.MeshPhongMaterial({ color: "grey" })
  );
  fence.position.set(place[0], 40, place[2]);
  fence.castShadow = true;
  fence.receiveShadow = true;
  scene.add(fence);
});

const longfences = [
  [500, 0, 1500],
  [-500, 0, 1500],
  [500, 0, -1500],
  [-500, 0, -1500]
];
longfences.map((place, index) =>{
  const longfence = new THREE.Mesh(
    new THREE.BoxGeometry(20, 20, 2000),
    new THREE.MeshPhongMaterial({ color: "grey" })
  );
  longfence.position.set(place[0], 40, place[2]);

  const longfence2 = new THREE.Mesh(
    new THREE.BoxGeometry(20, 20, 2000),
    new THREE.MeshPhongMaterial({ color: "grey" })
  );
  longfence2.rotation.y = 67.545;
  longfence2.position.set(place[2], 40, place[0]);

  longfence.castShadow = true;
  longfence2.castShadow = true;

  longfence.receiveShadow = true;
  longfence2.receiveShadow = true;

  scene.add(longfence);
  scene.add(longfence2);

});

//Gazebo Object

mtlLoader.load("./assets/obj/10073_Gazebo_V2_L3.mtl", (materials) => {
  materials.preload();
  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.load("./assets/obj/10073_Gazebo_V2_L3.obj", (gazebo) => {
    gazebo.scale.set(1, 1, 1);
    gazebo.rotation.x = 67.55;
    gazebo.position.set(0, 50, 0);

    gazebo.traverse(function(child){child.castShadow = true;}); 
    scene.add(gazebo);
  });
});

//Make Cat
function makeCat(x, y, z){
  const catFace = new THREE.Mesh(
    new THREE.OctahedronGeometry(20, 2),
    new THREE.MeshPhongMaterial({ color: "grey" })
  );
  catFace.position.set(x-5, y+5, z);
  catFace.castShadow = true;
  catFace.receiveShadow = true;

  const catBody = new THREE.Mesh(
    new THREE.OctahedronGeometry(16, 2),
    new THREE.MeshPhongMaterial({ color: "grey" })
  );
  catBody.position.set(x, y-10, z);
  catBody.castShadow = true;
  catBody.receiveShadow = true;

  const catBody2 = new THREE.Mesh(
    new THREE.CylinderGeometry(16, 16, 40, 12),
    new THREE.MeshPhongMaterial({ color: "grey" })
  );
  catBody2.rotation.z = 1.57;
  catBody2.position.set(x+20, y-10, z);
  catBody2.castShadow = true;
  catBody2.receiveShadow = true;

  const catBody3 = new THREE.Mesh(
    new THREE.OctahedronGeometry(16, 2),
    new THREE.MeshPhongMaterial({ color: "grey" })
  );
  catBody3.position.set(x+40, y-10, z);
  catBody3.castShadow = true;
  catBody3.receiveShadow = true;

  const catEar1 = new THREE.Mesh(
    new THREE.ConeGeometry(5, 10, 12),
    new THREE.MeshPhongMaterial({ color: "grey" })
  );
  catEar1.rotation.z = 0.78;
  catEar1.position.set(x-20, y+20, z);
  catEar1.castShadow = true;
  catEar1.receiveShadow = true;

  const catEar2 = new THREE.Mesh(
    new THREE.ConeGeometry(5, 10, 12),
    new THREE.MeshPhongMaterial({ color: "grey" })
  );
  catEar2.rotation.z = -0.78;
  catEar2.position.set(x+10, y+20, z);
  catEar2.castShadow = true;
  catEar2.receiveShadow = true;

  const catArm1 = new THREE.Mesh(
    new THREE.CylinderGeometry(5, 5, 20, 12),
    new THREE.MeshPhongMaterial({ color: "grey" })
  );
  catArm1.rotation.z = 1.57;
  catArm1.position.set(x, y-20, z+15);
  catArm1.castShadow = true;
  catArm1.receiveShadow = true;

  const catArm2 = new THREE.Mesh(
    new THREE.CylinderGeometry(5, 5, 15, 12),
    new THREE.MeshPhongMaterial({ color: "grey" })
  );
  catArm2.rotation.z = 0.78;
  catArm2.position.set(x+5, y-15, z+15);
  catArm2.castShadow = true;
  catArm2.receiveShadow = true;

  const catArm3 = new THREE.Mesh(
    new THREE.CylinderGeometry(5, 5, 20, 12),
    new THREE.MeshPhongMaterial({ color: "grey" })
  );
  catArm3.rotation.z = 1.57;
  catArm3.position.set(x+60, y-20, z+15);
  catArm3.castShadow = true;
  catArm3.receiveShadow = true;

  const catArm4 = new THREE.Mesh(
    new THREE.CylinderGeometry(5, 5, 15, 12),
    new THREE.MeshPhongMaterial({ color: "grey" })
  );
  catArm4.rotation.z = 0.78;
  catArm4.position.set(x+45, y-15, z+15);
  catArm4.castShadow = true;
  catArm4.receiveShadow = true;

  const catArm5 = new THREE.Mesh(
    new THREE.CylinderGeometry(5, 5, 20, 12),
    new THREE.MeshPhongMaterial({ color: "grey" })
  );
  catArm5.rotation.z = 1.57;
  catArm5.position.set(x+60, y-20, z-15);
  catArm5.castShadow = true;
  catArm5.receiveShadow = true;

  const catArm6 = new THREE.Mesh(
    new THREE.CylinderGeometry(5, 5, 15, 12),
    new THREE.MeshPhongMaterial({ color: "grey" })
  );
  catArm6.rotation.z = 0.78;
  catArm6.position.set(x+45, y-15, z-15);
  catArm6.castShadow = true;
  catArm6.receiveShadow = true;

  const catArm7 = new THREE.Mesh(
    new THREE.CylinderGeometry(5, 5, 20, 12),
    new THREE.MeshPhongMaterial({ color: "grey" })
  );
  catArm7.rotation.z = 1.57;
  catArm7.position.set(x-30, y-20, z-15);
  catArm7.castShadow = true;
  catArm7.receiveShadow = true;

  const catArm8 = new THREE.Mesh(
    new THREE.CylinderGeometry(5, 5, 15, 12),
    new THREE.MeshPhongMaterial({ color: "grey" })
  );
  catArm8.rotation.z = -0.78;
  catArm8.position.set(x-15, y-15, z-15);
  catArm8.castShadow = true;
  catArm8.receiveShadow = true;

  const catJoint1 = new THREE.Mesh(
    new THREE.OctahedronGeometry(5, 2),
    new THREE.MeshPhongMaterial({ color: "grey" })
  );
  catJoint1.position.set(x, y-10, z+15);
  catJoint1.castShadow = true;
  catJoint1.receiveShadow = true;

  const catJoint2 = new THREE.Mesh(
    new THREE.OctahedronGeometry(5, 2),
    new THREE.MeshPhongMaterial({ color: "grey" })
  );
  catJoint2.position.set(x+40, y-10, z+15);
  catJoint2.castShadow = true;
  catJoint2.receiveShadow = true;

  const catJoint3 = new THREE.Mesh(
    new THREE.OctahedronGeometry(5, 2),
    new THREE.MeshPhongMaterial({ color: "grey" })
  );
  catJoint3.position.set(x+40, y-10, z-15);
  catJoint3.castShadow = true;
  catJoint3.receiveShadow = true;
  
  const catJoint4 = new THREE.Mesh(
    new THREE.OctahedronGeometry(5, 2),
    new THREE.MeshPhongMaterial({ color: "grey" })
  );
  catJoint4.position.set(x-10, y-10, z-15);
  catJoint4.castShadow = true;
  catJoint4.receiveShadow = true;

  const catEye1 = new THREE.Mesh(
    new THREE.OctahedronGeometry(2, 2),
    new THREE.MeshPhongMaterial({ color: "black" })
  );
  catEye1.position.set(x-14, y+12, z+15);
  catEye1.castShadow = true;
  catEye1.receiveShadow = true;

  const catEye2 = new THREE.Mesh(
    new THREE.OctahedronGeometry(2, 2),
    new THREE.MeshPhongMaterial({ color: "black" })
  );
  catEye2.position.set(x+4, y+12, z+15);
  catEye2.castShadow = true;
  catEye2.receiveShadow = true;
  
  scene.add(catFace);
  scene.add(catBody);
  scene.add(catBody2);
  scene.add(catBody3);
  scene.add(catEar1);
  scene.add(catEar2);
  scene.add(catArm1);
  scene.add(catArm2);
  scene.add(catArm3);
  scene.add(catArm4);
  scene.add(catArm5);
  scene.add(catArm6);
  scene.add(catArm7);
  scene.add(catArm8);
  scene.add(catJoint1);
  scene.add(catJoint2);
  scene.add(catJoint3);
  scene.add(catJoint4);
  scene.add(catEye1);
  scene.add(catEye2);

}

let rotAng = -0.78;
let check = 0;

const catTail = new THREE.Mesh(
  new THREE.CylinderGeometry(3, 3, 20, 12),
  new THREE.MeshPhongMaterial({ color: "grey" })
);
catTail.rotation.z = rotAng;
catTail.position.set(55, 105, 0);
catTail.castShadow = true;
catTail.receiveShadow = true;


makeCat(0, 100, 0);

scene.add(catTail);

scene.fog = new THREE.Fog(0x222222, 1, 4000);

//make sparklies
const spirit = new THREE.Mesh( new THREE.SphereGeometry( 3, 32, 16 ),  new THREE.MeshBasicMaterial( { color: 0xffff00 } ));
spirit.position.set(0, 140, 0);
scene.add( spirit );

//making sparkly tiny lensflare
const flareLoader = new THREE.TextureLoader();
const flareTex0 = flareLoader.load('./assets/textures/lensflare0.png');
const flareTex3 = flareLoader.load('./assets/textures/lensflare3.png');

const sparklight = new THREE.PointLight(0xffffff, 1.5, 2000);
sparklight.color.setHSL(0.1, 1, 0.56);
sparklight.position.set(0, 140, 0);
sparklight.castShadow = true;
scene.add(sparklight);

const lensflare = new Lensflare();
lensflare.addElement(new LensflareElement(flareTex0, 100, 0, sparklight.color));
lensflare.addElement(new LensflareElement(flareTex3, 60, 0.6));
lensflare.addElement(new LensflareElement(flareTex3, 70, 0.7));
lensflare.addElement(new LensflareElement(flareTex3, 120, 0.9));
sparklight.add(lensflare);

let g_startTime = performance.now()/1000.0;
let g_seconds = performance.now()/1000.0-g_startTime;

function animate() {
  g_seconds = performance.now()/1000.0 -g_startTime;
  orbitControls.update();
  if(rotAng <=-0.5 && check == 0){
    rotAng += 0.005
    catTail.rotation.z = rotAng;
  }else if (rotAng>=-0.5){
    check = 1;
  }if(check == 1 && rotAng> -1){
    rotAng -= 0.005
    catTail.rotation.z = rotAng;
  }else if(rotAng<-1){
    check = 0;
  }
  spirit.position.x = 20*Math.sin(g_seconds*3);
  spirit.position.z = 20*Math.cos(g_seconds*3);
  sparklight.position.x = 20*Math.sin(g_seconds*3);
  sparklight.position.z = 20*Math.cos(g_seconds*3);
  renderer.render(scene, cam);
}

renderer.setAnimationLoop(animate);

console.log(scene);

// animate();
