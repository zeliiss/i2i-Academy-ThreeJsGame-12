import './style.css';
import * as THREE from 'three';

// --- 1. SAHNE ALTYAPISI ---

// Sahne
const scene = new THREE.Scene();

// Kamera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

// Render
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Ortam ışığı
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// Yönlü ışık
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Zemin
const planeGeometry = new THREE.PlaneGeometry(20, 100);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);


// --- 2. OYUNCU VE KONTROLLER ---

// Oyuncu 
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.y = 0.5;
player.castShadow = true;
scene.add(player);

// Tuş takibi
const keys = {
    w: false, a: false, s: false, d: false,
    ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false
};

// Tuşa basılma durumu
window.addEventListener('keydown', (event) => {
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = true;
    }
});

// Tuşun bırakılma durumu
window.addEventListener('keyup', (event) => {
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = false;
    }
});


// --- 3. ENGELLER VE ÇARPIŞMA KUTULARI ---

// Engelleri saklayacağımız dizi
const obstacles = [];
let spawnTimer = 0;

// Çarpışma sınır kutuları
const playerBox = new THREE.Box3();
const obstacleBox = new THREE.Box3();


// --- 4. YARDIMCI İŞLEMLER VE DÖNGÜ ---

// Ekran boyutunu güncelle
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const speed = 0.1;
const obstacleSpeed = 0.2;

// Animasyon döngüsü
function animate() {
    requestAnimationFrame(animate);

    // Oyuncu hareketi
    if (keys.ArrowUp || keys.w) {
        player.position.z -= speed;
    }
    if (keys.ArrowDown || keys.s) {
        player.position.z += speed;
    }
    if (keys.ArrowLeft || keys.a) {
        player.position.x -= speed;
    }
    if (keys.ArrowRight || keys.d) {
        player.position.x += speed;
    }

    // Yeni engel oluştur
    spawnTimer++;
    if (spawnTimer >= 60) {
        const obstacleGeometry = new THREE.BoxGeometry(1, 1, 1);
        const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 }); 
        const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
        
        obstacle.position.x = (Math.random() - 0.5) * 18;
        obstacle.position.y = 0.5;
        obstacle.position.z = -50; 
        obstacle.castShadow = true;
        
        scene.add(obstacle);
        obstacles.push(obstacle);
        
        spawnTimer = 0;
    }

    // Oyuncunun sınır kutusunu anlık konuma göre güncelle
    playerBox.setFromObject(player);

    // Engelleri hareket ettir ve çarpışmayı kontrol et
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].position.z += obstacleSpeed;

        // Engelin sınır kutusunu anlık konuma göre güncelle
        obstacleBox.setFromObject(obstacles[i]);

        // Kesişme (çarpışma) kontrolü
        if (playerBox.intersectsBox(obstacleBox)) {
            console.log("Çarpışma oldu! Oyun sıfırlanıyor.");
            
            // Oyuncuyu merkeze geri al
            player.position.set(0, 0.5, 0);

            // Tüm engelleri sahneden sil ve diziyi boşalt
            obstacles.forEach((obs) => {
                scene.remove(obs);
            });
            obstacles.length = 0;
            
            break; 
        }
    }

    renderer.render(scene, camera);
}

animate();