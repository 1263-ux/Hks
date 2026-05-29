import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './config';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const cx = GAME_WIDTH / 2;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // 装饰网格
    bg.lineStyle(1, 0x2a2a4e, 0.3);
    for (let x = 0; x <= GAME_WIDTH; x += 64) {
      bg.moveTo(x, 0); bg.lineTo(x, GAME_HEIGHT);
    }
    for (let y = 0; y <= GAME_HEIGHT; y += 64) {
      bg.moveTo(0, y); bg.lineTo(GAME_WIDTH, y);
    }
    bg.strokePath();

    // 标题
    this.add.text(cx, 160, '山西古建保卫战', {
      fontSize: '42px', color: '#ffcc44',
      fontFamily: 'sans-serif',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5);

    // 副标题
    this.add.text(cx, 215, 'Shanxi Ancient Architecture Defense', {
      fontSize: '14px', color: '#888', fontFamily: 'sans-serif',
    }).setOrigin(0.5);

    // 古建图标（几何绘制）
    const iconG = this.add.graphics();
    const ix = cx, iy = 310;
    iconG.fillStyle(0x6B4226, 1);
    iconG.fillRect(ix - 30, iy - 25, 60, 45);
    iconG.fillStyle(0xA0522D, 1);
    iconG.fillRect(ix - 35, iy - 32, 70, 10);
    iconG.fillStyle(0xC4884D, 1);
    iconG.fillRect(ix - 22, iy - 20, 4, 35);
    iconG.fillRect(ix + 18, iy - 20, 4, 35);

    // 开始按钮
    const btnW = 220, btnH = 52, btnY = 420;
    const btn = this.add.rectangle(cx, btnY, btnW, btnH, 0x885522, 0.9)
      .setStrokeStyle(3, 0xffcc44)
      .setInteractive({ useHandCursor: true });

    const btnText = this.add.text(cx, btnY, '开 始 游 戏', {
      fontSize: '20px', color: '#fff', fontFamily: 'sans-serif', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);

    btn.on('pointerover', () => { btn.setFillStyle(0xaa6633); btnText.setColor('#ffff00'); });
    btn.on('pointerout', () => { btn.setFillStyle(0x885522); btnText.setColor('#ffffff'); });
    btn.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // 操作说明
    const instructions = [
      'WASD 移动',
      '自动攻击 + 技能自动释放',
      '击杀怪物 → 拾取经验 → 升级选择技能',
      '保护古建四条结构血条不被摧毁',
      '坚持 5 分钟即可获胜',
    ];
    let iy2 = 500;
    for (const line of instructions) {
      this.add.text(cx, iy2, line, {
        fontSize: '13px', color: '#aaa', fontFamily: 'sans-serif',
      }).setOrigin(0.5);
      iy2 += 24;
    }

    // 底部说明
    this.add.text(cx, GAME_HEIGHT - 30, '山西古建保护主题 · 肉鸽割草小游戏', {
      fontSize: '11px', color: '#666', fontFamily: 'sans-serif',
    }).setOrigin(0.5);

    // 点击提示闪烁
    this.tweens.add({
      targets: btnText,
      alpha: 0.6,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });
  }
}
