/**
 * events_manager.js - Beach Resort, BBQ Party, Love Letter Confession & Memorial Funeral Events
 */

class EventsManager {
  constructor(game) {
    this.game = game;
  }

  triggerRandomTownGossip() {
    if (this.game.residents.length < 2) return;
    let r1 = this.game.residents[Math.floor(Math.random() * this.game.residents.length)];
    let r2 = this.game.residents[Math.floor(Math.random() * this.game.residents.length)];
    if (r1.id === r2.id) return;

    let gossipMsg = `【噂話】${r1.name}が${r2.name}にナイショでプレゼントを探しているらしい…？`;
    r1.say("内緒なんだけどね…ふふふ♪", 240);
    this.game.addTickerEvent('🗣️', gossipMsg);
  }

  // 🌊 1. Beach Resort Swimming & Watermelon Event
  triggerBeachEvent() {
    let beachLm = this.game.world.landmarks.beach;
    if (!beachLm) return;

    let r1 = this.game.residents[Math.floor(Math.random() * this.game.residents.length)];
    let r2 = this.game.residents[Math.floor(Math.random() * this.game.residents.length)];

    r1.navigateTo(this.game.world, beachLm.target.x, beachLm.target.y);
    r2.navigateTo(this.game.world, beachLm.target.x + 2, beachLm.target.y);

    r1.setExpression('smile', 300);
    r2.setExpression('smile', 300);

    r1.say("🌊 渚のリゾートで海水浴＆スイカ割り大会だぁ～！🍉", 280);
    r2.say("冷たい海風が最高～！波の音が心地いいね♪", 280);

    let msg = `🏖️ 【海水浴リゾート】${r1.name}と${r2.name}が渚のビーチで海水浴＆スイカ割りを満喫中！`;
    this.game.addTickerEvent('🌊', msg);
    window.AudioSynth.play('happy');
  }

  // 🍖 2. Forest BBQ Party Event
  triggerBBQEvent() {
    let campLm = this.game.world.landmarks.camp;
    if (!campLm) return;

    let attendees = this.game.residents.slice(0, 4);
    attendees.forEach((r, idx) => {
      r.navigateTo(this.game.world, campLm.target.x + (idx % 2) * 2, campLm.target.y + Math.floor(idx / 2) * 2);
      r.setExpression('smile', 300);
      r.hunger = 100;
    });

    let chef = attendees[0];
    if (chef) chef.say("🍖 ジューシーな特選ステーキと野菜串が焼きあがったよー！いただきます！", 280);

    let msg = `🥩 【BBQパーティー】森林キャンプ場で${attendees.map(a => a.name).join('・')}たちが賑やかバーベキューを開催中！`;
    this.game.addTickerEvent('🍖', msg);
    window.AudioSynth.play('happy');
  }

  // ✉️ 3. Love Letter Confession Event
  triggerLoveLetterEvent() {
    if (this.game.residents.length < 2) return;
    let sender = this.game.residents[Math.floor(Math.random() * this.game.residents.length)];
    let target = this.game.residents.find(r => r.id !== sender.id && r.gender !== sender.gender);
    if (!target) return;

    sender.setExpression('shy', 300);
    sender.say(`「${target.name}さんのポストに、想いを込めたピンクのラブレターを入れちゃった…！照」`, 280);

    setTimeout(() => {
      target.setExpression('shy', 300);
      target.say(`「えっ…！？${sender.name}さんからのラブレター…！？胸がドキドキする…💕」`, 280);
      let rel = sender.getRelationship(target.id);
      rel.romance = Math.min(100, rel.romance + 25);
    }, 1500);

    let msg = `✉️ 【切ない恋文】${sender.name}が${target.name}へ秘密のピンクのラブレターを送りました…！💕`;
    this.game.addTickerEvent('✉️', msg);
    window.AudioSynth.play('happy');
  }

  // 🪦 4. Super Rare Memorial Funeral Event (超超稀な天国お見送り＆お葬式)
  triggerDeathAndFuneralEvent() {
    // Ultra Rare (Triggered only when specifically called or ultra rare chance)
    if (this.game.residents.length <= 4) return; // Keep minimum population

    let deceased = this.game.residents[Math.floor(Math.random() * this.game.residents.length)];
    let cemeteryLm = this.game.world.landmarks.cemetery;

    let msg = `🪦 【超稀イベント】天寿を全うした${deceased.name}のメモリアルお別れ会・お葬式が霊園で執り行われました。`;
    this.game.addTickerEvent('🪦', msg);
    window.AudioSynth.play('pop');

    // Friends gather at Cemetery
    this.game.residents.forEach(r => {
      if (r.id !== deceased.id) {
        r.navigateTo(this.game.world, cemeteryLm.target.x + Math.floor(Math.random() * 4), cemeteryLm.target.y + Math.floor(Math.random() * 4));
        r.setExpression('crying', 400);
        r.say(`「${deceased.name}さん、天国でも僕たちを見守っていてね…ありがとう」`, 320);
        r.addMemory('memorial_sad', `${deceased.name}のお別れ会の哀しみ`);
      }
    });

    // Remove deceased resident gracefully and respawn a new generation resident!
    setTimeout(() => {
      this.game.residents = this.game.residents.filter(r => r.id !== deceased.id);
      this.game.selectedResident = null;

      // Respawn new generation young resident!
      let newId = Date.now() % 10000;
      let newName = deceased.gender === 'male' ? '大翔' : '未来';
      let home = this.game.world.houses[0];
      let newRes = new Resident(newId, newName, deceased.gender, '天然', home.id, '#ec4899', 'short', '#1e293b');
      newRes.x = home.door.x * 32 + 16;
      newRes.y = home.door.y * 32 + 16;
      this.game.residents.push(newRes);

      let respawnMsg = `🌱 【新しい生命】新住民の${newName}が街の仲間入りを果たしました！`;
      this.game.addTickerEvent('✨', respawnMsg);
    }, 4000);
  }

  triggerConstructionEvent() {
    let house = this.game.world.houses[Math.floor(Math.random() * this.game.world.houses.length)];
    if (house.status === 'normal') {
      house.status = 'under_construction';
      this.game.addTickerEvent('🏗️', `【大イベント】${house.name} の解体リフォーム工事がスタート！`);
      window.AudioSynth.play('pop');

      setTimeout(() => {
        house.status = 'normal';
        this.game.addTickerEvent('🎉', `【新築完成！】ピカピカの大型住宅 ${house.name} が完成しました！`);
        window.AudioSynth.play('happy');
      }, 12000);
    }
  }

  triggerMakeoverEvent() {
    if (this.game.residents.length === 0) return;
    let resident = this.game.residents[Math.floor(Math.random() * this.game.residents.length)];
    resident.applyMakeover((icon, text) => this.game.addTickerEvent(icon, text));
    window.AudioSynth.play('happy');
  }
}

window.EventsManager = EventsManager;
