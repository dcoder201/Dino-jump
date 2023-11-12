import React, { Component} from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import '@fontsource/press-start-2p';
import '../App.css';

const TREX_JUMP_SPEED = 20;
const CACTUS_SPAWN_X = 20;
const CACTUS_DESTROY_X = -20;
const CACTUS_MAX_SCALE = 1;
const CACTUS_MIN_SCALE = 0.5;
const CACTUS_SPAWN_MAX_INTERVAL = 4;
const CACTUS_SPAWN_MIN_INTERVAL = 2;
const GRAVITY = -50;
const FLOOR_SPEED = -10;
const SKYSPHERE_ROTATE_SPEED = 0.02;
const SCORE_INCREASE_SPEED = 10;

class Game extends Component {
  constructor(props) {
    super(props);


    this.scene = new THREE.Scene();
    this.infoElement = null;
    this.clock = new THREE.Clock();
    this.mixers = [];
    this.trex = null;
    this.cactus = null;
    this.floor = null;
    this.skySphere = null;
    this.directionalLight = null;
    this.jump = false;
    this.vel = 0;
    this.nextCactusSpawnTime = 0;
    this.score = 0;
    this.isGameOver = true;
    this.cactusGroup = new THREE.Group();
    this.renderer = null;
    this.camera = null;
    this.scene.add(this.cactusGroup);
    
  }

  componentDidMount() {
    this.createInfoElement();
    this.createCamera();
    this.createRenderer();
    this.createLighting();
    this.load3DModels();
    this.createFloor();
    this.createSkySphere('sky.jpg');
    this.enableShadow(this.renderer, this.directionalLight);
    this.handleInput();
    this.handleWindowResize();
    this.animate();
  }

  

  createInfoElement() {
    this.infoElement = document.createElement('div');
    this.infoElement.id = 'info';
    this.infoElement.innerHTML = 'Press any key to start!';
    document.body.appendChild(this.infoElement);
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 1, 10);
    this.camera.lookAt(3, 3, 0);
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x7f7f7f);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    document.body.appendChild(this.renderer.domElement);
  }

  animate() {
    const animate = () => {
    requestAnimationFrame(animate);
    const delta = this.clock.getDelta();
    this.update(delta);
    this.renderer.render(this.scene, this.camera);
  };
  animate();
  }

  createLighting() {
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
    this.directionalLight.intensity = 2;
    this.directionalLight.position.set(0, 10, 0);
    const targetObject = new THREE.Object3D();
    targetObject.position.set(0, 0, 0);
    this.scene.add(targetObject);
    this.directionalLight.target = targetObject;
    this.scene.add(this.directionalLight);
    const light = new THREE.AmbientLight(0x7f7f7f); // soft white light
    light.intensity = 1;
    this.scene.add(light);
  }

  load3DModels() {
    const loader = new GLTFLoader();
    const loader2 = new GLTFLoader();

    loader.load('models/t-rex/scene.gltf', (gltf) => {
      this.trex = gltf.scene;
      this.trex.scale.setScalar(0.5);
      this.trex.rotation.y = Math.PI / 2;
      this.scene.add(this.trex);

      const mixer = new THREE.AnimationMixer(this.trex);
      const clip = THREE.AnimationClip.findByName(gltf.animations, 'run');
      if (clip) {
        const action = mixer.clipAction(clip);
        action.play();
      }
      this.mixers.push(mixer);

    });

    loader2.load('models/cactus/scene.gltf', (gltf) => {
      this.cactus = gltf.scene;

  this.cactus.scale.setScalar(0.05); 
  this.cactus.rotation.y = -Math.PI / 2;
     console.log("cactus loaded");
    });
  }

  createFloor() {
    const geometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
    const texture = new THREE.TextureLoader().load('grass.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(100, 100);

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      color: 0x355E3B,
    });

    this.floor = new THREE.Mesh(geometry, material);
    this.floor.material.side = THREE.DoubleSide;
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.castShadow = false;
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);
  }

  createSkySphere(file) {
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);

    const texture = new THREE.TextureLoader().load(file);
    texture.encoding = THREE.sRGBEncoding;
    const material = new THREE.MeshBasicMaterial({ map: texture });
    this.skySphere = new THREE.Mesh(geometry, material);
    this.scene.add(this.skySphere);
  }

  enableShadow(renderer, light) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    light.castShadow = true;
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    light.shadow.camera.near = 0.001;
    light.shadow.camera.far = 500;
  }

  handleInput() {
    const callback = () => {
      if (this.isGameOver) {

        this.restartGame();
        return;
      }
      this.jump = true;
      
    };

    document.addEventListener('keydown', callback, false);
    this.renderer.domElement.addEventListener('touchstart', callback);
    this.renderer.domElement.addEventListener('click', callback);
  }

  

  handleWindowResize() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);
  }

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }

  gameOver() {
    this.isGameOver = true;
    this.infoElement.innerHTML = 'GAME OVER';
  }

  restartGame() {
    this.isGameOver = false;
    this.infoElement.innerHTML = '';
    this.score = 0;
    this.cactusGroup.children.length = 0;
  }

  update(delta) {
    if (!this.cactus) return;
    if (!this.trex) return;
    if (!this.floor) return;
    if (this.isGameOver) return;

    for (const mixer of this.mixers) {
      mixer.update(delta);
    }

    if (this.jump) {
      this.jump = false;
      if (this.trex.position.y === 0) {
        this.vel = TREX_JUMP_SPEED;
        this.trex.position.y = this.vel * delta;
      }
    }

    if (this.trex.position.y > 0) {
      this.vel += GRAVITY * delta;
      this.trex.position.y += this.vel * delta;
    } else {
      this.trex.position.y = 0;
    }

    if (this.clock.elapsedTime > this.nextCactusSpawnTime) {
      const interval = this.randomFloat(CACTUS_SPAWN_MIN_INTERVAL, CACTUS_SPAWN_MAX_INTERVAL);
      this.nextCactusSpawnTime = this.clock.elapsedTime + interval;
      const numCactus = this.randomInt(3, 5);

      for (let i = 0; i < numCactus; i++) {
        const clone = this.cactus.clone();
        clone.position.x = CACTUS_SPAWN_X + i * 0.5;
        clone.scale.multiplyScalar(this.randomFloat(CACTUS_MIN_SCALE, CACTUS_MAX_SCALE));
        this.cactusGroup.add(clone);
      }
    }

    for (const cactus of this.cactusGroup.children) {
      cactus.position.x += FLOOR_SPEED * delta;
    }

    while (this.cactusGroup.children.length > 0 && this.cactusGroup.children[0].position.x < CACTUS_DESTROY_X) {
      this.cactusGroup.remove(this.cactusGroup.children[0]);
    }




    // Destroy cactuses
    while (this.cactusGroup.children.length > 0 &&
           this.cactusGroup.children[0].position.x < CACTUS_DESTROY_X) {
      this.cactusGroup.remove(this.cactusGroup.children[0]);
    }

    const trexAABB = new THREE.Box3(
      new THREE.Vector3(-1, this.trex.position.y, 0),
      new THREE.Vector3(1, this.trex.position.y + 2, 0)
    );

    for (const cactus of this.cactusGroup.children) {
      const cactusAABB = new THREE.Box3();
      cactusAABB.setFromObject(cactus);

      if (cactusAABB.intersectsBox(trexAABB)) {
        this.gameOver();
        return;
      }
    }

    this.floor.material.map.offset.add(new THREE.Vector2(delta, 0));

    this.trex.traverse((child) => {
      child.castShadow = true;
      child.receiveShadow = false;
    });

    if (this.skySphere) {
      this.skySphere.rotation.y += delta * SKYSPHERE_ROTATE_SPEED;
    }

    this.score += delta * SCORE_INCREASE_SPEED;
    this.infoElement.innerHTML = Math.floor(this.score).toString().padStart(5, '0');
  }

  render() {
    return (
      <div>
        {/* Your component's JSX content can go here */}
      </div>
    );
  }
}

export default Game;



