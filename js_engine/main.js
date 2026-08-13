/**
 * main.js - Crisp 2D Canvas Main Game Controller
 */

class ResidentLifeGame {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    this.timeInSeconds = 360; // Start 06:00 AM
    this.tickCount = 0;

    this.world = new World(54, 38, 32);
    this.residents = [];
    this.selectedResident = null;
    this.selectedHouseId = null;

    // 2D Camera Controller (Pan, Zoom, Follow)
    this.camera2D = new window.CameraSystem(this.canvas);
    this.camera2D.centerOn(this.world.width, this.world.height);

    this.eventsManager = new window.EventsManager(this);

    this.initUI();
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.initControls();
    this.initResidents();
    this.startLoop();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    if (this.camera2D) {
      this.camera2D.centerOn(this.world.width, this.world.height);
    }
  }

  initResidents() {
    this.residents = Resident.createRoster10(this.world.houses);
    this.addTickerEvent('🏡', '10人の住民たちが自律生活をスタートしました！ (2D Canvas モード)');
  }

  addTickerEvent(icon, msg) {
    window.InspectorUI.addTickerEvent(icon, msg);
  }

  initControls() {
    let isMouseDown = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    this.canvas.addEventListener('mousedown', (e) => {
      isMouseDown = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      this.camera2D.isDragging = true;
      this.camera2D.dragStartX = e.clientX - this.camera2D.panX;
      this.camera2D.dragStartY = e.clientY - this.camera2D.panY;
    });

    window.addEventListener('mousemove', (e) => {
      if (isMouseDown) {
        this.camera2D.panX = e.clientX - this.camera2D.dragStartX;
        this.camera2D.panY = e.clientY - this.camera2D.dragStartY;
        this.camera2D.followingResident = null;
        this.updateFollowHUD();
      }
    });

    window.addEventListener('mouseup', () => {
      isMouseDown = false;
      this.camera2D.isDragging = false;
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      let zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      let newZoom = Math.max(0.5, Math.min(2.5, this.camera2D.zoom * zoomFactor));
      let mouseX = e.clientX;
      let mouseY = e.clientY;
      this.camera2D.panX = mouseX - (mouseX - this.camera2D.panX) * (newZoom / this.camera2D.zoom);
      this.camera2D.panY = mouseY - (mouseY - this.camera2D.panY) * (newZoom / this.camera2D.zoom);
      this.camera2D.zoom = newZoom;
    }, { passive: false });

    // Click Raycast / 2D Tile Click Selection
    this.canvas.addEventListener('click', (e) => {
      let worldX = (e.clientX - this.camera2D.panX) / this.camera2D.zoom;
      let worldY = (e.clientY - this.camera2D.panY) / this.camera2D.zoom;

      // 1. Resident Selection
      let clickedRes = null;
      for (let r of this.residents) {
        if (Math.hypot(r.x - worldX, r.y - worldY) < 32) {
          clickedRes = r;
          break;
        }
      }

      if (clickedRes) {
        this.selectResident(clickedRes);
        window.AudioSynth.play('click');
        let inHouse = this.world.houses.find(h => h.id === clickedRes.homeHouseId);
        if (inHouse) this.selectedHouseId = inHouse.id;
        return;
      }

      // 2. House Selection (Open/Close Interior Room View)
      let clickedHouse = this.world.getHouseAtPixel(worldX, worldY);
      if (clickedHouse) {
        this.selectedHouseId = this.selectedHouseId === clickedHouse.id ? null : clickedHouse.id;
        window.AudioSynth.play('click');
        this.addTickerEvent('🏠', `${clickedHouse.name} の室内観察モードを${this.selectedHouseId ? '展開しました' : '閉じました'}`);
      } else {
        this.selectedHouseId = null;
      }
    });
  }

  selectResident(resident) {
    this.selectedResident = resident;
    this.camera2D.followingResident = resident;
    window.InspectorUI.updateInspectorUI(resident);
    this.updateFollowHUD();
    document.getElementById('inspector-panel').classList.remove('hidden');
  }

  unfollowResident() {
    this.camera2D.followingResident = null;
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

    if (this.camera2D) {
      this.camera2D.updateFollow();
    }

    if (this.selectedResident && !document.getElementById('inspector-panel').classList.contains('hidden')) {
      window.InspectorUI.updateLiveValues(this.selectedResident, this.residents);
    }

    this.updateTimeUI();
  }

  render() {
    let timeInfo = this.getTimeInfo();

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.translate(this.camera2D.panX, this.camera2D.panY);
    this.ctx.scale(this.camera2D.zoom, this.camera2D.zoom);

    // 1. World Terrain & Large Houses Interior
    window.WorldRenderer.render(this.ctx, this.world, timeInfo.period, this.tickCount, this.selectedHouseId);

    // 2. Vector Residents & Expressions & Speech Bubbles
    let sorted = [...this.residents].sort((a, b) => a.y - b.y);
    for (let r of sorted) {
      window.ResidentRenderer.render(this.ctx, r, this.tickCount);

      if (this.selectedResident && r.id === this.selectedResident.id) {
        this.ctx.strokeStyle = '#38bdf8';
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();
        this.ctx.ellipse(r.x, r.y + 14, 16, 8, 0, 0, Math.PI * 2);
        this.ctx.stroke();
      }
    }

    // 3. Time Lighting Overlay
    this.renderLightingOverlay2D(timeInfo.period);

    this.ctx.restore();
  }

  renderLightingOverlay2D(period) {
    let overlayColor = null;
    if (period === 'morning') overlayColor = 'rgba(251, 146, 60, 0.12)';
    else if (period === 'evening') overlayColor = 'rgba(249, 115, 22, 0.22)';
    else if (period === 'night') overlayColor = 'rgba(15, 23, 42, 0.55)';

    if (overlayColor) {
      this.ctx.fillStyle = overlayColor;
      this.ctx.fillRect(0, 0, this.world.width, this.world.height);
    }
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
    document.getElementById('weather-text').innerText = t.period === 'night' ? '満天の星空 (2D Canvas)' : t.period === 'evening' ? 'きれいな夕焼け (2D Canvas)' : '爽やかな晴れ (2D Canvas)';
  }

  updateFollowHUD() {
    let hud = document.getElementById('following-hud');
    if (this.camera2D.followingResident) {
      hud.classList.remove('hidden');
      document.getElementById('follow-name').innerText = `${this.camera2D.followingResident.name} をカメラ追跡中`;
    } else {
      hud.classList.add('hidden');
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.gameApp = new ResidentLifeGame();
});
