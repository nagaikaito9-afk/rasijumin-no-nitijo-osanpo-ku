/**
 * game.js - Main Game Controller (10 Residents, House Renovation/Demolition/Construction Events)
 */

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    this.zoom = 0.95;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;

    this.speedMultiplier = 1;
    this.isPaused = false;
    this.timeInSeconds = 360;
    this.tickCount = 0;

    this.world = new World(54, 38, 32);
    this.residents = [];
    this.followingResident = null;
    this.selectedResident = null;
    this.selectedHouseId = null;

    this.soundEnabled = true;
    this.audioCtx = null;

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
    if (this.panX === 0 && this.panY === 0) {
      this.panX = (this.canvas.width - this.world.width * this.zoom) / 2;
      this.panY = (this.canvas.height - this.world.height * this.zoom) / 2;
    }
  }

  initResidents() {
    this.residents = Resident.createRoster10(this.world.houses);
    this.addTickerEvent('🏡', '10人の住民たちが街での本格的な生活をスタートしました！');
  }

  playSound(type) {
    if (!this.soundEnabled) return;
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain); gain.connect(this.audioCtx.destination);
      let now = this.audioCtx.currentTime;

      if (type === 'click') {
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
        gain.gain.setValueAtTime(0.15, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        osc.start(now); osc.stop(now + 0.08);
      } else if (type === 'happy') {
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        osc.frequency.setValueAtTime(783.99, now + 0.16);
        gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now); osc.stop(now + 0.25);
      } else if (type === 'pop') {
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.05);
        gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
        osc.start(now); osc.stop(now + 0.05);
      }
    } catch (e) {}
  }

  initControls() {
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.dragStartX = e.clientX - this.panX;
      this.dragStartY = e.clientY - this.panY;
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        this.panX = e.clientX - this.dragStartX;
        this.panY = e.clientY - this.dragStartY;
        this.followingResident = null;
        this.updateFollowHUD();
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      let zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      let newZoom = Math.max(0.5, Math.min(2.5, this.zoom * zoomFactor));

      let mouseX = e.clientX;
      let mouseY = e.clientY;
      this.panX = mouseX - (mouseX - this.panX) * (newZoom / this.zoom);
      this.panY = mouseY - (mouseY - this.panY) * (newZoom / this.zoom);
      this.zoom = newZoom;
    }, { passive: false });

    // Click Detection
    this.canvas.addEventListener('click', (e) => {
      if (Math.hypot(e.clientX - (this.dragStartX + this.panX), e.clientY - (this.dragStartY + this.panY)) > 5) return;

      let worldX = (e.clientX - this.panX) / this.zoom;
      let worldY = (e.clientY - this.panY) / this.zoom;

      // 1. Resident Click
      let clickedRes = null;
      for (let r of this.residents) {
        if (Math.hypot(r.x - worldX, r.y - worldY) < 24) {
          clickedRes = r;
          break;
        }
      }

      if (clickedRes) {
        this.selectResident(clickedRes);
        this.playSound('click');
        let inHouse = this.world.houses.find(h => h.id === clickedRes.homeHouseId);
        if (inHouse) this.selectedHouseId = inHouse.id;
        return;
      }

      // 2. House Click (Toggle Interior View)
      let clickedHouse = this.world.getHouseAtPixel(worldX, worldY);
      if (clickedHouse) {
        this.selectedHouseId = this.selectedHouseId === clickedHouse.id ? null : clickedHouse.id;
        this.playSound('click');
        this.addTickerEvent('🏠', `${clickedHouse.name} の室内観察モードを${this.selectedHouseId ? '展開しました' : '閉じました'}`);
      } else {
        this.selectedHouseId = null;
      }
    });
  }

  selectResident(resident) {
    this.selectedResident = resident;
    this.followingResident = resident;
    this.updateInspectorUI();
    this.updateFollowHUD();
    document.getElementById('inspector-panel').classList.remove('hidden');
  }

  unfollowResident() {
    this.followingResident = null;
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

    if (!this.isPaused) {
      this.timeInSeconds += (1 / 60) * this.speedMultiplier;
      if (this.timeInSeconds >= 1440) this.timeInSeconds %= 1440;

      let timeInfo = this.getTimeInfo();

      for (let r of this.residents) {
        r.update(this.world, timeInfo, this.residents, (icon, msg) => this.addTickerEvent(icon, msg), (type) => this.playSound(type));
      }

      // Trigger Periodic House Demolition & Reconstruction Event!
      if (this.tickCount % 2200 === 0) {
        this.triggerHouseRenovationEvent();
      }
    }

    if (this.followingResident) {
      let targetPanX = this.canvas.width / 2 - this.followingResident.x * this.zoom;
      let targetPanY = this.canvas.height / 2 - this.followingResident.y * this.zoom;
      this.panX += (targetPanX - this.panX) * 0.1;
      this.panY += (targetPanY - this.panY) * 0.1;
    }

    if (this.selectedResident && !document.getElementById('inspector-panel').classList.contains('hidden')) {
      this.updateInspectorLiveValues();
    }

    this.updateTimeUI();
  }

  triggerHouseRenovationEvent() {
    let house = this.world.houses[Math.floor(Math.random() * this.world.houses.length)];
    if (house.status === 'normal') {
      house.status = 'under_construction';
      this.addTickerEvent('🏗️', `【街の大イベント】${house.name} の解体＆新築リフォーム工事がスタートしました！`);
      this.playSound('pop');

      // Finish construction after 500 frames
      setTimeout(() => {
        house.status = 'normal';
        this.addTickerEvent('🎉', `【新築完成！】ピカピカの大型住宅 ${house.name} が完成しました！`);
        this.playSound('happy');
      }, 10000);
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.translate(this.panX, this.panY);
    this.ctx.scale(this.zoom, this.zoom);

    let timeInfo = this.getTimeInfo();
    this.world.render(this.ctx, timeInfo.period, this.tickCount, this.selectedHouseId);

    let sorted = [...this.residents].sort((a, b) => a.y - b.y);
    for (let r of sorted) {
      r.render(this.ctx, this.tickCount);
      if (this.selectedResident && r.id === this.selectedResident.id) {
        this.ctx.strokeStyle = '#38bdf8';
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();
        this.ctx.ellipse(r.x, r.y + 14, 16, 8, 0, 0, Math.PI * 2);
        this.ctx.stroke();
      }
    }

    this.renderLightingOverlay(timeInfo.period);
    this.ctx.restore();
  }

  renderLightingOverlay(period) {
    let overlayColor = null;
    if (period === 'morning') overlayColor = 'rgba(251, 146, 60, 0.12)';
    else if (period === 'evening') overlayColor = 'rgba(249, 115, 22, 0.22)';
    else if (period === 'night') overlayColor = 'rgba(15, 23, 42, 0.6)';

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
    else if (hour >= 17 && hour < 20) { period = 'evening'; icon = '<ctrl42>'; }
    else { period = 'night'; icon = '🌙'; }

    return { hour, minute, period, icon, timeStr: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}` };
  }

  initUI() {
    document.querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        let speed = parseInt(e.currentTarget.dataset.speed);
        this.speedMultiplier = speed;
        this.isPaused = speed === 0;
        this.playSound('click');
      });
    });

    document.getElementById('sound-toggle').addEventListener('click', (e) => {
      this.soundEnabled = !this.soundEnabled;
      e.currentTarget.innerText = this.soundEnabled ? '🔊 サウンド ON' : '🔇 サウンド OFF';
      if (this.soundEnabled) this.playSound('click');
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
    document.getElementById('weather-text').innerText = t.period === 'night' ? '満天の星空' : t.period === 'evening' ? 'きれいな夕焼け' : '爽やかな晴れ';
  }

  updateFollowHUD() {
    let hud = document.getElementById('following-hud');
    if (this.followingResident) {
      hud.classList.remove('hidden');
      document.getElementById('follow-name').innerText = `${this.followingResident.name} をカメラ追跡中`;
    } else {
      hud.classList.add('hidden');
    }
  }

  updateInspectorUI() {
    if (!this.selectedResident) return;
    let r = this.selectedResident;
    document.getElementById('inspector-name').innerText = r.name;
    document.getElementById('inspector-personality').innerText = `性別: ${r.gender === 'female' ? '女性' : '男性'} | 性格: ${r.personality}`;

    let avatarCanvas = document.getElementById('avatar-canvas');
    let actx = avatarCanvas.getContext('2d');
    actx.clearRect(0, 0, 40, 40);
    actx.save();
    actx.translate(20, 32);
    r.render(actx, 0);
    actx.restore();
  }

  updateInspectorLiveValues() {
    let r = this.selectedResident;
    document.getElementById('inspector-thought').innerText = r.thought;
    document.getElementById('inspector-action').innerText = `現在の行動: ${r.currentAction}`;

    document.getElementById('meter-hunger').style.width = `${r.hunger}%`;
    document.getElementById('meter-energy').style.width = `${r.energy}%`;
    document.getElementById('meter-happiness').style.width = `${r.happiness}%`;
    document.getElementById('meter-social').style.width = `${r.social}%`;

    let partnerInfo = 'パートナーなし (独身)';
    if (r.partnerId) {
      let partner = this.residents.find(res => res.id === r.partnerId);
      if (partner) {
        let statusText = r.getRelationship(r.partnerId).status === 'married' ? '💍 配偶者 (同居中)' : '💕 恋人';
        partnerInfo = `${statusText}: ${partner.name}`;
      }
    }
    document.getElementById('inspector-relationship').innerText = partnerInfo;

    let logContainer = document.getElementById('inspector-logs');
    logContainer.innerHTML = r.logs.map(l => `<div class="log-item"><span class="log-time">${l.time}</span>${l.text}</div>`).join('');
  }

  addTickerEvent(icon, text) {
    let ticker = document.getElementById('event-ticker');
    let item = document.createElement('div');
    item.className = 'ticker-item';
    item.innerHTML = `<span class="ticker-icon">${icon}</span><span>${text}</span>`;
    ticker.prepend(item);

    if (ticker.children.length > 20) {
      ticker.removeChild(ticker.lastChild);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.gameApp = new Game();
});
