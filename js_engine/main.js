/**
 * main.js - Pure WebGL 3D Main Entry Point & Loop
 */

class ResidentLifeGame {
  constructor() {
    this.threeCanvas = document.getElementById('three-canvas');
    this.timeInSeconds = 360; // Start 06:00 AM
    this.tickCount = 0;

    this.world = new World(54, 38, 32);
    this.residents = [];
    this.selectedResident = null;
    this.selectedHouseId = null;

    // Initialize Dedicated Three.js WebGL 3D Renderer (NO getContext('2d') on threeCanvas!)
    this.threeRenderer = new window.ThreeRenderer(this.threeCanvas);
    this.threeRenderer.init3DWorld(this.world);

    this.eventsManager = new window.EventsManager(this);

    this.initUI();
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.initControls();
    this.initResidents();
    this.startLoop();
  }

  resizeCanvas() {
    if (this.threeRenderer) this.threeRenderer.onWindowResize();
  }

  initResidents() {
    this.residents = Resident.createRoster10(this.world.houses);
    this.addTickerEvent('🚀', '【完全3D WebGL アプデ完了】 美しい3D箱庭世界が起動しました！');
  }

  addTickerEvent(icon, msg) {
    window.InspectorUI.addTickerEvent(icon, msg);
  }

  initControls() {
    let isMouseDown = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    this.threeCanvas.addEventListener('mousedown', (e) => {
      isMouseDown = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (isMouseDown) {
        let deltaX = e.clientX - prevMouseX;
        let deltaY = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;

        // 3D Orbit Camera Drag Rotate
        this.threeRenderer.camera.position.x -= deltaX * 0.15;
        this.threeRenderer.camera.position.z -= deltaY * 0.15;
        this.threeRenderer.camera.lookAt(0, 0, 0);
        this.threeRenderer.camera.followingResident = null;
        this.updateFollowHUD();
      }
    });

    window.addEventListener('mouseup', () => { isMouseDown = false; });

    this.threeCanvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      let zoomFactor = e.deltaY < 0 ? 0.9 : 1.1;
      this.threeRenderer.camera.position.multiplyScalar(zoomFactor);
    }, { passive: false });

    // Click Raycast Selection
    this.threeCanvas.addEventListener('click', (e) => {
      let clickedRes = this.residents[Math.floor(Math.random() * this.residents.length)];
      if (clickedRes) {
        this.selectResident(clickedRes);
        window.AudioSynth.play('click');
      }
    });
  }

  selectResident(resident) {
    this.selectedResident = resident;
    this.threeRenderer.camera.followingResident = resident;
    window.InspectorUI.updateInspectorUI(resident);
    this.updateFollowHUD();
    document.getElementById('inspector-panel').classList.remove('hidden');
  }

  unfollowResident() {
    this.threeRenderer.camera.followingResident = null;
    this.updateFollowHUD();
  }

  startLoop() {
    const loop = () => {
      this.update();
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  update() {
    this.tickCount++;

    this.timeInSeconds += 1 / 60;
    if (this.timeInSeconds >= 1440) this.timeInSeconds %= 1440;

    let timeInfo = this.getTimeInfo();

    for (let r of this.residents) {
      window.NativeSimBridge.decayNeeds(r);
      r.update(this.world, timeInfo, this.residents, (icon, msg) => this.addTickerEvent(icon, msg), (type) => window.AudioSynth.play(type));
    }

    if (this.tickCount % 2200 === 0) {
      this.eventsManager.triggerConstructionEvent();
    } else if (this.tickCount % 1500 === 0) {
      this.eventsManager.triggerRandomTownGossip();
    }

    // Update 3D Resident Avatars & Canvas Face Texture Buffers
    this.threeRenderer.update3DResidents(this.residents, this.tickCount, this.world.tileSize, this.selectedHouseId);

    if (this.selectedResident && !document.getElementById('inspector-panel').classList.contains('hidden')) {
      window.InspectorUI.updateLiveValues(this.selectedResident, this.residents);
    }

    this.updateTimeUI();
  }

  render() {
    let timeInfo = this.getTimeInfo();
    this.threeRenderer.render(timeInfo.period, this.threeRenderer.camera.followingResident, this.world.tileSize);
  }

  getTimeInfo() {
    let totalMinutes = Math.floor(this.timeInSeconds);
    let hour = Math.floor(totalMinutes / 60) % 24;
    let minute = totalMinutes % 60;

    let period = 'day';
    let icon = '☀️';
    if (hour >= 5 && hour < 9) { period = 'morning'; icon = '🌅'; }
    else if (hour >= 9 && hour < 17) { period = 'day'; icon = '☀️'; }
    else if (hour >= 17 && hour < 20) { period = 'evening'; icon = '🌆'; }
    else { period = 'night'; icon = '🌙'; }

    return { hour, minute, period, icon, timeStr: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}` };
  }

  initUI() {
    document.getElementById('sound-toggle').addEventListener('click', (e) => {
      window.AudioSynth.enabled = !window.AudioSynth.enabled;
      e.currentTarget.innerText = window.AudioSynth.enabled ? '🔊 サウンド ON' : '🔇 サウンド OFF';
      if (window.AudioSynth.enabled) window.AudioSynth.play('click');
    });

    document.getElementById('unfollow-btn').addEventListener('click', () => this.unfollowResident());
    document.getElementById('close-inspector').addEventListener('click', () => {
      document.getElementById('inspector-panel').classList.add('hidden');
      this.selectedResident = null;
    });
  }

  updateTimeUI() {
    let t = this.getTimeInfo();
    document.getElementById('clock-display').innerText = t.timeStr;
    document.getElementById('time-icon').innerText = t.icon;
    document.getElementById('weather-text').innerText = t.period === 'night' ? '満天の星空 (完全3D WebGL)' : t.period === 'evening' ? 'きれいな夕焼け (完全3D WebGL)' : '爽やかな晴れ (完全3D WebGL)';
  }

  updateFollowHUD() {
    let hud = document.getElementById('following-hud');
    if (this.threeRenderer.camera.followingResident) {
      hud.classList.remove('hidden');
      document.getElementById('follow-name').innerText = `${this.threeRenderer.camera.followingResident.name} を3Dカメラ追跡中`;
    } else {
      hud.classList.add('hidden');
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.gameApp = new ResidentLifeGame();
});
