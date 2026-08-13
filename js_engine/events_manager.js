/**
 * events_manager.js - Town Events, Gossip, Construction, Salon Makeovers & Romance
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
