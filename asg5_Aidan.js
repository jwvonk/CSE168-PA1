import * as THREE from 'three';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js'
document.body.appendChild( VRButton.createButton( renderer ) );
renderer.xr.enabled = true;
renderer.setAnimationLoop( function () {

	renderer.render( scene, camera );

} );
class PickHelper {
    constructor() {
      this.raycaster = new THREE.Raycaster();
      this.pickedObject = null;
      this.pickedObjectSavedColor = 0;
    }
    pick(normalizedPosition, scene, camera) {
      // restore the color if there is a picked object
   
      // cast a ray through the frustum
      this.raycaster.setFromCamera(normalizedPosition, camera);
      // get the list of objects the ray intersected
      const intersectedObjects = this.raycaster.intersectObjects(scene.children);
      if (intersectedObjects.length) {
        // pick the first object. It's the closest one
        this.pickedObject = intersectedObjects[0].object;
        // save its color
        scene.remove(this.pickedObject);
      }
    }
  }

  function getCanvasRelativePosition(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * canvas.width  / rect.width,
      y: (event.clientY - rect.top ) * canvas.height / rect.height,
    };
  }
   
  function setPickPosition(event) {
    const pos = getCanvasRelativePosition(event);
    pickPosition.x = (pos.x / canvas.width ) *  2 - 1;
    pickPosition.y = (pos.y / canvas.height) * -2 + 1;  // note we flip Y
  }

  function mine(event) {
    if (event.shiftKey) {
        pickHelper.pick(pickPosition, scene, camera);
    }

  }
   
  function clearPickPosition() {
    // unlike the mouse which always has a position
    // if the user stops touching the screen we want
    // to stop picking. For now we just pick a value
    // unlikely to pick something
    pickPosition.x = -100000;
    pickPosition.y = -100000;
  }
   
  window.addEventListener('mousemove', setPickPosition);
  window.addEventListener('mouseout', clearPickPosition);
  window.addEventListener('mouseleave', clearPickPosition);
  window.addEventListener('pointerdown', mine);
function render(time) {

    time *= 0.001;
    sun.position.z = Math.sin(time * 0.5) * 100;
    sun.position.y = Math.cos(time * 0.5) * 100
    light.position.set(sun.position.x, sun.position.y, sun.position.z);
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

function makeCube(geometry, x,y,z, id1,id2,id3,id4,id5,id6) {
    const mat = [
        materialList[id1],
        materialList[id2],
        materialList[id3],
        materialList[id4],
        materialList[id5],
        materialList[id6],
    ];
    const cube = new THREE.Mesh(geometry, mat);
    scene.add(cube);
    cube.position.x = x;
    cube.position.y = y;
    cube.position.z = z;
    return cube;
}



const objLoader = new OBJLoader();
const mtlLoader = new MTLLoader();
mtlLoader.load('/obj/Steve/Steve.mtl', (mtl) => {
    mtl.preload();
    objLoader.setMaterials(mtl);
    objLoader.load('/obj/Steve/Steve.obj', (root) => {
        root.position.x = 2;
        root.position.z = 6;
        root.position.y = 1.4;
        root.scale.x = 2.2;
        root.scale.y = 2.2;
        root.scale.z = 2.2;
        root.rotation.y = 90;
        root.castShadow = true;
        root.receiveShadow = true;
        const labelMaterial = new THREE.SpriteMaterial({
            map: loader.load('/textures/Username.png')
        });
        const label = new THREE.Sprite(labelMaterial);
        root.add(label);
        label.position.y = 0.6;
        label.scale.x = 0.5;
        label.scale.y = 0.2;
        scene.add(root);
  
    });
});

const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
renderer.shadowMap.enabled = true;
const loadManager = new THREE.LoadingManager();
const loader = new THREE.TextureLoader(loadManager);
const fov = 75;
const aspect = 2;  // the canvas default
const near = 0.1;
const far = 500;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2;
const scene = new THREE.Scene();
const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
const cylGeo = new THREE.CylinderGeometry(boxWidth, boxHeight, boxDepth);
const sphereGeo = new THREE.SphereGeometry(boxWidth);
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 5, 0);
controls.update();
camera.position.x = 1;
camera.position.z = 
camera.position.y = 10;
const pickHelper = new PickHelper();
camera.lookAt(new THREE.Vector3(3,5,3))

const pickPosition = {x: 0, y: 0};
clearPickPosition();
renderer.render(scene, camera);

const sunMat = new THREE.MeshBasicMaterial();
const sun = new THREE.Mesh(sphereGeo, sunMat);
sun.material.color = new THREE.Color(0xFFFF00);
scene.add(sun);

sun.position.x = 0;
sun.position.y = 100;
sun.position.z = 0;

sun.scale.x = 10;
sun.scale.y = 10;
sun.scale.z = 10;

const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.DirectionalLight(color, intensity);
light.castShadow = true;
light.position.set(sun.position.x, sun.position.y, sun.position.z);

scene.add(light);
const materialList = [
    new THREE.MeshPhongMaterial({map: loader.load('/textures/BlockTextures/cobblestone.png')}), //0 
    new THREE.MeshPhongMaterial({map: loader.load('/textures/BlockTextures/dirt.png')}),        //1
    new THREE.MeshPhongMaterial({map: loader.load('/textures/BlockTextures/grass_top.png')}),   //2
    new THREE.MeshPhongMaterial({map: loader.load('/textures/BlockTextures/leaves_oak.png')}),  //3
    new THREE.MeshPhongMaterial({map: loader.load('/textures/BlockTextures/log_oak.png')}),     //4
    new THREE.MeshPhongMaterial({map: loader.load('/textures/BlockTextures/log_oak_top.png')}), //5
    new THREE.MeshPhongMaterial({map: loader.load('/textures/BlockTextures/planks_oak.png')}),  //6
];
let ground = makeGround(32,4,32);
const cubes = [
    makeCube(geometry, 0,1,5, 4,4,5,5,4,4),
    makeCube(geometry, 0,2,5, 4,4,5,5,4,4),
    makeCube(geometry, 0,3,5, 4,4,5,5,4,4),
    makeCube(geometry, 0,4,5, 4,4,5,5,4,4),

    makeCube(geometry, 1,1,5, 6,6,6,6,6,6),
    makeCube(geometry, 4,1,5, 6,6,6,6,6,6),
    makeCube(geometry, 1,2,5, 6,6,6,6,6,6),
    makeCube(geometry, 4,2,5, 6,6,6,6,6,6),
    makeCube(geometry, 1,3,5, 6,6,6,6,6,6),
    makeCube(geometry, 4,3,5, 6,6,6,6,6,6),
    makeCube(geometry, 1,4,5, 6,6,6,6,6,6),
    makeCube(geometry, 4,4,5, 6,6,6,6,6,6),

    makeCube(geometry, 0,1,6, 6,6,6,6,6,6),
    makeCube(geometry, 0,1,7, 6,6,6,6,6,6),
    makeCube(geometry, 0,1,8, 6,6,6,6,6,6),
    makeCube(geometry, 0,1,9, 4,4,5,5,4,4),
    makeCube(geometry, 0,2,6, 6,6,6,6,6,6),
    makeCube(geometry, 0,2,7, 6,6,6,6,6,6),
    makeCube(geometry, 0,2,8, 6,6,6,6,6,6),
    makeCube(geometry, 0,2,9, 4,4,5,5,4,4),
    makeCube(geometry, 0,3,6, 6,6,6,6,6,6),
    makeCube(geometry, 0,3,7, 6,6,6,6,6,6),
    makeCube(geometry, 0,3,8, 6,6,6,6,6,6),
    makeCube(geometry, 0,3,9, 4,4,5,5,4,4),
    makeCube(geometry, 0,4,6, 6,6,6,6,6,6),
    makeCube(geometry, 0,4,7, 6,6,6,6,6,6),
    makeCube(geometry, 0,4,8, 6,6,6,6,6,6),
    makeCube(geometry, 0,4,9, 4,4,5,5,4,4),

    makeCube(geometry, 5,1,6, 6,6,6,6,6,6),
    makeCube(geometry, 5,1,7, 6,6,6,6,6,6),
    makeCube(geometry, 5,1,8, 6,6,6,6,6,6),
    makeCube(geometry, 5,1,9, 4,4,5,5,4,4),
    makeCube(geometry, 5,2,6, 6,6,6,6,6,6),
    makeCube(geometry, 5,2,7, 6,6,6,6,6,6),
    makeCube(geometry, 5,2,8, 6,6,6,6,6,6),
    makeCube(geometry, 5,2,9, 4,4,5,5,4,4),
    makeCube(geometry, 5,3,6, 6,6,6,6,6,6),
    makeCube(geometry, 5,3,7, 6,6,6,6,6,6),
    makeCube(geometry, 5,3,8, 6,6,6,6,6,6),
    makeCube(geometry, 5,3,9, 4,4,5,5,4,4),
    makeCube(geometry, 5,4,6, 6,6,6,6,6,6),
    makeCube(geometry, 5,4,7, 6,6,6,6,6,6),
    makeCube(geometry, 5,4,8, 6,6,6,6,6,6),
    makeCube(geometry, 5,4,9, 4,4,5,5,4,4),
    
    makeCube(geometry, 1,1,9, 6,6,6,6,6,6),
    makeCube(geometry, 1,2,9, 6,6,6,6,6,6),
    makeCube(geometry, 1,3,9, 6,6,6,6,6,6),
    makeCube(geometry, 1,4,9, 6,6,6,6,6,6),

    makeCube(geometry, 2,1,9, 6,6,6,6,6,6),
    makeCube(geometry, 2,2,9, 6,6,6,6,6,6),
    makeCube(geometry, 2,3,9, 6,6,6,6,6,6),
    makeCube(geometry, 2,4,9, 6,6,6,6,6,6),

    makeCube(geometry, 3,1,9, 6,6,6,6,6,6),
    makeCube(geometry, 3,2,9, 6,6,6,6,6,6),
    makeCube(geometry, 3,3,9, 6,6,6,6,6,6),
    makeCube(geometry, 3,4,9, 6,6,6,6,6,6),

    makeCube(geometry, 4,1,9, 6,6,6,6,6,6),
    makeCube(geometry, 4,2,9, 6,6,6,6,6,6),
    makeCube(geometry, 4,3,9, 6,6,6,6,6,6),
    makeCube(geometry, 4,4,9, 6,6,6,6,6,6),

    makeCube(geometry, 1,4,8, 6,6,6,6,6,6),
    makeCube(geometry, 2,4,8, 6,6,6,6,6,6),
    makeCube(geometry, 3,4,8, 6,6,6,6,6,6),
    makeCube(geometry, 4,4,8, 6,6,6,6,6,6),

    
    makeCube(geometry, 1,4,7, 6,6,6,6,6,6),
    makeCube(geometry, 2,4,7, 6,6,6,6,6,6),
    makeCube(geometry, 3,4,7, 6,6,6,6,6,6),
    makeCube(geometry, 4,4,7, 6,6,6,6,6,6),

    
    makeCube(geometry, 1,4,6, 6,6,6,6,6,6),
    makeCube(geometry, 2,4,6, 6,6,6,6,6,6),
    makeCube(geometry, 3,4,6, 6,6,6,6,6,6),
    makeCube(geometry, 4,4,6, 6,6,6,6,6,6),

    makeCube(geometry, 3,4,5, 6,6,6,6,6,6),
    makeCube(geometry, 2,4,5, 6,6,6,6,6,6),

    makeCube(geometry, 5,1,5, 4,4,5,5,4,4),
    makeCube(geometry, 5,2,5, 4,4,5,5,4,4),
    makeCube(geometry, 5,3,5, 4,4,5,5,4,4),
    makeCube(geometry, 5,4,5, 4,4,5,5,4,4),
    //makeInstance(geometry, 0x8844aa, -2),
    //makeInstance(geometry, 0xaa8844, 2),
];

cubes.forEach(block => block.castShadow = true, block => block.receiveShadow = true);
{
    
    //const cameraHelper = new THREE.CameraHelper(light.shadow.camera);
    //scene.add(cameraHelper);

    const torchColor = 	0xfce597;
    const torch1 = new THREE.PointLight(torchColor, 0.25);
    torch1.castShadow = true;
    torch1.position.set(4,3,8);

    const torch2 = new THREE.PointLight(torchColor, 0.25);
    torch2.castShadow = true;
    torch2.position.set(1,3,8);
    scene.add(torch1);
    scene.add(torch2);


}

ground.forEach(block => block.receiveShadow = true);

{
    const color = 0xFFFFFF;
    const intensity = 0.1;
    const light = new THREE.AmbientLight(color, intensity);
    scene.add(light);
}

materialList.forEach(texture => texture.map.magFilter = THREE.NearestFilter);

materialList.forEach(texture => texture.map.minFilter = THREE.NearestFilter);

loadManager.onLoad = () => {
    requestAnimationFrame(render);
}


function makeGround(width, height, depth) {
    let ground = [];
    for (let x = -13; x < width - 13; x++) {
        for (let y = -3; y < height - 3; y++) {
            for (let z = -13; z < depth - 13; z++) {
                if (y == height - 4) {
                    ground.push(makeCube(geometry, x,y,z, 1,1,2,1,1,1));
                }

                else {
                    ground.push(makeCube(geometry, x,y,z, 0,0,0,0,0,0));
                }

            }
        }
    }

    return ground;
}
{
    const cubeMapLoader = new THREE.CubeTextureLoader();
    const texture = cubeMapLoader.load([
        "/textures/Skybox/Daylight Box_Right.bmp",
        "/textures/Skybox/Daylight Box_Left.bmp",
        "/textures/Skybox/Daylight Box_Top.bmp",
        "/textures/Skybox/Daylight Box_Bottom.bmp",
        "/textures/Skybox/Daylight Box_Front.bmp",
        "/textures/Skybox/Daylight Box_Back.bmp",
    ]);
    scene.background = texture;
}

{
    const torch1 = makeCube(geometry, 4,2,8, 6,6,6,6,6,6);
    torch1.scale.x = 0.25;
    torch1.scale.z = 0.25;
    torch1.scale.y = 0.5;
    torch1.rotation.x = 25;

    const torch2 = makeCube(geometry, 1,2,8, 6,6,6,6,6,6);
    torch2.scale.x = 0.25;
    torch2.scale.z = 0.25;
    torch2.scale.y = 0.5;
    torch2.rotation.x = 25;   
}

{

}

{
    const flameMat = new THREE.MeshBasicMaterial();
    const flame1 = new THREE.Mesh(cylGeo, flameMat);
    scene.add(flame1);
    flame1.position.x = 1;
    flame1.position.y = 2.5;
    flame1.position.z = 8;
    flame1.scale.z = 0.25;
    flame1.scale.y = 0.5;
    flame1.scale.x = 0.25
    flame1.material.color = new THREE.Color(0xEE4B2B);

    const flame2 = new THREE.Mesh(cylGeo, flameMat);
    scene.add(flame2);
    flame2.position.x = 4;
    flame2.position.y = 2.5;
    flame2.position.z = 8;
    flame2.scale.z = 0.25;
    flame2.scale.y = 0.5;
    flame2.scale.x = 0.25
    flame2.material.color = new THREE.Color(0xEE4B2B);
}

{
    let trees = [];
    trees.push(makeCube(geometry, 0,1,0, 4,4,5,5,4,4));
    trees.push(makeCube(geometry, 0,2,0, 4,4,5,5,4,4))
    trees.push(makeCube(geometry, 0,3,0, 4,4,5,5,4,4))
    
    trees.push(makeCube(geometry, 0,4,0, 3,3,3,3,3,3))
    
    trees.push(makeCube(geometry, 1,3,0, 3,3,3,3,3,3))
    trees.push(makeCube(geometry, 1,3,1, 3,3,3,3,3,3))
    trees.push(makeCube(geometry, 1,3,-1, 3,3,3,3,3,3))

    trees.push(makeCube(geometry, 0,3,1, 3,3,3,3,3,3))
    trees.push(makeCube(geometry, 0,3,-1, 3,3,3,3,3,3))

    trees.push(makeCube(geometry, -1,3,0, 3,3,3,3,3,3))
    trees.push(makeCube(geometry, -1,3,1, 3,3,3,3,3,3))
    trees.push(makeCube(geometry, -1,3,-1, 3,3,3,3,3,3))

    trees.forEach(block => block.castShadow = true, block => block.receiveShadow = true);

}
