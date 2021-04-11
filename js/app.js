// Author : Niloy Sikdar

const container = document.querySelector('.scene');
const displayScore = document.querySelector('h2');
let camera, renderer, scene;
const originalBoxSize = 3;
const level = 0;
let score = 0;

let stack = [];
const boxHeight = 1;  // height of each layer

let gameStarted = false;

// const level = window.prompt("Select a level to enter the game !\nEnter 1 for Easy, 2 for Medium and 3 for Difficult level.\nDefault is Easy.");
window.focus();

init();

container.addEventListener('click', () => {
    if (!gameStarted) {
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
            score += 1;
            displayScore.innerText = score;

            // cutting layer
            const newWidth = direction == 'x' ? overlap : topLayer.width;
            const newDepth = direction == 'x' ? overlap : topLayer.depth;

            // updating metadata
            topLayer.width = newWidth;
            topLayer.depth = newDepth;

            // updating the box
            topLayer.threejs.scale[direction] = overlap / size;
            topLayer.threejs.position[direction] -= delta / 2;

            // next layer
            const nextX = direction == 'x' ? topLayer.threejs.position.x : -10;
            const nextZ = direction == 'z' ? topLayer.threejs.position.z : -10;
            const nextDirection = direction == 'x' ? 'z' : 'x';

            addlayer(nextX, nextZ, newWidth, newDepth, nextDirection);
        }
        else {
            gameStarted = false;
            showScore();
        }
    }
});

function init() {
    // creating scene
    scene = new THREE.Scene();

    // Foundation
    addlayer(0, 0, originalBoxSize, originalBoxSize);

    // First layer
    addlayer(-11, 0, originalBoxSize, originalBoxSize, 'x');

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
    let speed;

    if (level == '2') {
        speed = (score < 21) ? 0.15 : (score < 41) ? 0.17 : 0.18;
    }
    else if (level == '3') {
        speed = (score < 21) ? 0.17 : (score < 41) ? 0.19 : 0.20;
    }
    else {
        speed = (score < 21) ? 0.12 : (score < 41) ? 0.13 : 0.15;
    }

    const topLayer = stack[stack.length - 1];
    topLayer.threejs.position[topLayer.direction] += speed;

    // 4 is the initial camera height
    if (camera.position.y < boxHeight * (stack.length - 2) + 4) {
        camera.position.y += speed;
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    const width = 10;
    const height = width * (container.clientHeight / container.clientWidth);
    camera.left = width / -2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = height / -2;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

window.addEventListener('resize', onWindowResize);

document.onreadystatechange = function () {
    if (document.readyState == "complete") {
        setTimeout(removeLoader, 1800);
    }
};

function removeLoader() {
    const loader = document.querySelector('.loader-wrapper');
    loader.className = 'loader-wrapper-hidden';
}

function applyLoader() {
    const noloader = document.querySelector('.loader-wrapper-hidden');
    noloader.className = 'loader-wrapper';
}

function showScore() {
    const scorepage = document.querySelector('.score-page');
    const scorevalue = document.querySelector('.score-value');
    scorevalue.innerText = score;
    scorepage.style.display = 'flex';
}

document.querySelector('.try-now').addEventListener('click', () => {
    const audio = document.querySelector('audio');
    audio.play();
    const welcomescreen = document.querySelector('.welcome');
    welcomescreen.className = 'welcome-hidden';
    applyLoader();
    setTimeout(removeLoader, 1000);
});

document.querySelector('.play-again').addEventListener('click', () => {
    const scorepage = document.querySelector('.score-page');
    scorepage.style.display = 'none';
    window.location.reload();
})