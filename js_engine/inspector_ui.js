/**
 * inspector_ui.js - Inspector Modal UI Controller with 20+ Moods Badge & 50+ Relationship Titles Display
 */

window.InspectorUI = {
  updateInspectorUI(selectedResident) {
    if (!selectedResident) return;
    document.getElementById('inspector-name').innerText = selectedResident.name;
    document.getElementById('inspector-personality').innerText = `機嫌: ${selectedResident.moodIcon} ${selectedResident.mood} | 性格: ${selectedResident.personality}`;

    let avatarCanvas = document.getElementById('avatar-canvas');
    let actx = avatarCanvas.getContext('2d');
    actx.clearRect(0, 0, 40, 40);
    actx.save();
    actx.translate(20, 32);
    window.ResidentRenderer.render(actx, selectedResident, 0);
    actx.restore();
  },

  updateLiveValues(selectedResident, residents) {
    if (!selectedResident) return;
    document.getElementById('inspector-thought').innerText = selectedResident.thought;
    document.getElementById('inspector-action').innerText = `現在の機嫌: ${selectedResident.moodIcon} ${selectedResident.mood} | 行動: ${selectedResident.currentAction}`;

    document.getElementById('meter-hunger').style.width = `${selectedResident.hunger}%`;
    document.getElementById('meter-energy').style.width = `${selectedResident.energy}%`;
    document.getElementById('meter-happiness').style.width = `${selectedResident.happiness}%`;
    document.getElementById('meter-social').style.width = `${selectedResident.social}%`;

    // 50+ Relationship Titles Summary
    let relSummaries = [];
    for (let other of residents) {
      if (other.id !== selectedResident.id) {
        let title = selectedResident.getDetailedRelationshipTitle(other.id, other.name);
        relSummaries.push(title);
      }
    }
    document.getElementById('inspector-relationship').innerText = relSummaries.slice(0, 3).join(' | ');

    let logContainer = document.getElementById('inspector-logs');
    logContainer.innerHTML = selectedResident.logs.map(l => `<div class="log-item"><span class="log-time">${l.time}</span>${l.text}</div>`).join('');
  },

  addTickerEvent(icon, text) {
    let ticker = document.getElementById('event-ticker');
    if (!ticker) return;
    let item = document.createElement('div');
    item.className = 'ticker-item';
    item.innerHTML = `<span class="ticker-icon">${icon}</span><span>${text}</span>`;
    ticker.prepend(item);

    if (ticker.children.length > 20) {
      ticker.removeChild(ticker.lastChild);
    }
  }
};
