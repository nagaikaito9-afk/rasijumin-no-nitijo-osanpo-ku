/**
 * world_render.js - 160x120 Massive Map Renderer (Ocean, Sand Beach, Lake, BBQ Camp, Cemetery)
 */

window.WorldRenderer = {
  render(ctx, world, timeOfDay, tickCount, selectedHouseId) {
    const ts = world.tileSize;

    // Viewport Clipping Bounds Optimization
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
          ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1; ctx.strokeRect(x + 2, y + 2, ts - 4, ts - 4);
        } else if (tile === 2) {
          // Ocean & Lake Waves
          let wave = Math.sin(tickCount * 0.05 + c + r) * 2;
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(x, y, ts, ts);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.fillRect(x + 4 + wave, y + 8, ts - 12, 3);
        } else if (tile === 3) {
          // Sand Beach
          ctx.fillStyle = '#fde047';
          ctx.fillRect(x, y, ts, ts);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(x + 4, y + 4, 3, 3);
        }
      }
    }

    // Wooden Bridges
    for (let c = 48; c <= 62; c++) {
      ctx.fillStyle = '#78350f'; ctx.fillRect(c * ts, 46 * ts + 4, ts, ts - 8);
      ctx.strokeStyle = '#451a03'; ctx.strokeRect(c * ts, 46 * ts + 4, ts, ts - 8);
    }

    // Swimming Ducks in Pond
    let duckX = 52 * ts + Math.cos(tickCount * 0.03) * 35;
    let duckY = 49 * ts + Math.sin(tickCount * 0.03) * 20;
    ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(duckX, duckY, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f97316'; ctx.fillRect(duckX + 5, duckY - 2, 4, 3);

    // 2. Large Houses
    for (let h of world.houses) {
      let isOpened = h.id === selectedHouseId;
      this.renderLargeHouse(ctx, h, isOpened, timeOfDay, tickCount, ts);
    }

    // 3. Regional Landmarks & Cemetery
    this.renderLandmarks(ctx, world, timeOfDay, tickCount);
  },

  renderLargeHouse(ctx, h, openInterior, timeOfDay, tickCount, ts) {
    let hx = h.x * ts;
    let hy = h.y * ts;
    let hw = h.w * ts;
    let hh = h.h * ts;

    if (h.status === 'under_construction') {
      ctx.fillStyle = '#d97706'; ctx.fillRect(hx, hy, hw, hh);
      ctx.strokeStyle = '#451a03'; ctx.lineWidth = 3; ctx.strokeRect(hx, hy, hw, hh);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 12px sans-serif'; ctx.fillText('🏗️ 新築リフォーム工事中...', hx + 12, hy + hh / 2);
      return;
    }

    if (openInterior) {
      ctx.fillStyle = '#fef3c7'; ctx.fillRect(hx, hy, hw, hh);
      ctx.strokeStyle = '#d97706'; ctx.lineWidth = 3; ctx.strokeRect(hx, hy, hw, hh);

      // Bed 🛌
      ctx.fillStyle = '#cbd5e1'; ctx.fillRect(hx + 10, hy + 10, 52, 38);
      ctx.fillStyle = h.color; ctx.fillRect(hx + 10, hy + 22, 52, 26);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(hx + 14, hy + 12, 18, 10); ctx.fillRect(hx + 38, hy + 12, 18, 10);

      // Fireplace 🔥
      ctx.fillStyle = '#78350f'; ctx.fillRect(hx + hw - 48, hy + 6, 40, 28);
      let fSize = 6 + Math.sin(tickCount * 0.3) * 3;
      ctx.fillStyle = '#ea580c'; ctx.beginPath(); ctx.arc(hx + hw - 28, hy + 26, fSize, 0, Math.PI * 2); ctx.fill();

      // Kitchen 🍳
      ctx.fillStyle = '#475569'; ctx.fillRect(hx + 10, hy + hh - 45, 48, 35);
      ctx.fillStyle = '#0f172a'; ctx.fillRect(hx + 14, hy + hh - 40, 20, 16);

      // Open Roof Tag
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'; ctx.fillRect(hx, hy - 20, 140, 18);
      ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`🔍 室内観察: ${h.name}`, hx + 6, hy - 6);

    } else {
      ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(hx + 6, hy + 6, hw, hh);
      ctx.fillStyle = '#f8fafc'; ctx.fillRect(hx, hy + 20, hw, hh - 20);
      ctx.fillStyle = h.color;
      ctx.beginPath(); ctx.moveTo(hx - 10, hy + 22); ctx.lineTo(hx + hw / 2, hy - 18); ctx.lineTo(hx + hw + 10, hy + 22); ctx.closePath(); ctx.fill();
    }
  },

  renderLandmarks(ctx, world, timeOfDay, tickCount) {
    const ts = world.tileSize;

    // 🌊 Beach Resort Umbrella & Watermelon
    let bx = 136 * ts;
    let by = 50 * ts;
    ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(bx + 16, by + 16, 20, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#15803d'; ctx.beginPath(); ctx.arc(bx + 40, by + 20, 8, 0, Math.PI * 2); ctx.fill(); // Watermelon 🍉

    // 🍖 BBQ Camp Grill
    let cx = 100 * ts;
    let cy = 75 * ts;
    ctx.fillStyle = '#1e293b'; ctx.fillRect(cx + 8, cy + 8, 32, 20);
    ctx.fillStyle = '#ea580c'; ctx.fillRect(cx + 12, cy + 12, 24, 12);
    ctx.fillStyle = '#78350f'; ctx.fillRect(cx - 30, cy - 10, 24, 30); // Camp Tent ⛺

    // 🪦 Cemetery Tombstones & Cherry Blossoms
    let cmx = 25 * ts;
    let cmy = 95 * ts;
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = '#64748b'; ctx.fillRect(cmx + i * 28, cmy, 16, 24);
      ctx.fillStyle = '#94a3b8'; ctx.fillText('🪦', cmx + i * 28 + 1, cmy + 16);
    }
    // Cherry Blossom Tree 🌸
    ctx.fillStyle = '#f472b6'; ctx.beginPath(); ctx.arc(cmx + 120, cmy - 10, 22, 0, Math.PI * 2); ctx.fill();

    // Fountain Park
    let fx = 55 * ts;
    let fy = 35 * ts;
    ctx.fillStyle = '#94a3b8'; ctx.beginPath(); ctx.arc(fx + 16, fy + 16, 26, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(fx + 16, fy + 16, 20, 0, Math.PI * 2); ctx.fill();

    // Trees
    if (world.decorations) {
      for (let dec of world.decorations) {
        let dx = dec.x * ts;
        let dy = dec.y * ts;
        if (dec.type === 'tree') {
          ctx.fillStyle = '#78350f'; ctx.fillRect(dx + 12, dy + 16, 8, 14);
          ctx.fillStyle = '#15803d'; ctx.beginPath(); ctx.arc(dx + 16, dy + 14, 16, 0, Math.PI * 2); ctx.fill();
        } else if (dec.type === 'flower') {
          ctx.fillStyle = dec.color || '#ff7675'; ctx.beginPath(); ctx.arc(dx + 16, dy + 16, 4, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
  }
};
