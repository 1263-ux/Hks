import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, FONT, PALETTE } from './config';
import { genPixelButton } from './ArtGen';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const cx = GAME_WIDTH / 2;

    // 菜单背景（像素羊皮纸纹理）
    if (this.textures.exists('menu_bg')) {
      this.add.image(cx, GAME_HEIGHT / 2, 'menu_bg').setDepth(0);
    } else {
      const bg = this.add.graphics();
      bg.fillStyle(0x1a1a2e, 1);
      bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }

    // 左右朱红柱子装饰
    if (this.textures.exists('pillar')) {
      this.add.image(10, GAME_HEIGHT / 2, 'pillar').setOrigin(0, 0.5).setDepth(1);
      this.add.image(GAME_WIDTH - 10, GAME_HEIGHT / 2, 'pillar')
        .setOrigin(1, 0.5).setDepth(1).setFlipX(true);
    }

    // 标题横幅
    if (this.textures.exists('title_banner')) {
      this.add.image(cx, 155, 'title_banner').setDepth(2);
    }

    // 标题文字
    this.add.text(cx, 155, '山西古建保卫战', {
      ...FONT.huge, color: PALETTE.BRIGHT_GOLD, fontFamily: 'monospace',
      stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(3);

    // 副标题
    this.add.text(cx, 205, 'Shanxi Ancient Architecture Defense', {
      ...FONT.small, color: '#8A8A80', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(3);

    // 古建像素图标
    if (this.textures.exists('building')) {
      const bldImg = this.add.image(cx, 290, 'building').setDepth(2).setDisplaySize(100, 64);
      // 像素边框
      if (this.textures.exists('pixel_border')) {
        this.add.image(cx, 290, 'pixel_border').setDepth(3).setDisplaySize(108, 72);
      }
    }

    // 像素开始按钮
    const btnW = Math.ceil(220 / 2), btnH = Math.ceil(52 / 2);
    const btnKey = 'btn_start';
    genPixelButton(this, btnKey, btnW, btnH, PALETTE.OAK_WOOD, PALETTE.BRIGHT_GOLD);

    const btnY = 400;
    const btnImg = this.add.image(cx, btnY, btnKey + '_normal')
      .setDepth(3).setInteractive({ useHandCursor: true });
    const btnText = this.add.text(cx, btnY, '开 始 游 戏', {
      ...FONT.title, color: PALETTE.BRIGHT_GOLD, fontFamily: 'monospace',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(4);

    btnImg.on('pointerover', () => { btnImg.setTexture(btnKey + '_hover'); btnText.setColor('#FFFFFF'); });
    btnImg.on('pointerout', () => { btnImg.setTexture(btnKey + '_normal'); btnText.setColor(PALETTE.BRIGHT_GOLD); });
    btnImg.on('pointerdown', () => { btnImg.setTexture(btnKey + '_press'); });
    btnImg.on('pointerup', () => { this.scene.start('GameScene'); });

    // 按钮闪烁
    this.tweens.add({
      targets: btnText, alpha: 0.6, duration: 800, yoyo: true, repeat: -1,
    });

    // 操作说明（像素菱形符号）
    const instructions = [
      'WASD 移动',
      '自动攻击 + 技能自动释放',
      '击杀怪物 → 升级选择技能',
      '保护古建四条结构血条',
      '坚持 5 分钟即可获胜',
    ];
    let iy2 = 480;
    for (const line of instructions) {
      // 菱形符号
      this.add.image(cx - 180, iy2, 'icon_diamond')
        .setDepth(2).setDisplaySize(8, 8);
      this.add.text(cx - 168, iy2, line, {
        ...FONT.small, color: PALETTE.PARCHMENT, fontFamily: 'monospace',
      }).setOrigin(0, 0.5).setDepth(2);
      iy2 += 24;
    }

    // 底部说明
    this.add.text(cx, GAME_HEIGHT - 30, '山西古建保护主题 · 肉鸽割草小游戏', {
      ...FONT.tiny, color: '#666666', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(2);
  }
}
