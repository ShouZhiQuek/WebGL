import {OrbitControls} from './node_module/three/examples/jsm/controls/OrbitControls.js';
import {GroundProjectedEnv} from './node_module/examples/jsm/objects/GroundProjectedEnv.js'
import {GLTFLoader} from '.node_module/examples/jsm/loaders/GLTFLoader.js';
import {RGBELoader} from './node_module/examples/jsm/loaders/RGBELoader.js';

//Camera rotation toggle button
const options = document.querySelector(".option");
options.addEventListener('click', rotateCamera)

function rotateCamera() {
    if(options.classList.contains('--is-active')) {
        orbit.autoRotate = true;
        options.classList.remove('--is-active');
    }
    else {
        orbit.autoRotate = false;
        options.classList.add('--is-active');
    }
}

// var activeOption = 'CarPaintWhite';
const TRAY = document.getElementById('js-tray-slide');
const colors = [
    {
        color:'66533C'
    },
    {
        color:'173A2F'
    },
    {
        color:'153944'
    },
    {
        color:'27548D'
    },
    {
        color:'438AAC'
    }
]

// Function - Build color
function buildColors(colors) {
    for(let [i, color] of colors.entries()) {
        let swatch = document.createElement('div');
        swatch.classList.add('tray__swatch');

        swatch.style.background = "#" + color.color;
        
        swatch.setAttribute('data-key', i);
        TRAY.append(swatch);
    }
}

buildColors(colors);


//Select Option
// const options = document.querySelectorAll(".option");
// for(const option of options) {
//     option.addEventListener('click', selectOption);
// }

// function selectOption(e) {
//     let option = e.target;
//     activeOption = e.target.dataset.option;
//     for(const otherOption of options) {
//         otherOption.classList.remove('--is-active');
//     }
//     option.classList.add('--is-active');
// }

//Swatches 
const swatches = document.querySelectorAll(".tray__swatch");
for(const swatch of swatches) {
    swatch.addEventListener('click', selectSwatch);
}

function selectSwatch(e) {
    let color = colors[parseInt(e.target.dataset.key)];
    let new_mtl;

    new_mtl = new THREE.MeshPhongMaterial({
        color: parseInt('0x' + color.color),
        shininess: color.shininess ? color.shininess : 10
    });

    setMaterial(model, 'CarPaintWhite', new_mtl);
}

function setMaterial(parent, type, mtl) {
    parent.traverse((o) => {
        if(o.isMesh && o.nameID != null) {
            if(o.nameID == type) {
                o.material = mtl;
            }
        }
    })
}

//Init the scene
const scene = new THREE.Scene();

//Call canvas element
const canvas = document.querySelector('#c');

//Init the renderer
const renderer = new THREE.WebGLRenderer({canvas, antialias: true});

document.body.appendChild(renderer.domElement);

//Add a camera
const camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(-20, 7, -20);
camera.lookAt(0, 4, 0);

//Init orbit control
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enablePan = false;
orbit.maxPolarAngle = Math.PI / 2.2;
orbit.minDistance = 20;
orbit.maxDistance = 30;

renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xA3A3A3);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

const grid = new THREE.GridHelper(30, 30);
scene.add(grid);
grid.position.y = -1;

//Floor
// const floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
// const floorMaterial = new THREE.MeshPhongMaterial({
//     color: 0xeeeeee,
//     shininess: 0
// })
// const floor = new THREE.Mesh(floorGeometry, floorMaterial);
// floor.rotation.x = -0.5 * Math.PI;
// floor.receiveShadow = true;
// floor.position.y = -1;
// scene.add(floor);

const gltfLoader = new GLTFLoader();

const rgbeLoader = new RGBELoader();


BACKROUND_PATH = new URL('../../static/blouberg_sunrise_2_4k.hdr', import.meta.url)
//Load 360 background 
rgbeLoader.load(BACKROUND_PATH.href, function(texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;

    const env = new GroundProjectedEnv(texture);
    env.scale.setScalar(100);
    scene.add(env);
    env.radius = 440;
    env.height = 20
    env.revieceShadow = true;
});


var model
//const MODEL_PATH =  "https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/chair.glb";
const CAR_PATH = new URL('../../static/Car.gltf', import.meta.url);
//Load model
gltfLoader.load(CAR_PATH.href, function(gltf) {
    model = gltf.scene;
    model.traverse((o) => {
        if(o.isMesh) {
            o.castShadow = true;
            o.receiveShadow = true;
        }
    })
    for (let object of INITIAL_MAP) {
        initColor(model, object.childID, object.mlt);
    }
    scene.add(model);
    model.position.y = -1;
    model.rotation.y = Math.PI / 2;
});

//Initial material
const INITIAL_MLT = new THREE.MeshPhongMaterial({
    color: 0xff0303,
    shininess: 10
})

const INITIAL_MAP = [
    {childID: "CarPaintWhite", mlt: INITIAL_MLT},
    // {childID: "base", mlt: INITIAL_MLT},
    // {childID: "cushions", mlt: INITIAL_MLT},
    // {childID: "legs", mlt: INITIAL_MLT},
    // {childID: "supports", mlt: INITIAL_MLT},
]

function initColor(parent, type, mlt) {
    parent.traverse((o) => {
        if(o.isMesh) {
            if(o.name.includes(type)) {
                o.material = mlt;
                o.nameID = type; //Set a new property to identfy this object
            }
        }
    })
}

//Add hemilight light 
const hemilight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
hemilight.position.set(0, 50, 0);
scene.add(hemilight); 

//Add directioal light
const dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
dirLight.position.set(-8, 12, 8);
dirLight.castShadow = true;
dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
scene.add(dirLight);

function animate() {
    orbit.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});