/**
 * resident.js - Resident AI with Emotional Memory Trauma System & God's Water Prank Reaction
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

    // Grab & Carry Physics
    this.isBeingCarried = false;

    // Emotional Memory System (Trauma, Grudges, Memories)
    this.memories = []; // [{ key: 'trauma_water', title: '...', timer: 1800 }]

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

  addMemory(key, title, durationFrames = 2400) {
    this.memories = this.memories.filter(m => m.key !== key);
    this.memories.unshift({ key: key, title: title, timer: durationFrames });
    if (this.memories.length > 6) this.memories.pop();
  }

  getMemory(key) {
    return this.memories.find(m => m.key === key && m.timer > 0);
  }

  // --- MOUSE GRAB & DROP WITH WATER PRANK REACTION ---
  pickup() {
    this.isBeingCarried = true;
    this.setExpression('surprised', 9999);
    this.say('わわわっ！？神様の手で持ち上げられたぁぁ！？💦', 300);
    this.currentAction = '神様の手で空中を持ち運ばれ中 🖐️';
    this.addLog('神様の手につままれて空中へピックアップされました！');
  }

  dropAt(tx, ty, world, addGlobalTicker) {
    this.isBeingCarried = false;
    this.x = tx;
    this.y = ty;
    this.path = [];
    this.currentPathIndex = 0;

    let gx = Math.floor(tx / world.tileSize);
    let gy = Math.floor(ty / world.tileSize);
    let tileType = (world.grid[gy] && world.grid[gy][gx]) ? world.grid[gy][gx] : 0;

    // CHECK IF DROPPED INTO WATER (Pond, Ocean, Lake) -> GOD'S PRANK REACTION!
    if (tileType === 2 && !(gy === 46 && gx >= 48 && gx <= 62)) {
      this.setExpression('wet', 450);
      this.mood = 'シクシク'; this.moodIcon = '😭';
      this.happiness = Math.max(0, this.happiness - 40);

      const prankLines = [
        "ひやぁぁぁ！神様の手で意地悪された～！！水の中に落とされたよ～！😭💦",
        "意地悪な神様～！お洋服がびしょ濡れになっちゃったよぉ(涙)",
        "バシャーン！神様の意地悪ドロップだぁ～！冷たいよ～！💦"
      ];
      let line = prankLines[Math.floor(Math.random() * prankLines.length)];
      this.say(line, 320);

      let logMsg = `😭 【神様の意地悪】${this.name}が神様の手で水の中に投げ落とされ、ずぶ濡れ大泣きになりました！`;
      this.addLog(logMsg);
      if (addGlobalTicker) addGlobalTicker('💦', logMsg);

      this.addMemory('trauma_water', '神様の手で水の中に落とされたトラウマ');
      this.currentAction = '神様の意地悪で水に落とされ涙目になっている';

      let home = world.houses.find(h => h.id === this.homeHouseId);
      if (home) this.navigateTo(world, home.door.x, home.door.y);
      return;
    }

    // Normal Ground Drop
    this.setExpression('smile', 250);
    this.say('着地～！神様、運んでくれてありがとう！', 260);
    this.addMemory('god_carried', '神様の手で空を飛んだ思い出');
    this.currentAction = '無事着地して周囲を見渡している';
    this.addLog(`新しい場所 (${Math.floor(tx)}, ${Math.floor(ty)}) に安全着地しました！`);
  }

  applyMakeover(addGlobalTicker) {
    const hairStyles = ['short', 'twintail', 'spiky', 'ponytail', 'bob', 'afro'];
    const hairColors = ['#1e293b', '#dc2626', '#d97706', '#eab308', '#059669', '#0284c7', '#7c3aed', '#db2777'];
    const bodyColors = ['#3b82f6', '#ec4899', '#ef4444', '#f97316', '#8b5cf6', '#06b6d4', '#84cc16'];

    let oldStyle = this.hairStyle;
    this.hairStyle = hairStyles[Math.floor(Math.random() * hairStyles.length)];
    this.hairColor = hairColors[Math.floor(Math.random() * hairColors.length)];
    this.bodyColor = bodyColors[Math.floor(Math.random() * bodyColors.length)];

    this.setExpression('smile', 300);
    this.mood = 'ウキウキ'; this.moodIcon = '✨';
    this.say('✂️ 美容室で大イメチェン！新しい私、どうかな？✨', 280);

    let msg = `✂️ 【イメチェン】${this.name}が髪型を${oldStyle}から「${this.hairStyle}」に大満足のイメチェン！`;
    this.addLog(msg);
    if (addGlobalTicker) addGlobalTicker('✂️', msg);
  }

  update(world, timeInfo, residents, addGlobalTicker, playSound) {
    if (this.isBeingCarried) return;

    // Decay Memory Timers
    for (let m of this.memories) {
      if (m.timer > 0) m.timer--;
    }

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

    // Separation Force
    for (let other of residents) {
      if (other.id !== this.id && !this.inBed && !other.inBed && !this.isBeingCarried && !other.isBeingCarried) {
        let dx = this.x - other.x;
        let dy = this.y - other.y;
        let dist = Math.hypot(dx, dy);
        let minDist = 32.0;

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
    } else {
      this.activityTimer++;
      if (this.activityTimer > 180) {
        this.activityTimer = 0;
        this.decideNextActivity(world, timeInfo, residents, addGlobalTicker, playSound);
      }
    }
  }

  decideNextActivity(world, timeInfo, residents, addGlobalTicker, playSound) {
    // Check Emotional Trauma / Memory Reactions!
    let waterTrauma = this.getMemory('trauma_water');
    if (waterTrauma && Math.random() < 0.4) {
      this.setExpression('wet', 200);
      this.say('水がトラウマになっちゃった…まだブルブル震えちゃうよ💦', 240);
      return;
    }

    let heartbreak = this.getMemory('heartbreak');
    if (heartbreak && Math.random() < 0.4) {
      this.setExpression('crying', 200);
      this.say('振られた傷がまだ痛むんだ…シクシク(涙)', 240);
      return;
    }

    const outdoor = [
      { key: 'park', action: '公園の噴水を眺める', expr: 'smile' },
      { key: 'beach', action: '🌊 渚のリゾートで海水浴＆日光浴', expr: 'smile' },
      { key: 'camp', action: '🌲 キャンプ場でバーベキュー準備', expr: 'smile' },
      { key: 'lake', action: '⛵ 碧の湖畔でスワンボートを鑑賞', expr: 'normal' },
      { key: 'cemetery', action: '🌸 桜並木メモリアル霊園でお祈り 🪦', expr: 'normal' }
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

  sayDynamicDialogue(targetResident = null) {
    let relTitle = targetResident ? this.getDetailedRelationshipTitle(targetResident.id, targetResident.name) : null;
    let text = window.TomodachiDialogues.generateDialogue(this, targetResident, relTitle);
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
    return `🌱 ご近所さん (知人): ${otherName}`;
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
