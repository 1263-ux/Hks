import Phaser from 'phaser';
import { MAP_WIDTH, MAP_HEIGHT, SPEED_FACTOR } from './config';

export class Player {
  scene: Phaser.Scene;
  sprite: Phaser.GameObjects.Arc;
  hp: number;
  maxHp: number;
  moveSpeed: number; // px/s

  // 成长属性（Phase 5 接入）
  exp = 0;
  level = 1;
  expToNext = 15;

  private keys: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  constructor(
    scene: Phaser.Scene,
    x: number, y: number,
    maxHp: number, moveSpeed: number,
    radius: number, color: number,
  ) {
    this.scene = scene;
    this.hp = maxHp;
    this.maxHp = maxHp;
    this.moveSpeed = moveSpeed * SPEED_FACTOR;

    // 玩家用圆形表示
    this.sprite = scene.add.circle(x, y, radius, color);
    this.sprite.setDepth(10);

    // 注册 WASD
    const kb = scene.input.keyboard!;
    this.keys = {
      W: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  update(delta: number): void {
    // 1. 计算输入方向
    let vx = 0, vy = 0;
    if (this.keys.A.isDown) vx -= 1;
    if (this.keys.D.isDown) vx += 1;
    if (this.keys.W.isDown) vy -= 1;
    if (this.keys.S.isDown) vy += 1;

    // 2. 对角线归一化，避免斜向加速
    const len = Math.sqrt(vx * vx + vy * vy);
    if (len > 0) { vx /= len; vy /= len; }

    // 3. delta 调整位置
    const dt = delta / 1000;
    let nx = this.sprite.x + vx * this.moveSpeed * dt;
    let ny = this.sprite.y + vy * this.moveSpeed * dt;

    // 4. 世界边界 clamp
    const r = this.sprite.radius;
    nx = Phaser.Math.Clamp(nx, r, MAP_WIDTH - r);
    ny = Phaser.Math.Clamp(ny, r, MAP_HEIGHT - r);

    // 5. 应用位置
    this.sprite.x = nx;
    this.sprite.y = ny;
  }

  takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
    // 受击闪白反馈
    this.sprite.setFillStyle(0xffffff);
    this.scene.time.delayedCall(100, () => {
      if (this.sprite.active) this.sprite.setFillStyle(0x4488ff);
    });
  }

  get isDead(): boolean {
    return this.hp <= 0;
  }

  get x(): number { return this.sprite.x; }
  get y(): number { return this.sprite.y; }
}
