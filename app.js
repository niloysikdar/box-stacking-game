const container = document.querySelector('.scene');
var audio = new Audio('sound.mp3');
let camera, renderer, scene;
const originalBoxSize = 3;

let stack = [];
let overhangs = [];
const boxHeight = 1;  // height of each layer

let gameStarted = false;

window.focus();

init();

window.addEventListener('click', () => {
    if (!gameStarted) {
        // audio.play();
        renderer.setAnimationLoop(animation);
        gameStarted = true;
    } else {
        const topLayer = stack[stack.length - 1];
        const previousLayer = stack[stack.length - 2];

        const direction = topLayer.direction;

        const delta = topLayer.threejs.position[direction] - previousLayer.threejs.position[direction];

        const overHangpart = Math.abs(delta);

        const size = direction == 'x' ? topLayer.width : topLayer.depth;

        const overlap = size - overHangpart;

        if (overlap > 0) {
            console.log(overlap);
            // cutting layer
            const newWidth = direction == 'x' ? overlap : topLayer.width;
            const newDepth = direction == 'x' ? overlap : topLayer.depth;

            // updating metadata
            topLayer.width = newWidth;
            topLayer.depth = newDepth;

            // updating the box
            topLayer.threejs.scale[direction] = overlap / size;
            topLayer.threejs.position[direction] -= delta / 2;

            // // overhanging part
            // const overhangShift = (overlap / 2 * overHangpart / 2) * Math.sign(delta);
            // const overhangX =
            //     direction == 'x'
            //         ? topLayer.threejs.position.x + overhangShift
            //         : topLayer.threejs.position.x;
            // const overhangZ =
            //     direction == 'z'
            //         ? topLayer.threejs.position.z + overhangShift
            //         : topLayer.threejs.position.z;
            // const overhangWidth = direction == 'x' ? overHangpart : newWidth;
            // const overhangDepth = direction == 'z' ? overHangpart : newDepth;

            // addOverHang(overhangX, overhangZ, overhangWidth, overhangDepth);


            // next layer
            const nextX = direction == 'x' ? topLayer.threejs.position.x : -10;
            const nextZ = direction == 'z' ? topLayer.threejs.position.z : -10;
            const nextDirection = direction == 'x' ? 'z' : 'x';

            addlayer(nextX, nextZ, newWidth, newDepth, nextDirection);
        }
        else {
            console.log('Ended');
            gameStarted = false;
        }
    }
});

function init() {
    // creating scene
    scene = new THREE.Scene();

    // Foundation
    addlayer(0, 0, originalBoxSize, originalBoxSize);

    // First layer
    addlayer(-10, 0, originalBoxSize, originalBoxSize, 'x');

    // camera setup
    const width = 10;
    const height = width * (container.clientHeight / container.clientWidth);
    camera = new THREE.OrthographicCamera(
        width / -2, // left
        width / 2, // right
        height / 2, // top
        height / -2, // bottom
        1, // near plane
        100 // far plane
    );

    camera.position.set(5, 5, 5);
    camera.lookAt(0, 1, 0);

    // setting up lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(10, 20, 0);
    scene.add(directionalLight);

    // renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.render(scene, camera);

    container.appendChild(renderer.domElement);
}


// function addOverHang(x, z, width, depth) {
//     const y = boxHeight * (stack.length - 1);
//     const overhang = generateBox(x, y, z, width, depth);
//     overhangs.push(overhang);
// }


function addlayer(x, z, width, depth, direction) {
    const y = boxHeight * stack.length - 1;  // adding the new box one layer higher

    const layer = generateBox(x, y, z, width, depth);
    layer.direction = direction;

    stack.push(layer);
}

function generateBox(x, y, z, width, depth) {
    const geometry = new THREE.BoxGeometry(width, boxHeight, depth);
    const color = new THREE.Color(`hsl(${30 + stack.length * 4}, 100%, 50%)`);
    const material = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);

    scene.add(mesh);

    return {
        threejs: mesh,
        width,
        depth,
    };
}


function animation() {
    const speed = 0.18;

    const topLayer = stack[stack.length - 1];
    topLayer.threejs.position[topLayer.direction] += speed;

    // 4 is the initial camera height
    if (camera.position.y < boxHeight * (stack.length - 2) + 4) {
        camera.position.y += speed;
    }

    renderer.render(scene, camera);
}