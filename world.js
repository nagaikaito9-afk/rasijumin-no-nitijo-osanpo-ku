/**
 * world.js - Large Houses, Strict Solid Collision Obstacles (No walking on houses/trees), 3D World Specs
 */

class World {
  constructor(widthInTiles = 54, heightInTiles = 38, tileSize = 32) {
    this.cols = widthInTiles;
    this.rows = heightInTiles;
    this.tileSize = tileSize;
    this.width = this.cols * this.tileSize;
    this.height = this.rows * this.tileSize;

    // Tile Types: 0: Grass, 1: Road, 2: Water, 4: Solid Obstacle (House/Tree/Wall)
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
        this.grid[r][c] = 0;
      }
    }

    // Cobblestone Roads (1)
    for (let c = 4; c < 50; c++) this.grid[19][c] = 1;
    for (let c = 4; c < 50; c++) this.grid[8][c] = 1;
    for (let c = 4; c < 50; c++) this.grid[30][c] = 1;

    for (let r = 4; r < 34; r++) this.grid[r][10] = 1;
    for (let r = 4; r < 34; r++) this.grid[r][27] = 1;
    for (let r = 4; r < 34; r++) this.grid[r][44] = 1;

    // Water Pond (2) & Bridge
    for (let r = 21; r <= 27; r++) {
      for (let c = 14; c <= 23; c++) {
        this.grid[r][c] = 2;
      }
    }
    for (let c = 16; c <= 21; c++) this.grid[24][c] = 1; // Wooden Bridge

    // Define 6 LARGE Residential Houses (6x4 tiles)
    this.houses = [
      { id: 'h1', name: 'サンシャイン邸 A', x: 3, y: 3, w: 6, h: 4, door: { x: 6, y: 7 }, color: '#38bdf8', status: 'normal', residents: [] },
      { id: 'h2', name: 'ローズガーデン邸 B', x: 12, y: 3, w: 6, h: 4, door: { x: 15, y: 7 }, color: '#f43f5e', status: 'normal', residents: [] },
      { id: 'h3', name: 'フォレストヒルズ 1', x: 30, y: 3, w: 6, h: 4, door: { x: 33, y: 7 }, color: '#eab308', status: 'normal', residents: [] },
      { id: 'h4', name: 'フォレストヒルズ 2', x: 3, y: 13, w: 6, h: 4, door: { x: 6, y: 17 }, color: '#10b981', status: 'normal', residents: [] },
      { id: 'h5', name: 'スターライトヴィラ 1', x: 30, y: 13, w: 6, h: 4, door: { x: 33, y: 17 }, color: '#a855f7', status: 'normal', residents: [] },
      { id: 'h6', name: 'スターライトヴィラ 2', x: 3, y: 24, w: 6, h: 4, door: { x: 6, y: 28 }, color: '#06b6d4', status: 'normal', residents: [] }
    ];

    // MARK HOUSES AS SOLID OBSTACLES (4) EXCEPT DOORS! (Strict Collision Prevention)
    for (let h of this.houses) {
      for (let r = h.y; r < h.y + h.h; r++) {
        for (let c = h.x; c < h.x + h.w; c++) {
          this.grid[r][c] = 4; // Solid obstacle
        }
      }
    }

    // Landmarks
    this.landmarks = {
      cafe: { x: 13, y: 11, target: { x: 15, y: 14 }, name: '森のカフェ & ベーカリー' },
      chapel: { x: 45, y: 3, target: { x: 47, y: 7 }, name: '愛のウェディング教会 ⛪' },
      park: { x: 27, y: 19, target: { x: 27, y: 19 }, name: '中央公園の大噴水' },
      fountain: { x: 27, y: 19, target: { x: 27, y: 20 } },
      bench_1: { x: 25, y: 18, target: { x: 25, y: 18 }, name: '公園のウッドベンチ' },
      bench_2: { x: 29, y: 18, target: { x: 29, y: 18 }, name: '木もれ日ベンチ' },
      pond: { x: 18, y: 24, target: { x: 15, y: 24 }, name: 'アヒル池 (足元注意！)' },
      campfire: { x: 45, y: 24, target: { x: 45, y: 26 }, name: '夜の焚き火広場' },
      garden: { x: 45, y: 13, target: { x: 44, y: 13 }, name: 'コミュニティ農園' },
      library: { x: 30, y: 24, target: { x: 32, y: 24 }, name: '青空ライブラリー' }
    };

    this.houses.forEach(h => {
      this.landmarks[h.id] = { x: h.x, y: h.y, door: h.door, name: h.name };
    });

    this.generateDecorations();
  }

  generateDecorations() {
    this.decorations = [];
    const seed = (x) => Math.sin(x * 777) * 10000 - Math.floor(Math.sin(x * 777) * 10000);

    for (let r = 1; r < this.rows - 1; r++) {
      for (let c = 1; c < this.cols - 1; c++) {
        if (this.grid[r][c] === 0) {
          let occupied = false;
          for (let h of this.houses) {
            if (c >= h.x - 1 && c <= h.x + h.w + 1 && r >= h.y - 1 && r <= h.y + h.h + 1) {
              occupied = true; break;
            }
          }
          let rnd = seed(r * 50 + c);
          if (!occupied && rnd > 0.86) {
            this.decorations.push({ x: c, y: r, type: 'tree', variant: Math.floor(rnd * 3) });
            this.grid[r][c] = 4; // Mark tree as solid obstacle!
          } else if (!occupied && rnd > 0.65) {
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
          // Strictly avoid water (2) and solid obstacle walls/trees (4) unless targeting destination!
          let isSolid = this.grid[n.y][n.x] === 4;
          let isWater = this.grid[n.y][n.x] === 2 && n.y !== 24;

          if (!isSolid && !isWater || (n.x === tx && n.y === ty)) {
            let key = `${n.x},${n.y}`;
            if (!visited.has(key)) {
              visited.add(key);
              queue.push([...path, n]);
            }
          }
        }
      }
      if (visited.size > 1500) break;
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
