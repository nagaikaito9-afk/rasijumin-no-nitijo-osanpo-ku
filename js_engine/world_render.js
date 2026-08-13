/**
 * world_render.js - World Grid, Terrain, Large Houses & Detailed Interior Room Renderer
 */

window.WorldRenderer = {
  render(ctx, world, timeOfDay, tickCount, selectedHouseId) {
    const ts = world.tileSize;

    // 1. Terrain Grid
    for (let r = 0; r < world.rows; r++) {
      for (let c = 0; c < world.cols; c++) {
        let x = c * ts;
        let y = r * ts;
        let tile = world.grid[r][c];

        if (tile === 0) {
          ctx.fillStyle = (r + c) % 2 === 0 ? '#48bb78' : '#38a169';
          ctx.fillRect(x, y, ts, ts);
        } else if (tile === 1) {
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(x, y, ts, ts);
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 2, y + 2, ts - 4, ts - 4);
        } else if (tile === 2) {
          let wave = Math.sin(tickCount * 0.05 + c + r) * 2;
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(x, y, ts, ts);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fillRect(x + 4 + wave, y + 8, ts - 12, 3);
        }
      }
    }

    // Wooden Bridge
    for (let c = 16; c <= 21; c++) {
      ctx.fillStyle = '#78350f'; ctx.fillRect(c * ts, 24 * ts + 4, ts, ts - 8);
      ctx.strokeStyle = '#451a03'; ctx.strokeRect(c * ts, 24 * ts + 4, ts, ts - 8);
    }

    // Swimming Duck
    let duckX = 18 * ts + Math.cos(tickCount * 0.03) * 35;
    let duckY = 25 * ts + Math.sin(tickCount * 0.03) * 20;
    ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(duckX, duckY, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f97316'; ctx.fillRect(duckX + 5, duckY - 2, 4, 3);

    // 2. Large Houses
    for (let h of world.houses) {
      let isOpened = h.id === selectedHouseId;
      this.renderLargeHouse(ctx, h, isOpened, timeOfDay, tickCount, ts);
    }

    // 3. Landmarks & Decorations
    world.renderLandmarks(ctx, timeOfDay, tickCount);
  },

  renderLargeHouse(ctx, h, openInterior, timeOfDay, tickCount, ts) {
    let hx = h.x * ts;
    let hy = h.y * ts;
    let hw = h.w * ts;
    let hh = h.h * ts;

    if (h.status === 'under_construction') {
      ctx.fillStyle = '#d97706'; ctx.fillRect(hx, hy, hw, hh);
      ctx.strokeStyle = '#451a03'; ctx.lineWidth = 3; ctx.strokeRect(hx, hy, hw, hh);
      ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + hw, hy + hh); ctx.moveTo(hx + hw, hy); ctx.lineTo(hx, hy + hh); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 12px sans-serif'; ctx.fillText('🏗️ 新築リフォーム工事中...', hx + 12, hy + hh / 2);
      return;
    }

    if (openInterior) {
      // --- INTERIOR ROOM VIEW ---
      ctx.fillStyle = '#fef3c7'; ctx.fillRect(hx, hy, hw, hh);
      ctx.strokeStyle = '#d97706'; ctx.lineWidth = 3; ctx.strokeRect(hx, hy, hw, hh);

      // Rug
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath(); ctx.ellipse(hx + hw / 2, hy + hh / 2 + 10, 45, 24, 0, 0, Math.PI * 2); ctx.fill();

      // Bed 🛌
      ctx.fillStyle = '#cbd5e1'; ctx.fillRect(hx + 10, hy + 10, 52, 38);
      ctx.fillStyle = h.color; ctx.fillRect(hx + 10, hy + 22, 52, 26);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(hx + 14, hy + 12, 18, 10); ctx.fillRect(hx + 38, hy + 12, 18, 10);

      // Fireplace 🔥
      ctx.fillStyle = '#78350f'; ctx.fillRect(hx + hw - 48, hy + 6, 40, 28);
      ctx.fillStyle = '#451a03'; ctx.fillRect(hx + hw - 40, hy + 14, 24, 20);
      let fSize = 6 + Math.sin(tickCount * 0.3) * 3;
      ctx.fillStyle = '#ea580c'; ctx.beginPath(); ctx.arc(hx + hw - 28, hy + 26, fSize, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(hx + hw - 28, hy + 26, fSize * 0.6, 0, Math.PI * 2); ctx.fill();

      // Kitchen 🍳
      ctx.fillStyle = '#475569'; ctx.fillRect(hx + 10, hy + hh - 45, 48, 35);
      ctx.fillStyle = '#0f172a'; ctx.fillRect(hx + 14, hy + hh - 40, 20, 16);
      ctx.fillStyle = '#94a3b8'; ctx.fillRect(hx + 18, hy + hh - 36, 12, 10);
      let sY = hy + hh - 42 - ((tickCount * 0.3) % 10);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; ctx.beginPath(); ctx.arc(hx + 24, sY, 3, 0, Math.PI * 2); ctx.fill();

      // Dining 🍽️
      ctx.fillStyle = '#92400e'; ctx.fillRect(hx + hw - 56, hy + hh - 48, 46, 32);

      // Sofa & TV 📺
      ctx.fillStyle = '#2563eb'; ctx.fillRect(hx + hw / 2 - 25, hy + hh / 2 - 25, 50, 20);
      ctx.fillStyle = '#0f172a'; ctx.fillRect(hx + hw / 2 - 20, hy + 8, 40, 16);
      ctx.fillStyle = tickCount % 20 < 10 ? '#38bdf8' : '#e11d48'; ctx.fillRect(hx + hw / 2 - 18, hy + 10, 36, 12);

      // Open Roof Tag
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'; ctx.fillRect(hx, hy - 20, 140, 18);
      ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`🔍 室内観察: ${h.name}`, hx + 6, hy - 6);

    } else {
      // --- EXTERIOR HOUSE VIEW ---
      ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(hx + 6, hy + 6, hw, hh);
      ctx.fillStyle = '#f8fafc'; ctx.fillRect(hx, hy + 20, hw, hh - 20);

      ctx.fillStyle = h.color;
      ctx.beginPath(); ctx.moveTo(hx - 10, hy + 22); ctx.lineTo(hx + hw / 2, hy - 18); ctx.lineTo(hx + hw + 10, hy + 22); ctx.closePath(); ctx.fill();

      let dx = h.door.x * ts;
      ctx.fillStyle = '#78350f'; ctx.fillRect(dx - 10, hy + hh - 28, 20, 28);

      let isNight = timeOfDay === 'night' || timeOfDay === 'evening';
      ctx.fillStyle = isNight ? '#fef08a' : '#93c5fd';
      ctx.fillRect(hx + 14, hy + 32, 22, 20); ctx.fillRect(hx + hw - 36, hy + 32, 22, 20);
    }
  }
};
