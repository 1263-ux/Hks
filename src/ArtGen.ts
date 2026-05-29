/**
 * ArtGen — 像素风精灵纹理生成器
 * 全部使用 Canvas2D 绘制，零外部文件
 * 风格：精细像素风，硬边缘，有限色板，高光阴影
 */

import Phaser from 'phaser';

// ═══════════════════════════════════════════════
// 工具函数
// ═══════════════════════════════════════════════

function makeCanvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return { canvas: c, ctx };
}

function addTex(scene: Phaser.Scene, key: string, canvas: HTMLCanvasElement) {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  scene.textures.addCanvas(key, canvas);
}

// 绘制单个"像素块"（实际是 2×2 物理像素，形成像素风格）
const PX = 2; // 像素块大小
function px(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x * PX, y * PX, PX, PX);
}

function pxRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x * PX, y * PX, w * PX, h * PX);
}

function pxHLine(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, color: string) {
  pxRect(ctx, x, y, len, 1, color);
}

function pxVLine(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, color: string) {
  pxRect(ctx, x, y, 1, len, color);
}

// ═══════════════════════════════════════════════
// 主入口
// ═══════════════════════════════════════════════

export function generateAllTextures(scene: Phaser.Scene): void {
  genBackground(scene);
  genPlayer(scene);
  genTermite(scene);
  genWind(scene);
  genAcidRain(scene);
  genFire(scene);
  genFreezeThaw(scene);
  genBuilding(scene);
  genExpOrb(scene);
  genBolt(scene);
}

// ═══════════════════════════════════════════════
// 背景：古风庭院 240×135 像素格（=480×270物理px）
// ═══════════════════════════════════════════════

function genBackground(scene: Phaser.Scene) {
  const W = 240, H = 135;
  const { canvas, ctx } = makeCanvas(W * PX, H * PX);

  // 草地
  pxRect(ctx, 0, 0, W, H, '#4a8c3f');
  // 草斑
  for (let i = 0; i < 80; i++) {
    const rx = Math.floor(Math.random() * W);
    const ry = Math.floor(Math.random() * H);
    const colors = ['#5a9c4f', '#3d7a32', '#529044', '#45873a'];
    px(ctx, rx, ry, colors[i % 4]);
  }

  // 土路（十字）
  pxRect(ctx, 0, H / 2 - 3, W, 6, '#b8956e');
  pxRect(ctx, W / 2 - 3, 0, 6, H, '#b8956e');
  // 路面纹理
  for (let i = 0; i < 40; i++) {
    px(ctx, Math.floor(Math.random() * W), H / 2 - 2 + Math.floor(Math.random() * 4), '#c9a47a');
    px(ctx, W / 2 - 2 + Math.floor(Math.random() * 4), Math.floor(Math.random() * H), '#c9a47a');
  }

  // 中央石板庭院
  pxRect(ctx, W / 2 - 18, H / 2 - 18, 36, 36, '#a89880');
  for (let gx = 0; gx < 5; gx++) {
    for (let gy = 0; gy < 5; gy++) {
      const sx = W / 2 - 16 + gx * 7;
      const sy = H / 2 - 16 + gy * 7;
      pxRect(ctx, sx, sy, 6, 6, '#b8a890');
      pxRect(ctx, sx + 1, sy + 1, 4, 4, '#c8b898');
    }
  }

  // 四角松柏
  function tree(tx: number, ty: number) {
    // 树干
    pxRect(ctx, tx - 1, ty + 8, 2, 10, '#6b4c3b');
    // 树冠（三层三角）
    pxRect(ctx, tx - 6, ty - 2, 12, 5, '#2d5a1e');
    pxRect(ctx, tx - 8, ty + 2, 16, 5, '#357a2a');
    pxRect(ctx, tx - 10, ty + 6, 20, 4, '#3d8a32');
    // 高光
    px(ctx, tx - 2, ty - 1, '#4a9a3e');
    px(ctx, tx + 1, ty + 3, '#4a9a3e');
    px(ctx, tx, ty + 7, '#4a9a3e');
  }
  tree(12, 20); tree(W - 14, 20);
  tree(12, H - 30); tree(W - 14, H - 30);

  // 围墙
  for (let wx = 6; wx < W - 6; wx++) {
    px(ctx, wx, 6, '#8d6e63');  // 上墙
    px(ctx, wx, H - 7, '#8d6e63'); // 下墙
  }
  for (let wy = 6; wy < H - 6; wy++) {
    px(ctx, 6, wy, '#8d6e63');   // 左墙
    px(ctx, W - 7, wy, '#8d6e63'); // 右墙
  }
  // 墙垛
  for (let wx = 6; wx < W - 6; wx += 16) {
    pxRect(ctx, wx, 4, 4, 2, '#a08070');
    pxRect(ctx, wx, H - 5, 4, 2, '#a08070');
  }

  // 香炉（左下角）
  const lx = 30, ly = H - 30;
  pxRect(ctx, lx - 3, ly - 2, 6, 6, '#6d4c41');  // 炉身
  pxRect(ctx, lx - 4, ly - 4, 8, 2, '#8d6e63');  // 炉口
  // 炊烟
  for (let s = 0; s < 3; s++) {
    px(ctx, lx - 1 + s, ly - 6 - s * 2, '#ccc');
    px(ctx, lx + s, ly - 8 - s * 2, '#ddd');
  }

  addTex(scene, 'background', canvas);
}

// ═══════════════════════════════════════════════
// 玩家：古建守护者 24×24 像素格（=48×48物理px）
// ═══════════════════════════════════════════════

function genPlayer(scene: Phaser.Scene) {
  const S = 24;
  const { canvas, ctx } = makeCanvas(S * PX, S * PX);

  // 身体（蓝袍）
  pxRect(ctx, 7, 14, 10, 8, '#3366cc');
  pxRect(ctx, 6, 15, 12, 6, '#2a55b0');  // 暗面
  // 袍边
  pxHLine(ctx, 7, 21, 10, '#224499');
  // 腰带
  pxHLine(ctx, 8, 17, 8, '#ffcc44');
  pxRect(ctx, 10, 17, 4, 1, '#ffdd66');  // 带扣高光

  // 袖子
  pxRect(ctx, 5, 14, 3, 5, '#3a6ed8');
  pxRect(ctx, 16, 14, 3, 5, '#3a6ed8');

  // 手臂
  pxRect(ctx, 4, 16, 2, 4, '#ffddbb');
  pxRect(ctx, 18, 16, 2, 4, '#ffddbb');

  // 毛笔（右手）
  pxRect(ctx, 19, 15, 1, 8, '#8b6914');
  pxRect(ctx, 18, 21, 3, 2, '#333333');  // 笔尖

  // 头
  pxRect(ctx, 8, 7, 8, 8, '#ffddbb');
  pxRect(ctx, 7, 9, 10, 5, '#ffccaa');  // 脸颊
  // 眼睛
  px(ctx, 10, 9, '#333333');
  px(ctx, 13, 9, '#333333');
  // 嘴
  px(ctx, 11, 12, '#cc9977');

  // 斗笠
  pxRect(ctx, 6, 2, 12, 2, '#8b5e3c');
  pxRect(ctx, 5, 4, 14, 1, '#7a4e2c');
  pxRect(ctx, 4, 5, 16, 2, '#6a3e1c');
  // 笠顶
  px(ctx, 11, 0, '#a07050');
  px(ctx, 12, 0, '#a07050');
  px(ctx, 11, 1, '#9a6a4a');

  // 腿
  pxRect(ctx, 9, 22, 3, 2, '#554433');
  pxRect(ctx, 13, 22, 3, 2, '#554433');
  // 鞋
  pxRect(ctx, 8, 23, 5, 1, '#332211');
  pxRect(ctx, 12, 23, 5, 1, '#332211');

  addTex(scene, 'player', canvas);
}

// ═══════════════════════════════════════════════
// 白蚁怪 14×14 像素格（=28×28物理px）
// ═══════════════════════════════════════════════

function genTermite(scene: Phaser.Scene) {
  const S = 14;
  const { canvas, ctx } = makeCanvas(S * PX, S * PX);

  // 身体（分节）
  pxRect(ctx, 4, 5, 6, 4, '#e8e8e0');  // 前段
  pxRect(ctx, 4, 9, 6, 2, '#ddd8d0');  // 中段
  pxRect(ctx, 3, 11, 8, 2, '#d0c8c0');  // 后段
  // 体节线
  pxHLine(ctx, 4, 8, 6, '#ccc8c0');
  pxHLine(ctx, 4, 10, 6, '#ccc8c0');

  // 头
  pxRect(ctx, 5, 2, 4, 4, '#f0ece4');
  // 大颚
  px(ctx, 4, 4, '#c8b898');
  px(ctx, 9, 4, '#c8b898');
  // 触角
  px(ctx, 4, 1, '#ccc');
  px(ctx, 9, 1, '#ccc');
  px(ctx, 3, 0, '#bbb');
  px(ctx, 10, 0, '#bbb');
  // 眼
  px(ctx, 5, 3, '#881111');
  px(ctx, 8, 3, '#881111');

  // 六足
  px(ctx, 3, 6, '#d8d0c8');
  px(ctx, 10, 6, '#d8d0c8');
  px(ctx, 2, 9, '#d0c8c0');
  px(ctx, 11, 9, '#d0c8c0');
  px(ctx, 3, 12, '#c8c0b8');
  px(ctx, 10, 12, '#c8c0b8');

  addTex(scene, 'termite', canvas);
}

// ═══════════════════════════════════════════════
// 风蚀怪 18×18 像素格（=36×36物理px）
// ═══════════════════════════════════════════════

function genWind(scene: Phaser.Scene) {
  const S = 18;
  const { canvas, ctx } = makeCanvas(S * PX, S * PX);

  // 风刃漩涡（菱形多层）
  const cx = 9, cy = 9;
  const colors = ['#fff8cc', '#f0e090', '#e0cc60', '#c8b030'];
  for (let layer = 0; layer < 4; layer++) {
    const r = 7 - layer * 1.5;
    const c = colors[layer];
    for (let a = 0; a < 8; a++) {
      const angle = (a / 8) * Math.PI * 2 + layer * 0.3;
      const sx = Math.floor(cx + Math.cos(angle) * r);
      const sy = Math.floor(cy + Math.sin(angle) * r);
      px(ctx, sx, sy, c);
    }
  }

  // 风刃线
  pxRect(ctx, cx - 1, cy - 6, 2, 12, '#ffffdd');
  pxRect(ctx, cx - 6, cy - 1, 12, 2, '#ffffdd');
  px(ctx, cx, cy, '#ffffff');

  // 中心眼
  pxRect(ctx, cx - 1, cy - 1, 3, 3, '#ffffff');
  px(ctx, cx, cy, '#222222');

  addTex(scene, 'wind', canvas);
}

// ═══════════════════════════════════════════════
// 酸雨怪 16×18 像素格（=32×36物理px）
// ═══════════════════════════════════════════════

function genAcidRain(scene: Phaser.Scene) {
  const S = 16;
  const { canvas, ctx } = makeCanvas(S * PX, S * PX + 4);

  // 水滴身体
  const drops = [
    // x, y
    [7, 1], [8, 0],
    [6, 2], [7, 2], [8, 2], [9, 2],
    [5, 3], [6, 3], [7, 3], [8, 3], [9, 3], [10, 3],
    [5, 4], [6, 4], [7, 4], [8, 4], [9, 4], [10, 4],
    [5, 5], [6, 5], [7, 5], [8, 5], [9, 5], [10, 5],
    [5, 6], [6, 6], [7, 6], [8, 6], [9, 6], [10, 6],
    [5, 7], [6, 7], [7, 7], [8, 7], [9, 7], [10, 7],
    [4, 8], [5, 8], [6, 8], [7, 8], [8, 8], [9, 8], [10, 8], [11, 8],
    [4, 9], [5, 9], [6, 9], [7, 9], [8, 9], [9, 9], [10, 9], [11, 9],
    [3, 10], [4, 10], [5, 10], [6, 10], [7, 10], [8, 10], [9, 10], [10, 10], [11, 10], [12, 10],
    [3, 11], [4, 11], [5, 11], [6, 11], [7, 11], [8, 11], [9, 11], [10, 11], [11, 11], [12, 11],
    [3, 12], [4, 12], [5, 12], [6, 12], [7, 12], [8, 12], [9, 12], [10, 12], [11, 12], [12, 12],
    [4, 13], [5, 13], [6, 13], [7, 13], [8, 13], [9, 13], [10, 13], [11, 13],
    [5, 14], [6, 14], [7, 14], [8, 14], [9, 14], [10, 14],
    [6, 15], [7, 15], [8, 15], [9, 15],
    [7, 16], [8, 16],
  ];

  for (const [dx, dy] of drops) {
    const shade = dy < 4 ? '#88ee88' : dy < 8 ? '#44bb44' : dy < 12 ? '#33aa33' : '#228822';
    px(ctx, dx, dy, shade);
  }

  // 气泡
  px(ctx, 4, 4, '#aaffaa');
  px(ctx, 5, 3, '#ccffcc');
  px(ctx, 10, 5, '#aaffaa');
  px(ctx, 11, 4, '#ccffcc');

  // 眼睛
  pxRect(ctx, 6, 6, 2, 2, '#ffffff');
  pxRect(ctx, 9, 6, 2, 2, '#ffffff');
  px(ctx, 6, 6, '#111111');
  px(ctx, 9, 6, '#111111');

  addTex(scene, 'acid_rain', canvas);
}

// ═══════════════════════════════════════════════
// 火焰怪 20×20 像素格（=40×40物理px）
// ═══════════════════════════════════════════════

function genFire(scene: Phaser.Scene) {
  const S = 20;
  const { canvas, ctx } = makeCanvas(S * PX, S * PX);
  const cx = 10, cy = 10;

  // 外焰（不规则形状）
  const outerFlame = [
    [cx, cy - 8], [cx - 1, cy - 7], [cx + 1, cy - 7],
    [cx - 2, cy - 6], [cx + 2, cy - 6],
    [cx - 3, cy - 5], [cx + 3, cy - 5],
    [cx - 4, cy - 4], [cx + 4, cy - 4],
    [cx - 5, cy - 3], [cx + 5, cy - 3],
    [cx - 6, cy - 2], [cx + 6, cy - 2],
    [cx - 6, cy - 1], [cx + 6, cy - 1],
    [cx - 5, cy], [cx + 5, cy],
    [cx - 5, cy + 1], [cx + 5, cy + 1],
    [cx - 6, cy + 2], [cx + 6, cy + 2],
    [cx - 6, cy + 3], [cx + 6, cy + 3],
    [cx - 5, cy + 4], [cx + 5, cy + 4],
    [cx - 4, cy + 5], [cx + 4, cy + 5],
    [cx - 3, cy + 6], [cx + 3, cy + 6],
    [cx - 2, cy + 7], [cx + 2, cy + 7],
    [cx - 1, cy + 8], [cx + 1, cy + 8],
    [cx, cy + 9],
  ];
  for (const [fx, fy] of outerFlame) {
    px(ctx, fx, fy, '#ff4400');
  }

  // 内焰
  const innerFlame = [
    [cx, cy - 5], [cx - 1, cy - 4], [cx + 1, cy - 4],
    [cx - 2, cy - 3], [cx + 2, cy - 3],
    [cx - 3, cy - 2], [cx + 3, cy - 2],
    [cx - 3, cy - 1], [cx + 3, cy - 1],
    [cx - 3, cy], [cx + 3, cy],
    [cx - 4, cy + 1], [cx + 4, cy + 1],
    [cx - 4, cy + 2], [cx + 4, cy + 2],
    [cx - 3, cy + 3], [cx + 3, cy + 3],
    [cx - 2, cy + 4], [cx + 2, cy + 4],
    [cx - 1, cy + 5], [cx + 1, cy + 5],
  ];
  for (const [fx, fy] of innerFlame) {
    px(ctx, fx, fy, '#ffaa00');
  }

  // 核心
  pxRect(ctx, cx - 2, cy - 1, 4, 3, '#ffee44');
  px(ctx, cx, cy, '#ffffff');

  // 眼睛（凶）
  pxRect(ctx, cx - 3, cy - 2, 2, 2, '#ffffff');
  pxRect(ctx, cx + 1, cy - 2, 2, 2, '#ffffff');
  px(ctx, cx - 3, cy - 1, '#cc0000');
  px(ctx, cx + 1, cy - 1, '#cc0000');

  addTex(scene, 'fire', canvas);
}

// ═══════════════════════════════════════════════
// 冻融怪 22×22 像素格（=44×44物理px）
// ═══════════════════════════════════════════════

function genFreezeThaw(scene: Phaser.Scene) {
  const S = 22;
  const { canvas, ctx } = makeCanvas(S * PX, S * PX);
  const cx = 11, cy = 11;

  // 六边形冰块主体
  const hexPoints: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? 9 : 7;
    hexPoints.push([Math.floor(cx + Math.cos(a) * r), Math.floor(cy + Math.sin(a) * r)]);
  }

  // 填充冰块
  for (let dy = -8; dy <= 8; dy++) {
    for (let dx = -8; dx <= 8; dx++) {
      const px2 = cx + dx, py = cy + dy;
      // 简单六边形内检测
      const qx = Math.abs(dx) * 0.866 + Math.abs(dy) * 0.5;
      const qy = Math.abs(dy) * 0.866;
      if (qx < 8 && qy < 8) {
        const shade = (dx + dy) % 3 === 0 ? '#7ab8e0' : '#5a9cc8';
        px(ctx, px2, py, shade);
      }
    }
  }

  // 冰晶高光
  pxRect(ctx, cx - 2, cy - 6, 4, 8, '#aaddff');
  px(ctx, cx, cy - 4, '#ddeeff');
  px(ctx, cx, cy, '#ddeeff');

  // 裂纹
  px(ctx, cx - 5, cy - 2, '#4488b0');
  px(ctx, cx - 4, cy - 1, '#4488b0');
  px(ctx, cx - 3, cy, '#4488b0');
  px(ctx, cx - 2, cy + 1, '#4488b0');
  px(ctx, cx - 1, cy + 3, '#4488b0');
  px(ctx, cx + 3, cy - 4, '#4488b0');
  px(ctx, cx + 4, cy - 3, '#4488b0');
  px(ctx, cx + 4, cy, '#4488b0');

  // 眼睛（冷光）
  pxRect(ctx, cx - 4, cy - 2, 3, 2, '#ffffff');
  pxRect(ctx, cx + 1, cy - 2, 3, 2, '#ffffff');
  px(ctx, cx - 3, cy - 1, '#0055cc');
  px(ctx, cx + 2, cy - 1, '#0055cc');

  addTex(scene, 'freeze_thaw', canvas);
}

// ═══════════════════════════════════════════════
// 古建寺庙：5 段受损状态  60×36 像素格（=120×72物理px）
// ═══════════════════════════════════════════════

function genBuilding(scene: Phaser.Scene) {
  const states = [
    { key: 'building_100', damage: 0 },
    { key: 'building_75', damage: 1 },
    { key: 'building_50', damage: 2 },
    { key: 'building_25', damage: 3 },
    { key: 'building_0', damage: 4 },
  ];

  for (const st of states) {
    const W = 60, H = 36;
    const { canvas, ctx } = makeCanvas(W * PX, H * PX);
    const dm = st.damage; // 0=完好, 4=废墟

    // 台基
    pxRect(ctx, 3, H - 4, W - 6, 4, dm >= 3 ? '#777' : '#888888');
    if (dm >= 4) {
      // 台基裂缝
      for (let i = 0; i < 6; i++) {
        px(ctx, 8 + Math.floor(Math.random() * (W - 16)), H - 3 + Math.floor(Math.random() * 2), '#555');
      }
    }

    // 外墙
    const wallLeft = 8, wallRight = W - 8;
    if (dm < 4) {
      pxRect(ctx, wallLeft, 12, wallRight - wallLeft, H - 16, '#6B4226');
    } else {
      // 废墟：外墙只剩残垣
      pxRect(ctx, wallLeft, H - 10, 10, 6, '#6B4226');
      pxRect(ctx, W - 18, H - 10, 10, 6, '#6B4226');
    }

    // 外墙裂缝（dm>=2）
    if (dm >= 2) {
      const cracks = dm === 4 ? 8 : dm * 2;
      for (let i = 0; i < cracks; i++) {
        const cx2 = wallLeft + 3 + Math.floor(Math.random() * (wallRight - wallLeft - 6));
        const cy2 = 13 + Math.floor(Math.random() * (H - 20));
        px(ctx, cx2, cy2, '#3a2010');
        if (dm >= 3) px(ctx, cx2 + 1, cy2, '#3a2010');
      }
    }

    // 木柱
    const pillars = [14, 22, 30, 38, 46];
    for (const px3 of pillars) {
      if (dm >= 3 && px3 === 30) continue; // 中柱断裂
      if (dm >= 4 && (px3 === 14 || px3 === 46)) continue;
      pxRect(ctx, px3, 12, 2, H - 16, '#C4884D');
      // 柱高光
      if (dm < 3 || px3 !== 22) {
        pxVLine(ctx, px3, 12, H - 16, '#d4985d');
      }
    }
    // 断裂柱残段
    if (dm >= 3) {
      pxRect(ctx, 30, 12, 2, 5, '#C4884D');
      if (dm >= 4) {
        pxRect(ctx, 14, H - 10, 2, 4, '#B0783D');
      }
    }

    // 屋顶（飞檐）- dm=4 完全塌
    if (dm < 4) {
      const roofColor = dm >= 2 ? '#8a3a1a' : '#A0522D';
      const roofBase = dm >= 3 ? 18 : 12;
      // 主屋面
      pxRect(ctx, 3, roofBase, W - 6, 5, roofColor);
      // 飞檐翘角
      px(ctx, 2, roofBase - 1, roofColor);
      px(ctx, W - 3, roofBase - 1, roofColor);
      if (dm < 2) {
        px(ctx, 1, roofBase - 2, '#B0623D');
        px(ctx, W - 2, roofBase - 2, '#B0623D');
      }
      // 屋脊
      pxRect(ctx, W / 2 - 6, roofBase - 3, 12, 3, '#8B4513');
      if (dm < 1) {
        px(ctx, W / 2, roofBase - 5, '#FFCC44');  // 脊饰
        px(ctx, W / 2 - 1, roofBase - 4, '#FFCC44');
        px(ctx, W / 2 + 1, roofBase - 4, '#FFCC44');
      }
    } else {
      // 废墟屋顶碎片
      pxRect(ctx, 5, 16, 12, 3, '#8a3a1a');
      pxRect(ctx, W - 17, 17, 10, 2, '#8a3a1a');
    }

    // 斗拱层
    if (dm < 3) {
      pxRect(ctx, 5, 10, W - 10, 3, '#8B4513');
      for (let dx = 10; dx < W - 10; dx += 8) {
        pxRect(ctx, dx, 7, 3, 5, '#9B5523');
      }
    } else if (dm < 4) {
      // 部分斗拱损坏
      pxRect(ctx, 5, 10, 20, 3, '#8B4513');
      pxRect(ctx, W - 25, 10, 20, 3, '#8B4513');
    }

    // 大门
    if (dm < 3) {
      pxRect(ctx, W / 2 - 6, 20, 12, H - 24, '#3E2723');
      pxVLine(ctx, W / 2, 20, H - 24, '#FFCC44');  // 门缝
    } else if (dm < 4) {
      pxRect(ctx, W / 2 - 4, 22, 8, H - 26, '#3E2723');
    }

    // 窗户 - dm>=3 破损
    if (dm < 4) {
      [W / 2 - 18, W / 2 + 12].forEach(wx2 => {
        if (dm >= 3 && wx2 === W / 2 + 12) return; // 一扇窗损坏
        pxRect(ctx, wx2, 16, 5, 6, '#2E1703');
        pxVLine(ctx, wx2 + 2, 16, 6, '#C4884D');
        pxHLine(ctx, wx2, 19, 5, '#C4884D');
      });
    }

    // 废墟杂草（dm>=4）
    if (dm >= 4) {
      for (let i = 0; i < 10; i++) {
        const gx = 4 + Math.floor(Math.random() * (W - 8));
        const gy = H - 6 + Math.floor(Math.random() * 4);
        px(ctx, gx, gy, '#3a7a2e');
      }
    }

    // 同时注册 'building' 指向完好版
    if (dm === 0) {
      addTex(scene, 'building', canvas);
    }
    addTex(scene, st.key, canvas);
  }
}

// ═══════════════════════════════════════════════
// 经验球 8×8 像素格（=16×16物理px）
// ═══════════════════════════════════════════════

function genExpOrb(scene: Phaser.Scene) {
  const S = 8;
  const { canvas, ctx } = makeCanvas(S * PX, S * PX);
  const cx2 = 4, cy2 = 4;

  // 辉光
  for (let dy = -3; dy <= 3; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 3.5) {
        const brightness = 1 - d / 3.5;
        const g = Math.floor(200 + brightness * 55);
        const r = Math.floor(brightness * 100);
        const b = Math.floor(brightness * 100);
        px(ctx, cx2 + dx, cy2 + dy, `rgb(${r},${g},${b})`);
      }
    }
  }

  // 核心亮点
  px(ctx, cx2, cy2 - 1, '#ffffff');
  px(ctx, cx2 - 1, cy2, '#eeffee');
  px(ctx, cx2 + 1, cy2, '#eeffee');

  addTex(scene, 'exp_orb', canvas);
}

// ═══════════════════════════════════════════════
// 普攻弹 5×5 像素格（=10×10物理px）
// ═══════════════════════════════════════════════

function genBolt(scene: Phaser.Scene) {
  const S = 5;
  const { canvas, ctx } = makeCanvas(S * PX, S * PX);
  const cx2 = 2, cy2 = 2;

  px(ctx, cx2, cy2, '#ffffff');
  px(ctx, cx2 - 1, cy2, '#88ccff');
  px(ctx, cx2 + 1, cy2, '#88ccff');
  px(ctx, cx2, cy2 - 1, '#88ccff');
  px(ctx, cx2, cy2 + 1, '#88ccff');
  px(ctx, cx2 - 1, cy2 - 1, '#4488cc');
  px(ctx, cx2 + 1, cy2 - 1, '#4488cc');
  px(ctx, cx2 - 1, cy2 + 1, '#4488cc');
  px(ctx, cx2 + 1, cy2 + 1, '#4488cc');

  addTex(scene, 'bolt', canvas);
}
