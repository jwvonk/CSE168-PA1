import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';

function main() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.xr.enabled = true;
    document.body.appendChild(VRButton.createButton(render));

    const fov = 60;
    const aspect = window.innerWidth / window.innerHeight; // the canvas default
    const near = 0.001;
    const far = 50;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.set(1, 1, -1)
    camera.lookAt(5, 1, -5);
    

    const cameraHelper = new THREE.CameraHelper(camera);

    const scene = new THREE.Scene();
    scene.rotation.y =  -45 * Math.PI / 180


    {
        const loader = new THREE.TextureLoader();
        const texture = loader.load(
            'assets/goegap_2k.jpg',
            () => {
                const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
                rt.fromEquirectangularTexture(renderer, texture);
                // rt.texture.rotation = Math.PI / 2;
                scene.background = rt.texture;
                
            }
        );
        scene.background = texture;
        
    }

    {
        const planeSize = 100;

        const loader = new THREE.TextureLoader();
        const texture = loader.load('assets/sand.png');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        const repeats = planeSize;
        texture.repeat.set(repeats, repeats);

        const disp = loader.load('assets/aerial_beach_01_disp_2k.jpg');
        disp.wrapS = THREE.RepeatWrapping;
        disp.wrapT = THREE.RepeatWrapping;
        disp.magFilter = THREE.NearestFilter;
        disp.repeat.set(repeats / 32, repeats  / 32);
        console.log(disp);

        const norm = loader.load('assets/aerial_beach_01_nor_gl_2k.jpg');
        norm.wrapS = THREE.RepeatWrapping;
        norm.wrapT = THREE.RepeatWrapping;
        norm.magFilter = THREE.NearestFilter;
        norm.repeat.set(repeats / 32, repeats / 32);

        const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize, 500, 500);
        const planeMat = new THREE.MeshPhongMaterial({
            color: 0xd9c896,
            displacementMap: disp,
            displacementScale: .7,
            normalMap: norm,
            side: THREE.DoubleSide,

        });
        const mesh = new THREE.Mesh(planeGeo, planeMat);
        mesh.receiveShadow = true;
        mesh.rotation.x = Math.PI * -.5;
        scene.add(mesh);
    }


    {
        const ambientColor = 0xd9c896;
        const intensity = .2;
        const light = new THREE.AmbientLight(ambientColor, intensity);
        scene.add(light);

    }
    const helpers = [];
    {
        const color = 0xFFFFFF;
        const intensity = .9;
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
        const cameraHelper = new THREE.CameraHelper(light.shadow.camera);

        helpers.push(cameraHelper);

    }

    {
        const pyramidMat = new THREE.MeshPhongMaterial({
            color: '#CA8',
            specular: 0x000000,
        });
        let y = .25
        for (let x = 15; x > 0; x--) {
            const pyramidGeo = new THREE.BoxGeometry(x, .5, x);
            const mesh = new THREE.Mesh(pyramidGeo, pyramidMat);
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            mesh.position.set(9, y, 8);
            scene.add(mesh);
            y += .5;
        }
    }


    {
        const pyramidMat = new THREE.MeshPhongMaterial({ color: '#CA8' });
        let y = .25
        for (let x = 15; x > 0; x--) {
            const pyramidGeo = new THREE.BoxGeometry(x, .5, x);
            const mesh = new THREE.Mesh(pyramidGeo, pyramidMat);
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            mesh.position.set(-8, y, -9);
            scene.add(mesh);
            y += .5;
        }
    }

    const base = new THREE.Object3D();
    scene.add(base);

    let ship;
    {
        // Pirate Ship by Braden Brunk [CC-BY] (https://creativecommons.org/licenses/by/3.0/) via Poly Pizza (https://poly.pizza/m/7aHmBgTur3V)
        const mtlLoader = new MTLLoader();
        mtlLoader.load('assets/pirateship/materials.mtl.bak', (mtl) => {
            mtl.preload();
            const objLoader = new OBJLoader();
            objLoader.setMaterials(mtl);
            objLoader.load('assets/pirateship/model.obj', (root) => {
                root.castShadow = true;
                root.scale.set(4, 4, 4);
                root.position.set(0, 1, 0);
                root.rotation.y = 90 * Math.PI / 180;
                base.add(root);
                ship = root;
            });
        })

    }

    {
        const hullMat = new THREE.MeshBasicMaterial({transparent: true, opacity: 0});
        const hullGeo = new THREE.BoxGeometry(3, .8, 1);
        const mesh = new THREE.Mesh(hullGeo, hullMat);
        mesh.castShadow = true;
        mesh.rotation.y = 43 * Math.PI / 180;
        mesh.position.set(.3, .4, -.3);
        base.add(mesh);
    }

    {
        const flag1Mat = new THREE.MeshBasicMaterial({transparent: true, opacity: 0});
        const flag1Geo = new THREE.BoxGeometry(.05, 1.1, 1.1);
        const mesh = new THREE.Mesh(flag1Geo, flag1Mat);
        mesh.castShadow = true;
        mesh.rotation.y = 55 * Math.PI / 180;
        mesh.position.set(-.3, 1.7, .1);
        base.add(mesh);
    }

    {
        const flag2Mat = new THREE.MeshBasicMaterial({transparent: true, opacity: 0});
        const flag2Geo = new THREE.BoxGeometry(.05, 1.3, 1.3);
        const mesh = new THREE.Mesh(flag2Geo, flag2Mat);
        mesh.castShadow = true;
        mesh.rotation.y = 50 * Math.PI / 180;
        mesh.position.set(0, 2.1, -.3);
        base.add(mesh);
    }

    {
        const flag3Mat = new THREE.MeshBasicMaterial({transparent: true, opacity: 0});
        const flag3Geo = new THREE.BoxGeometry(.05, .9, 1.2);
        const mesh = new THREE.Mesh(flag3Geo, flag3Mat);
        mesh.castShadow = true;
        mesh.rotation.y = 47 * Math.PI / 180;
        mesh.position.set(.6, 1.7, -.7);
        base.add(mesh);
    }



    const jewels = []
    {
        const jewelGeo = new THREE.IcosahedronGeometry();
        const jewelMat = new THREE.MeshPhongMaterial({ color: '#289964', specular: '#FFFFFF', shininess: 30});

        const jewel = new THREE.Mesh(jewelGeo, jewelMat);
        jewel.position.set(9, 9, 8);
        jewel.castShadow = true;
        scene.add(jewel);
        jewels.push(jewel);
    }

    {
        const jewelGeo = new THREE.TetrahedronGeometry();
        const jewelMat = new THREE.MeshPhongMaterial({ color: '#997d28', specular: '#FFFFFF', shininess: 30});

        const jewel = new THREE.Mesh(jewelGeo, jewelMat);
        jewel.position.set(-8, 9, -9);
        jewel.castShadow = true;
        scene.add(jewel);
        jewels.push(jewel);
    }

    const spotLights = []
    {
        const color = 0x289964;
        const intensity = 1;
        const light = new THREE.SpotLight(color, intensity);
        light.position.set(9, 9, 8);
        light.target.position.set(0, 1, 0);
        light.penumbra = .1;
        light.angle = 10 * Math.PI / 180;
        light.castShadow = true;
        light.shadow.camera.far = 40;
        scene.add(light);
        base.add(light.target);
        spotLights.push(light);
        const helper = new THREE.SpotLightHelper(light);
        helpers.push(helper);
        const cameraHelper = new THREE.CameraHelper(light.shadow.camera);
        helpers.push(cameraHelper);
    }

    {
        const color = 0x997d28;
        const intensity = 1;
        const light = new THREE.SpotLight(color, intensity);
        light.position.set(-8, 9, -9);
        light.target.position.set(0, 1, 0);
        light.penumbra = .1;
        light.angle = 10 * Math.PI / 180;
        light.castShadow = true;
        light.shadow.camera.far = 40;
        scene.add(light);
        base.add(light.target);
        spotLights.push(light);
        const helper = new THREE.SpotLightHelper(light);
        helpers.push(helper);
        const cameraHelper = new THREE.CameraHelper(light.shadow.camera);
        helpers.push(cameraHelper);
    }


    window.addEventListener( 'resize', onWindowResize );

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    }

    function render() {

        {
            const color = 0xd9c896;
            const near = 5;
            const far = 45;
            scene.fog = new THREE.Fog(color, near, far);
        }

        // render
        renderer.render(scene, camera);
    }
    renderer.setAnimationLoop(render);

}

main();