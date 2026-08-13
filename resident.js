/**
 * resident.js - Resident AI with Separation Physics (Prevents Overlapping) & 2D Face Texture Buffer
 */

class Resident {
  constructor(id, name, gender, personality, homeHouseId, bodyColor, hairStyle, hairColor) {
    this.id = id;
    this.name = name;
    this.gender = gender;
    this.personality = personality;
    this.homeHouseId = homeHouseId;
    this.bodyColor = bodyColor;
    this.hairStyle = hairStyle;
    this.hairColor = hairColor;

    this.mood = 'ごきげん';
    this.moodIcon = '😊';

    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.speed = 1.2 + Math.random() * 0.4;
    this.direction = 'down';

    this.path = [];
    this.currentPathIndex = 0;

    this.expression = 'normal';
    this.expressionTimer = 0;

    this.speechText = '';
    this.speechTimer = 0;

    this.energy = 80 + Math.random() * 20;
    this.hunger = 70 + Math.random() * 30;
    this.happiness = 80 + Math.random() * 20;
    this.social = 60 + Math.random() * 40;

    this.relationships = {};
    this.partnerId = null;

    this.currentAction = '街でのんびり過ごしている';
    this.thought = '今日もいい日だな～';
    this.activityTimer = 0;
    this.isSleeping = false;
    this.inBed = false;

    this.logs = [];
    this.addLog('生活をスタートしました！');

    // Create dynamic 2D Face Texture Canvas for 3D mapping
    this.faceCanvas = document.createElement('canvas');
    this.faceCanvas.width = 128;
    this.faceCanvas.height = 128;
    this.faceCtx = this.faceCanvas.getContext('2d');
  }

  addLog(text) {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    this.logs.unshift({ time: timeStr, text: text });
    if (this.logs.length > 25) this.logs.pop();
  }

  updateMood() {
    const moods = window.TomodachiDialogues.moods;
    if (this.hunger < 20) { this.mood = 'お腹ペコペコ'; this.moodIcon = '🍚'; }
    else if (this.energy < 20) { this.mood = '眠気全開'; this.moodIcon = '💤'; }
    else if (this.happiness > 90) { this.mood = '最高'; this.moodIcon = '🌟'; }
    else if (this.happiness < 30) { this.mood = '落ち込み'; this.moodIcon = '😞'; }
    else {
      let m = moods[Math.floor(Math.random() * moods.length)];
      this.mood = m.name; this.moodIcon = m.icon;
    }
  }

  setExpression(expr, durationFrames = 200) {
    this.expression = expr;
    this.expressionTimer = durationFrames;
  }

  say(text, durationFrames = 220) {
    this.speechText = text;
    this.speechTimer = durationFrames;
    this.thought = text;
  }

  sayDynamicDialogue(targetResident = null) {
    let text = window.TomodachiDialogues.generateDialogue(this, targetResident);
    this.say(text, 240);
  }

  getRelationship(otherId) {
    if (!this.relationships[otherId]) {
      this.relationships[otherId] = { friendship: 25 + Math.random() * 20, romance: 0, status: 'friend' };
    }
    return this.relationships[otherId];
  }

  getDetailedRelationshipTitle(otherId, otherName) {
    let rel = this.getRelationship(otherId);
    if (rel.status === 'married') return `💍 夫/妻 (人生の伴侶): ${otherName}`;
    if (rel.status === 'couple') return `💕 恋人 (彼氏/彼女): ${otherName}`;
    if (rel.friendship > 85) return `✨ 大親友 (心の友): ${otherName}`;
    if (rel.friendship > 75) return `🤝 親友 (信頼できる味方): ${otherName}`;
    if (rel.friendship > 65) return `☕ 幼馴染 (腐れ縁): ${otherName}`;
    if (rel.romance > 75) return `💘 一方的な片思い中: ${otherName}`;
    return `🌱 ご近所さん (知人): ${otherName}`;
  }

  update(world, timeInfo, residents, addGlobalTicker, playSound) {
    if (this.expressionTimer > 0) {
      this.expressionTimer--;
      if (this.expressionTimer <= 0) this.expression = this.isSleeping ? 'sleeping' : 'normal';
    }

    if (this.speechTimer > 0) {
      this.speechTimer--;
      if (this.speechTimer <= 0) this.speechText = '';
    }

    this.hunger = Math.max(0, this.hunger - 0.012);
    this.energy = Math.max(0, this.isSleeping ? this.energy + 0.14 : this.energy - 0.01);
    this.social = Math.max(0, this.social - 0.008);

    // --- SEPARATION PHYSICS: PREVENT RESIDENTS FROM OVERLAPPING EACH OTHER ---
    for (let other of residents) {
      if (other.id !== this.id && !this.inBed && !other.inBed) {
        let dx = this.x - other.x;
        let dy = this.y - other.y;
        let dist = Math.hypot(dx, dy);
        let minDist = 30.0; // Minimum 30px distance buffer

        if (dist > 0 && dist < minDist) {
          let pushForce = (minDist - dist) * 0.2;
          this.x += (dx / dist) * pushForce;
          this.y += (dy / dist) * pushForce;
        }
      }
    }

    // Path Movement
    if (this.path && this.currentPathIndex < this.path.length) {
      let targetNode = this.path[this.currentPathIndex];
      let targetPxX = targetNode.x * world.tileSize + world.tileSize / 2;
      let targetPxY = targetNode.y * world.tileSize + world.tileSize / 2;

      let dx = targetPxX - this.x;
      let dy = targetPxY - this.y;
      let dist = Math.hypot(dx, dy);

      if (dist < this.speed) {
        this.x = targetPxX;
        this.y = targetPxY;
        this.currentPathIndex++;
      } else {
        this.x += (dx / dist) * this.speed;
        this.y += (dy / dist) * this.speed;
      }

      let currentGridX = Math.floor(this.x / world.tileSize);
      let currentGridY = Math.floor(this.y / world.tileSize);
      if (world.grid[currentGridY] && world.grid[currentGridY][currentGridX] === 2 && currentGridY !== 24) {
        this.triggerPondAccident(world, addGlobalTicker, playSound);
      }

    } else {
      this.activityTimer++;
      if (this.activityTimer > 180) {
        this.activityTimer = 0;
        this.decideNextActivity(world, timeInfo, residents, addGlobalTicker, playSound);
      }
    }

    if (Math.random() < 0.03 && !this.isSleeping) {
      for (let other of residents) {
        if (other.id !== this.id && !other.isSleeping) {
          let dist = Math.hypot(other.x - this.x, other.y - this.y);
          if (dist < 40) {
            this.handleSocialInteraction(other, world, addGlobalTicker, playSound);
            break;
          }
        }
      }
    }

    // Render Face Canvas Buffer for 3D Texture Update
    this.updateFaceTextureBuffer(this.tickCount);
  }

  updateFaceTextureBuffer(tickCount) {
    let fctx = this.faceCtx;
    fctx.clearRect(0, 0, 128, 128);

    // White rounded head box
    fctx.fillStyle = this.expression === 'wet' ? '#e0f2fe' : '#ffffff';
    fctx.beginPath(); fctx.roundRect(8, 8, 112, 112, 24); fctx.fill();
    fctx.strokeStyle = '#000000'; fctx.lineWidth = 8; fctx.stroke();

    // Features
    window.ResidentRenderer.renderVectorFace(fctx, this.expression, 8, 8, tickCount);
  }

  triggerPondAccident(world, addGlobalTicker, playSound) {
    if (this.expression === 'wet') return;
    this.setExpression('wet', 350);
    this.say('冷たぁぁい！池にドボンしちゃった！！💦', 260);
    this.happiness = Math.max(0, this.happiness - 30);
    let logMsg = `${this.name}が足を滑らせて池に落っこちました！ずぶ濡れ涙目に…`;
    this.addLog(logMsg);
    if (addGlobalTicker) addGlobalTicker('💦', logMsg);
    if (playSound) playSound('pop');

    let home = world.houses.find(h => h.id === this.homeHouseId);
    if (home) this.navigateTo(world, home.door.x, home.door.y);
  }

  handleSocialInteraction(other, world, addGlobalTicker, playSound) {
    if (this.expressionTimer > 60) return;

    let rel = this.getRelationship(other.id);
    let otherRel = other.getRelationship(this.id);
    let rnd = Math.random();

    if (rel.romance >= 60 && rel.status === 'crush' && !this.partnerId && !other.partnerId && rnd < 0.3) {
      this.say(`「${other.name}さん、ずっと好きでした！付き合ってください！」`, 240);

      if (rel.romance < 75 || Math.random() < 0.45) {
        other.setExpression('shy', 240);
        other.say(`「ごめんなさい…今は友達のままでいたいな」`, 240);
        this.setExpression('crying', 350);
        setTimeout(() => { this.say(`「えっ…そっか…ううん、伝えて良かった！泣」`, 260); }, 1200);

        let logMsg = `💔 【失恋】${this.name}が${other.name}に告白しましたが、フラれてしまいました…涙`;
        this.addLog(logMsg); other.addLog(logMsg);
        if (addGlobalTicker) addGlobalTicker('💔', logMsg);
        if (playSound) playSound('pop');

        let home = world.houses.find(h => h.id === this.homeHouseId);
        if (home) this.navigateTo(world, home.door.x, home.door.y);
        return;
      } else {
        this.setExpression('in_love', 300); other.setExpression('in_love', 300);
        rel.status = 'couple'; otherRel.status = 'couple';
        this.partnerId = other.id; other.partnerId = this.id;
        other.say(`「はい！私も好きです！よろしくお願いします💕」`, 240);

        let logMsg = `💕 告白成功！${this.name}と${other.name}が恋人カップルになりました！`;
        this.addLog(logMsg); other.addLog(logMsg);
        if (addGlobalTicker) addGlobalTicker('💕', logMsg);
        if (playSound) playSound('happy');
        return;
      }
    }

    if (rel.status === 'couple' && rel.romance >= 85 && rnd < 0.2) {
      this.setExpression('in_love', 350); other.setExpression('in_love', 350);
      rel.status = 'married'; otherRel.status = 'married';
      other.homeHouseId = this.homeHouseId;

      let chapel = world.landmarks.chapel;
      this.navigateTo(world, chapel.target.x, chapel.target.y);
      other.navigateTo(world, chapel.target.x, chapel.target.y);

      this.say(`「${other.name}さん、一生僕と一緒にいてください！」`, 260);
      other.say(`「はい！喜んで！ずっと一緒に幸せになろうね💍」`, 260);

      let logMsg = `💍 祝・結婚！${this.name}と${other.name}が教会で愛を誓い同居スタート！🎉`;
      this.addLog(logMsg); other.addLog(logMsg);
      if (addGlobalTicker) addGlobalTicker('💍', logMsg);
      if (playSound) playSound('happy');
      return;
    }

    this.setExpression('smile', 160); other.setExpression('smile', 160);
    this.sayDynamicDialogue(other);
  }

  decideNextActivity(world, timeInfo, residents, addGlobalTicker, playSound) {
    let hour = timeInfo.hour;
    let home = world.houses.find(h => h.id === this.homeHouseId);

    if (hour >= 21 || hour < 6) {
      if (!this.isSleeping && home) {
        let ts = world.tileSize;
        this.targetX = home.x * ts + 36;
        this.targetY = home.y * ts + 30;
        this.path = [{ x: Math.floor(this.targetX / ts), y: Math.floor(this.targetY / ts) }];
        this.currentAction = 'おうちのベッドで就寝中';
        this.say('すやすや…Zzz…', 300);
        this.isSleeping = true; this.inBed = true;
        this.setExpression('sleeping', 99999);
      }
      return;
    } else {
      this.isSleeping = false; this.inBed = false;
      if (this.expression === 'sleeping') this.setExpression('normal');
    }

    const outdoor = [
      { key: 'park', action: '公園の噴水を眺める', expr: 'smile' },
      { key: 'bench_1', action: 'ベンチで読書', expr: 'smile' },
      { key: 'pond', action: 'アヒル池を観察', expr: 'smile' },
      { key: 'cafe', action: 'カフェで焼きたてパンを味わう', expr: 'eating' },
      { key: 'garden', action: '農園で野菜のお手入れ', expr: 'normal' }
    ];

    let choice = outdoor[Math.floor(Math.random() * outdoor.length)];
    let lm = world.landmarks[choice.key];
    if (lm && (lm.target || lm)) {
      let target = lm.target || lm;
      this.navigateTo(world, target.x, target.y);
      this.currentAction = choice.action;
      this.sayDynamicDialogue();
      if (choice.expr === 'smile') this.setExpression('smile', 180);
    }
  }

  navigateTo(world, tx, ty) {
    let startNode = {
      x: Math.floor(this.x / world.tileSize),
      y: Math.floor(this.y / world.tileSize)
    };
    this.path = world.findPath(startNode.x, startNode.y, tx, ty);
    this.currentPathIndex = 0;
  }

  static createRoster10(houses) {
    const list = [
      { id: 1, name: '太郎', gender: 'male', personality: 'マイペース', house: houses[0], color: '#3b82f6', style: 'short', hColor: '#1e293b' },
      { id: 2, name: '花子', gender: 'female', personality: '天然', house: houses[0], color: '#ec4899', style: 'twintail', hColor: '#78350f' },
      { id: 3, name: '健太', gender: 'male', personality: '情熱家', house: houses[1], color: '#ef4444', style: 'spiky', hColor: '#dc2626' },
      { id: 4, name: 'さくら', gender: 'female', personality: 'ツンデレ', house: houses[1], color: '#f43f5e', style: 'ponytail', hColor: '#b45309' },
      { id: 5, name: '翔太', gender: 'male', personality: 'あほ', house: houses[2], color: '#f97316', style: 'short', hColor: '#1e293b' },
      { id: 6, name: '葵', gender: 'female', personality: 'インテリ', house: houses[2], color: '#8b5cf6', style: 'bob', hColor: '#475569' },
      { id: 7, name: '拓也', gender: 'male', personality: 'クール', house: houses[3], color: '#eab308', style: 'spiky', hColor: '#d97706' },
      { id: 8, name: 'リン', gender: 'female', personality: 'のんびり', house: houses[3], color: '#06b6d4', style: 'bob', hColor: '#1e293b' },
      { id: 9, name: '蓮', gender: 'male', personality: 'ロマンチスト', house: houses[4], color: '#84cc16', style: 'short', hColor: '#1e293b' },
      { id: 10, name: '結衣', gender: 'female', personality: 'お節介', house: houses[5], color: '#a855f7', style: 'ponytail', hColor: '#78350f' }
    ];

    return list.map(item => {
      let r = new Resident(item.id, item.name, item.gender, item.personality, item.house.id, item.color, item.style, item.hColor);
      r.x = item.house.door.x * 32 + 16;
      r.y = item.house.door.y * 32 + 16;
      item.house.residents.push(r);
      return r;
    });
  }
}
