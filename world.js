/**
 * world.js - 160x120 10x Massive Map (Beach Resort, BBQ Camp, Emerald Lake, Cemetery)
 */

class World {
  constructor(widthInTiles = 160, heightInTiles = 120, tileSize = 32) {
    this.cols = widthInTiles;
    this.rows = heightInTiles;
    this.tileSize = tileSize;
    this.width = this.cols * this.tileSize;
    this.height = this.rows * this.tileSize;

    // Tile Types: 0: Grass, 1: Road, 2: Water (Strict Solid for walking), 3: Sand Beach, 4: Solid Obstacle
    this.grid = [];
    this.landmarks = {};
    this.houses = [];
    this.decorations = [];

    this.initMap();
  }

  initMap() {
    for (let r = 0; r < this.rows; r++) {
      this.grid[r] = [];
      for (let c = 0; c < this.cols; c++) {
        this.grid[r][c] = 0; // Default Grass
      }
    }

    // 1. Cobblestone & Wooden Road Network
    for (let c = 10; c < 150; c++) {
      this.grid[30][c] = 1;
      this.grid[60][c] = 1;
      this.grid[90][c] = 1;
    }
    for (let r = 10; r < 110; r++) {
      this.grid[r][30] = 1;
      this.grid[r][80] = 1;
      this.grid[r][130] = 1;
    }

    // 2. 🌊 Ocean & Sand Beach Resort (Right & Bottom Coastline)
    for (let r = 0; r < this.rows; r++) {
      for (let c = 142; c < this.cols; c++) {
        this.grid[r][c] = 2; // Deep Ocean Water
      }
    }
    for (let r = 0; r < this.rows; r++) {
      for (let c = 132; c <= 141; c++) {
        this.grid[r][c] = 3; // Sand Beach
      }
    }

    // 3. ⛵ Emerald Lake (Upper Right Region)
    for (let r = 10; r <= 25; r++) {
      for (let c = 90; c <= 118; c++) {
        this.grid[r][c] = 2; // Lake Water
      }
    }

    // 4. ⛲ Park Duck Pond
    for (let r = 40; r <= 52; r++) {
      for (let c = 45; c <= 65; c++) {
        this.grid[r][c] = 2;
      }
    }
    for (let c = 48; c <= 62; c++) this.grid[46][c] = 1; // Wooden Bridge

    // 5. 6 Large Houses (6x4 tiles)
    this.houses = [
      { id: 'h1', name: 'サンシャイン邸 A', x: 12, y: 12, w: 6, h: 4, door: { x: 15, y: 16 }, color: '#38bdf8', status: 'normal', residents: [] },
      { id: 'h2', name: 'ローズガーデン邸 B', x: 42, y: 12, w: 6, h: 4, door: { x: 45, y: 16 }, color: '#f43f5e', status: 'normal', residents: [] },
      { id: 'h3', name: 'フォレストヒルズ 1', x: 12, y: 42, w: 6, h: 4, door: { x: 15, y: 46 }, color: '#eab308', status: 'normal', residents: [] },
      { id: 'h4', name: 'フォレストヒルズ 2', x: 42, y: 42, w: 6, h: 4, door: { x: 45, y: 46 }, color: '#10b981', status: 'normal', residents: [] },
      { id: 'h5', name: 'スターライトヴィラ 1', x: 12, y: 72, w: 6, h: 4, door: { x: 15, y: 76 }, color: '#a855f7', status: 'normal', residents: [] },
      { id: 'h6', name: 'スターライトヴィラ 2', x: 42, y: 72, w: 6, h: 4, door: { x: 45, y: 76 }, color: '#06b6d4', status: 'normal', residents: [] }
    ];

    // Mark Houses as Solid Obstacles (4)
    for (let h of this.houses) {
      for (let r = h.y; r < h.y + h.h; r++) {
        for (let c = h.x; c < h.x + h.w; c++) {
          this.grid[r][c] = 4;
        }
      }
    }

    // 6. Regional Landmarks
    this.landmarks = {
      cafe: { x: 35, y: 35, target: { x: 35, y: 36 }, name: '森のカフェ & ベーカリー' },
      chapel: { x: 10, y: 95, target: { x: 12, y: 98 }, name: '愛のウェディング教会 ⛪' },
      cemetery: { x: 25, y: 95, target: { x: 28, y: 98 }, name: '🌸 桜並木メモリアル霊園 🪦' },
      park: { x: 55, y: 35, target: { x: 55, y: 35 }, name: '中央公園の大噴水 ⛲' },
      fountain: { x: 55, y: 35, target: { x: 55, y: 36 } },
      bench_1: { x: 50, y: 34, target: { x: 50, y: 34 }, name: '公園のウッドベンチ' },
      pond: { x: 50, y: 46, target: { x: 47, y: 46 }, name: 'アヒル池 (足元注意！)' },
      beach: { x: 136, y: 50, target: { x: 136, y: 50 }, name: '🌊 渚の海水浴リゾート 🏖️' },
      camp: { x: 100, y: 75, target: { x: 100, y: 75 }, name: '🌲 森林BBQキャンプ場 🥩' },
      lake: { x: 105, y: 28, target: { x: 105, y: 28 }, name: '⛵ 碧の湖畔スワンボート' }
    };

    this.houses.forEach(h => {
      this.landmarks[h.id] = { x: h.x, y: h.y, door: h.door, name: h.name };
    });

    this.generateDecorations();
  }

  generateDecorations() {
    this.decorations = [];
    const seed = (x) => Math.sin(x * 777) * 10000 - Math.floor(Math.sin(x * 777) * 10000);

    for (let r = 2; r < this.rows - 2; r++) {
      for (let c = 2; c < this.cols - 2; c++) {
        if (this.grid[r][c] === 0) {
          let occupied = false;
          for (let h of this.houses) {
            if (c >= h.x - 1 && c <= h.x + h.w + 1 && r >= h.y - 1 && r <= h.y + h.h + 1) {
              occupied = true; break;
            }
          }
          let rnd = seed(r * 160 + c);
          if (!occupied && rnd > 0.88) {
            this.decorations.push({ x: c, y: r, type: 'tree', variant: Math.floor(rnd * 3) });
            this.grid[r][c] = 4; // Solid tree obstacle!
          } else if (!occupied && rnd > 0.72) {
            this.decorations.push({ x: c, y: r, type: 'flower', color: rnd > 0.8 ? '#ff7675' : '#ffeaa7' });
          }
        }
      }
    }
  }

  findPath(sx, sy, tx, ty) {
    sx = Math.max(0, Math.min(this.cols - 1, Math.floor(sx)));
    sy = Math.max(0, Math.min(this.rows - 1, Math.floor(sy)));
    tx = Math.max(0, Math.min(this.cols - 1, Math.floor(tx)));
    ty = Math.max(0, Math.min(this.rows - 1, Math.floor(ty)));

    let queue = [[{ x: sx, y: sy }]];
    let visited = new Set();
    visited.add(`${sx},${sy}`);

    while (queue.length > 0) {
      let path = queue.shift();
      let current = path[path.length - 1];

      if (current.x === tx && current.y === ty) return path;

      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 }
      ];

      for (let n of neighbors) {
        if (n.x >= 0 && n.x < this.cols && n.y >= 0 && n.y < this.rows) {
          // STRICT WATER & SOLID OBSTACLE COLLISION PREVENTION (Residents NEVER walk on water!)
          let isSolid = this.grid[n.y][n.x] === 4;
          let isWater = this.grid[n.y][n.x] === 2 && !(n.y === 46 && n.x >= 48 && n.x <= 62); // Bridge allowed

          if (!isSolid && !isWater) {
            let key = `${n.x},${n.y}`;
            if (!visited.has(key)) {
              visited.add(key);
              queue.push([...path, n]);
            }
          }
        }
      }
      if (visited.size > 2000) break;
    }
    return [{ x: sx, y: sy }, { x: tx, y: ty }];
  }

  getHouseAtPixel(px, py) {
    const ts = this.tileSize;
    for (let h of this.houses) {
      let hx = h.x * ts;
      let hy = h.y * ts;
      let hw = h.w * ts;
      let hh = h.h * ts;
      if (px >= hx && px <= hx + hw && py >= hy - 16 && py <= hy + hh + 24) {
        return h;
      }
    }
    return null;
  }
}
