/**
 * three_renderer.js - Full 3D WebGL Engine for Resident Life Observer
 */

class ThreeRenderer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Three.js Core Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#0f172a');
    this.scene.fog = new THREE.FogExp2('#0f172a', 0.007);

    // Perspective 3D Camera
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
    this.camera.position.set(0, 48, 65);
    this.camera.lookAt(0, 0, 0);

    // WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lighting
    this.ambientLight = new THREE.AmbientLight('#ffffff', 0.7);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight('#fff7ed', 1.0);
    this.sunLight.position.set(45, 85, 55);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 300;
    let d = 60;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.scene.add(this.sunLight);

    this.houseMeshes = {};
    this.residentMeshes = {};
    this.bubbleOverlays = {};

    window.addEventListener('resize', () => this.onWindowResize());
  }

  onWindowResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  worldTo3D(x, y, tileSize = 32) {
    let scale = 0.12;
    return {
      x: (x - 27 * tileSize) * scale,
      y: 0,
      z: (y - 19 * tileSize) * scale
    };
  }

  init3DWorld(world) {
    const ts = world.tileSize;

    // 1. 3D Ground Plane Mesh
    let groundGeo = new THREE.PlaneGeometry(90, 70);
    let groundMat = new THREE.MeshStandardMaterial({ color: '#38a169', roughness: 0.8 });
    let ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // 2. 3D Roads Mesh
    for (let r = 0; r < world.rows; r++) {
      for (let c = 0; c < world.cols; c++) {
        if (world.grid[r][c] === 1) {
          let pos = this.worldTo3D(c * ts + 16, r * ts + 16, ts);
          let roadGeo = new THREE.PlaneGeometry(3.8, 3.8);
          let roadMat = new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.6 });
          let road = new THREE.Mesh(roadGeo, roadMat);
          road.rotation.x = -Math.PI / 2;
          road.position.set(pos.x, 0.02, pos.z);
          road.receiveShadow = true;
          this.scene.add(road);
        }
      }
    }

    // 3. 3D Pond Water Mesh
    let pondGeo = new THREE.PlaneGeometry(34, 24);
    let pondMat = new THREE.MeshStandardMaterial({ color: '#38bdf8', roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.85 });
    let pond = new THREE.Mesh(pondGeo, pondMat);
    pond.rotation.x = -Math.PI / 2;
    let pondPos = this.worldTo3D(18 * ts, 24 * ts, ts);
    pond.position.set(pondPos.x, 0.05, pondPos.z);
    this.scene.add(pond);

    // 4. Build 3D Houses & Interiors
    for (let h of world.houses) {
      this.build3DHouse(h, ts);
    }

    // 5. Build 3D Trees & Fountain
    this.build3DLandmarksAndTrees(world, ts);
  }

  build3DHouse(h, ts) {
    let houseGroup = new THREE.Group();
    let centerPos = this.worldTo3D((h.x + h.w / 2) * ts, (h.y + h.h / 2) * ts, ts);
    houseGroup.position.set(centerPos.x, 0, centerPos.z);

    let w = h.w * ts * 0.12;
    let depth = h.h * ts * 0.12;
    let height = 3.8;

    // Walls
    let wallGeo = new THREE.BoxGeometry(w, height, depth);
    let wallMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.5 });
    let walls = new THREE.Mesh(wallGeo, wallMat);
    walls.position.y = height / 2;
    walls.castShadow = true;
    walls.receiveShadow = true;
    houseGroup.add(walls);

    // Roof
    let roofGeo = new THREE.ConeGeometry(w * 0.75, 2.4, 4);
    let roofMat = new THREE.MeshStandardMaterial({ color: h.color, roughness: 0.3 });
    let roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = height + 1.2;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    houseGroup.add(roof);

    // 3D Interior Furnishings inside House (Bed, Fireplace, Sofa, TV)
    // 3D Bed
    let bedMat = new THREE.MeshStandardMaterial({ color: h.color });
    let bedMesh = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.6, 1.4), bedMat);
    bedMesh.position.set(-w / 2 + 1.2, 0.3, -depth / 2 + 1.0);
    houseGroup.add(bedMesh);

    // 3D Fireplace with Point Light
    let fireMat = new THREE.MeshStandardMaterial({ color: '#78350f' });
    let fireMesh = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.8, 1.0), fireMat);
    fireMesh.position.set(w / 2 - 1.0, 0.9, -depth / 2 + 0.8);
    houseGroup.add(fireMesh);

    let fireLight = new THREE.PointLight('#f97316', 1.2, 8);
    fireLight.position.set(w / 2 - 1.0, 1.0, -depth / 2 + 0.8);
    houseGroup.add(fireLight);

    // 3D Sofa & TV
    let sofaMesh = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 1.0), new THREE.MeshStandardMaterial({ color: '#2563eb' }));
    sofaMesh.position.set(0, 0.4, 0);
    houseGroup.add(sofaMesh);

    let tvMesh = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 0.3), new THREE.MeshStandardMaterial({ color: '#0f172a' }));
    tvMesh.position.set(0, 1.2, -depth / 2 + 0.4);
    houseGroup.add(tvMesh);

    this.scene.add(houseGroup);
    this.houseMeshes[h.id] = { group: houseGroup, roof: roof, houseData: h };
  }

  build3DLandmarksAndTrees(world, ts) {
    // 3D Fountain
    let fPos = this.worldTo3D(27 * ts + 16, 19 * ts + 16, ts);
    let fountainGeo = new THREE.CylinderGeometry(2.5, 2.8, 1.2, 16);
    let fountainMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.4 });
    let fountain = new THREE.Mesh(fountainGeo, fountainMat);
    fountain.position.set(fPos.x, 0.6, fPos.z);
    fountain.castShadow = true;
    this.scene.add(fountain);

    // 3D Campfire
    let cPos = this.worldTo3D(45 * ts + 16, 24 * ts + 16, ts);
    let campfireLight = new THREE.PointLight('#ea580c', 2.0, 12);
    campfireLight.position.set(cPos.x, 1.2, cPos.z);
    this.scene.add(campfireLight);

    // 3D Trees
    for (let dec of world.decorations) {
      if (dec.type === 'tree') {
        let pos = this.worldTo3D(dec.x * ts + 16, dec.y * ts + 16, ts);
        let treeGroup = new THREE.Group();
        treeGroup.position.set(pos.x, 0, pos.z);

        // Trunk
        let trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 1.8), new THREE.MeshStandardMaterial({ color: '#78350f' }));
        trunk.position.y = 0.9;
        trunk.castShadow = true;
        treeGroup.add(trunk);

        // Canopy Cone
        let canopy = new THREE.Mesh(new THREE.ConeGeometry(1.6, 3.2, 8), new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.6 }));
        canopy.position.y = 3.0;
        canopy.castShadow = true;
        treeGroup.add(canopy);

        this.scene.add(treeGroup);
      }
    }
  }

  // Update 3D Residents & Open Roof State
  update3DResidents(residents, tickCount, tileSize, selectedHouseId) {
    // 1. Open/Hide Roofs
    for (let hid in this.houseMeshes) {
      let hObj = this.houseMeshes[hid];
      if (hid === selectedHouseId) {
        hObj.roof.visible = false; // Lift roof off for interior viewing!
      } else {
        hObj.roof.visible = true;
      }
    }

    // 2. Update 3D Resident Avatars
    for (let r of residents) {
      let pos = this.worldTo3D(r.x, r.y, tileSize);

      if (!this.residentMeshes[r.id]) {
        let group = new THREE.Group();

        // 3D Body
        let bodyGeo = new THREE.CylinderGeometry(0.6, 0.7, 1.4, 8);
        let bodyMat = new THREE.MeshStandardMaterial({ color: r.bodyColor });
        let body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.7;
        body.castShadow = true;
        group.add(body);

        // 3D Head with dynamic Canvas Face Texture mapped on front!
        let faceTexture = new THREE.CanvasTexture(r.faceCanvas);
        faceTexture.minFilter = THREE.LinearFilter;

        let headGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
        let headMaterials = [
          new THREE.MeshStandardMaterial({ color: '#ffffff' }),
          new THREE.MeshStandardMaterial({ color: '#ffffff' }),
          new THREE.MeshStandardMaterial({ color: '#ffffff' }),
          new THREE.MeshStandardMaterial({ color: '#ffffff' }),
          new THREE.MeshStandardMaterial({ map: faceTexture }), // Front Face!
          new THREE.MeshStandardMaterial({ color: r.hairColor })
        ];

        let head = new THREE.Mesh(headGeo, headMaterials);
        head.position.y = 2.0;
        head.castShadow = true;
        group.add(head);

        this.scene.add(group);
        this.residentMeshes[r.id] = { group: group, faceTexture: faceTexture };
      }

      let mesh = this.residentMeshes[r.id];
      let bounce = (r.path && r.currentPathIndex < r.path.length) ? Math.abs(Math.sin(tickCount * 0.22)) * 0.3 : 0;
      mesh.group.position.set(pos.x, r.inBed ? 0.3 : bounce, pos.z);
      mesh.faceTexture.needsUpdate = true;
    }
  }

  render(timeOfDay, followingResident, tileSize) {
    if (timeOfDay === 'morning') {
      this.sunLight.color.set('#f97316');
      this.scene.fog.color.set('#fed7aa');
    } else if (timeOfDay === 'evening') {
      this.sunLight.color.set('#ea580c');
      this.scene.fog.color.set('#475569');
    } else if (timeOfDay === 'night') {
      this.sunLight.color.set('#1e1b4b');
      this.scene.fog.color.set('#0f172a');
    } else {
      this.sunLight.color.set('#fff7ed');
      this.scene.fog.color.set('#0f172a');
    }

    if (followingResident) {
      let targetPos = this.worldTo3D(followingResident.x, followingResident.y, tileSize);
      this.camera.position.x += (targetPos.x - this.camera.position.x) * 0.08;
      this.camera.position.z += (targetPos.z + 38 - this.camera.position.z) * 0.08;
      this.camera.lookAt(targetPos.x, 0, targetPos.z);
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.ThreeRenderer = ThreeRenderer;
