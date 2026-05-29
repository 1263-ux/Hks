import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, StructureType } from './config';
import { Player } from './Player';
import { Building } from './Building';

interface StructBar {
  type: StructureType;
  bg: Phaser.GameObjects.Rectangle;
  fill: Phaser.GameObjects.Rectangle;
  hpText: Phaser.GameObjects.Text;
}

export class HUD {
  scene: Phaser.Scene;

  // 玩家 HP
  private hpBg!: Phaser.GameObjects.Rectangle;
  private hpFill!: Phaser.GameObjects.Rectangle;
  private hpLabel!: Phaser.GameObjects.Text;

  // 4 条古建结构血条
  private structBars: StructBar[] = [];

  // 倒计时
  private timerText!: Phaser.GameObjects.Text;

  // 经验条
  private expBg!: Phaser.GameObjects.Rectangle;
  private expFill!: Phaser.GameObjects.Rectangle;
  private expLabel!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createPlayerHpBar();
    this.createStructureBars();
    this.createTimer();
    this.createExpBar();
  }

  // ── 玩家 HP 条（左上） ──
  private createPlayerHpBar(): void {
    const x = 12, y = 12, w = 180, h = 14;
    this.hpBg = this.scene.add.rectangle(x, y, w, h, 0x333333)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(100);
    this.hpFill = this.scene.add.rectangle(x, y, w, h, 0xff4444)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(101);
    this.hpLabel = this.scene.add.text(x + 4, y + 1, '',
      { fontSize: '11px', color: '#fff', fontFamily: 'monospace' })
      .setScrollFactor(0).setDepth(102);
  }

  // ── 4 条古建血条（屏幕上方居中） ──
  private createStructureBars(): void {
    const types: StructureType[] = ['wood', 'stone', 'tile', 'painting'];
    const colors = [0xC4884D, 0x999999, 0xA0522D, 0x9966CC];
    const labels = ['木质', '石质', '砖瓦', '彩绘'];
    const barW = 150, barH = 12, gap = 8;
    const totalW = 4 * barW + 3 * gap;
    const startX = (GAME_WIDTH - totalW) / 2;
    const y = 8;

    types.forEach((type, i) => {
      const bx = startX + i * (barW + gap);

      // 标签
      this.scene.add.text(bx, y - 12, labels[i],
        { fontSize: '9px', color: '#ccc' })
        .setScrollFactor(0).setDepth(102);

      // 底色
      const bg = this.scene.add.rectangle(bx, y, barW, barH, 0x333333)
        .setOrigin(0, 0).setScrollFactor(0).setDepth(100);

      // 填充
      const fill = this.scene.add.rectangle(bx, y, barW, barH, colors[i])
        .setOrigin(0, 0).setScrollFactor(0).setDepth(101);

      // 数值
      const hpText = this.scene.add.text(bx + 2, y + 1, '',
        { fontSize: '8px', color: '#fff', fontFamily: 'monospace' })
        .setScrollFactor(0).setDepth(102);

      this.structBars.push({ type, bg, fill, hpText });
    });
  }

  // ── 倒计时（右上） ──
  private createTimer(): void {
    this.timerText = this.scene.add.text(GAME_WIDTH - 12, 12, '5:00',
      { fontSize: '22px', color: '#fff', fontFamily: 'monospace' })
      .setOrigin(1, 0).setScrollFactor(0).setDepth(102);
  }

  // ── 经验条（底部全宽） ──
  private createExpBar(): void {
    const h = 10;
    const y = GAME_HEIGHT - 14;
    const fullW = GAME_WIDTH - 24;
    this.expBg = this.scene.add.rectangle(12, y, fullW, h, 0x333333)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(100);
    this.expFill = this.scene.add.rectangle(12, y, 0, h, 0x44aaff)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(101);
    this.expLabel = this.scene.add.text(GAME_WIDTH / 2, y + h / 2, 'Lv.1  0/15',
      { fontSize: '9px', color: '#fff', fontFamily: 'monospace' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(102);
  }

  // ── 每帧刷新 ──
  update(player: Player, building: Building, gameTime: number): void {
    const fullW = GAME_WIDTH - 24;

    // 玩家 HP
    const hpRatio = player.hp / player.maxHp;
    this.hpFill.setSize(180 * hpRatio, 14);
    this.hpLabel.setText(`HP  ${player.hp}/${player.maxHp}`);

    // 古建结构血条
    for (const bar of this.structBars) {
      const s = building.getStructure(bar.type);
      if (!s) continue;
      const ratio = s.currentHp / s.maxHp;
      bar.fill.setSize(150 * ratio, 12);
      bar.hpText.setText(`${s.currentHp}/${s.maxHp}`);
    }

    // 倒计时
    const m = Math.floor(gameTime / 60);
    const s = Math.floor(gameTime % 60);
    this.timerText.setText(`${m}:${s.toString().padStart(2, '0')}`);
    this.timerText.setColor(gameTime < 30 ? '#ff4444' : '#ffffff');

    // 经验条
    const expRatio = player.level > 0 ? player.exp / player.expToNext : 0;
    this.expFill.setSize(fullW * expRatio, 10);
    this.expLabel.setText(`Lv.${player.level}  ${player.exp}/${player.expToNext}`);
  }
}
