import './style.css';
import * as THREE from 'three';

// Arayüz (UI) elementleri
const scoreElement = document.getElementById('scoreValue');
const gameOverScreen = document.getElementById('gameOverScreen');

// Oyun durumu yönetimi
let isGameOver = false;
let score = 0;


// --- 1. SAHNE ALTYAPISI ---
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

const planeGeometry = new THREE.PlaneGeometry(20, 100);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);


// --- 2. OYUNCU VE KONTROLLER ---
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0xffc0cb }); // Pembe
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.y = 0.5;
player.castShadow = true;
scene.add(player);

const keys = {
    w: false, a: false, s: false, d: false,
    ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
    ' ': false 
};

// Tuşa basılma durumu
window.addEventListener('keydown', (event) => {
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = true;
    }
    
    // Oyun bittiyse ve boşluk tuşuna basıldıysa sıfırla
    if (isGameOver && event.key === ' ') {
        resetGame();
    }
});

// Tuşun bırakılma durumu
window.addEventListener('keyup', (event) => {
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = false;
    }
});


// --- 3. ENGELLER VE ÇARPIŞMA KUTULARI ---
const obstacles = [];
let spawnTimer = 0;

const playerBox = new THREE.Box3();
const obstacleBox = new THREE.Box3();


// --- 4. YARDIMCI İŞLEMLER VE DÖNGÜ ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const speed = 0.1;
const obstacleSpeed = 0.2;

// Hareket sınırları
const xLimit = 9.5; 
const zLimitMin = -40; // İleri gitme sınırı
const zLimitMax = 8;   // Geri gelme sınırı

// Oyunu başlangıç ayarlarına döndür
function resetGame() {
    isGameOver = false;
    score = 0;
    scoreElement.innerText = score;
    gameOverScreen.style.display = 'none';
    
    player.position.set(0, 0.5, 0);
    
    obstacles.forEach((obs) => {
        scene.remove(obs);
    });
    obstacles.length = 0;
}

// Animasyon döngüsü
function animate() {
    requestAnimationFrame(animate);

    if (isGameOver) {
        renderer.render(scene, camera);
        return; 
    }

    score += 1;
    scoreElement.innerText = Math.floor(score / 10);

    // Oyuncu hareketi ve Sınır Kontrolleri
    if ((keys.ArrowUp || keys.w) && player.position.z > zLimitMin) {
        player.position.z -= speed;
    }
    if ((keys.ArrowDown || keys.s) && player.position.z < zLimitMax) {
        player.position.z += speed;
    }
    if ((keys.ArrowLeft || keys.a) && player.position.x > -xLimit) {
        player.position.x -= speed;
    }
    if ((keys.ArrowRight || keys.d) && player.position.x < xLimit) {
        player.position.x += speed;
    }

    // Yeni engel oluştur
    spawnTimer++;
    if (spawnTimer >= 60) {
        const obstacleGeometry = new THREE.BoxGeometry(1, 1, 1);
        const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 }); // Kahverengi
        const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
        
        obstacle.position.x = (Math.random() - 0.5) * 18;
        obstacle.position.y = 0.5;
        obstacle.position.z = -50; 
        obstacle.castShadow = true;
        
        scene.add(obstacle);
        obstacles.push(obstacle);
        
        spawnTimer = 0;
    }

    playerBox.setFromObject(player);

    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].position.z += obstacleSpeed;

        obstacleBox.setFromObject(obstacles[i]);

        if (playerBox.intersectsBox(obstacleBox)) {
            isGameOver = true;
            gameOverScreen.style.display = 'block'; 
            break; 
        }
    }

    renderer.render(scene, camera);
}

animate();