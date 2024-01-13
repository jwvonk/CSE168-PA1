import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';


function main() {
    const canvas = document.querySelector('#c');
    const view1Elem = document.querySelector('#view1');
    const view2Elem = document.querySelector('#view2');
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.shadowMap.enabled = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const fov = 45;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 200;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.set(0, 10, 20);

    const cameraHelper = new THREE.CameraHelper(camera);

    // const controls = new OrbitControls(camera, view1Elem);
    // controls.target.set(0, 5, 0);
    // controls.update();

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

    const camera2 = new THREE.PerspectiveCamera(
        60,  // fov
        2,   // aspect
        0.001, // near
        50, // far
    );
    camera2.position.set(1, 1, -1)
    camera2.lookAt(5, 1, -5);
    base.add(camera2)


    function setScissorForElement(elem) {
        const canvasRect = canvas.getBoundingClientRect();
        const elemRect = elem.getBoundingClientRect();

        // compute a canvas relative rectangle
        const right = Math.min(elemRect.right, canvasRect.right) - canvasRect.left;
        const left = Math.max(0, elemRect.left - canvasRect.left);
        const bottom = Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top;
        const top = Math.max(0, elemRect.top - canvasRect.top);

        const width = Math.min(canvasRect.width, right - left);
        const height = Math.min(canvasRect.height, bottom - top);

        // setup the scissor to only render to that part of the canvas
        const positiveYUpBottom = canvasRect.height - bottom;
        renderer.setScissor(left, positiveYUpBottom, width, height);
        renderer.setViewport(left, positiveYUpBottom, width, height);

        // return the aspect
        return width / height;
    }


    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
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


    function render(time) {
        time *= 0.001; // convert time to seconds

        jewels.forEach((jewel, ndx) => {
            const speed = 1 + ndx * .1;
            const rot = time * speed;
            const ele = Math.sin(time + ndx) * speed / 2 + 9;
            jewel.rotation.x = rot;
            jewel.rotation.y = rot;
            jewel.position.y = ele;
        });

        spotLights.forEach((light, ndx) => {
            const speed = 1 + ndx * .1;
            const ele = Math.sin(time + ndx) * speed / 2 + 10.5;
            light.position.y = ele;
        });

        base.position.x = time % 40 - 20;
        base.position.z = -(time % 40 - 20);
        base.position.y = Math.sin(time) * .05 + .1


        helpers.forEach((helper) => {
            helper.update();
        });

        resizeRendererToDisplaySize(renderer);

        // turn on the scissor
        renderer.setScissorTest(true);

        // render the original view
        {
            const aspect = setScissorForElement(view1Elem);

            // adjust the camera for this aspect
            camera.aspect = aspect;
            camera.updateProjectionMatrix();
            cameraHelper.update();

            // don't draw the camera helper in the original view
            cameraHelper.visible = false;

            scene.fog = null;

            // render
            renderer.render(scene, camera);
        }

        // render from the 2nd camera
        {
            const aspect = setScissorForElement(view2Elem);

            // adjust the camera for this aspect
            camera2.aspect = aspect;
            camera2.updateProjectionMatrix();

            // draw the camera helper in the 2nd view
            cameraHelper.visible = true;

            // scene.background.set(0x000040);
            {
                const color = 0xd9c896;
                const near = 5;
                const far = 45;
                scene.fog = new THREE.Fog(color, near, far);
            }

            renderer.render(scene, camera2);
        }
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

}

main();