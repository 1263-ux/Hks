import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, StructureType, SkillId, SKILL_CONFIGS, FONT, PALETTE, STRUCT_BAR, LEVELUP_CARD, MonsterType } from './config';
import { Player } from './Player';
import { Building } from './Building';
import { genOrnatePanel, genPixelButton } from './ArtGen';

interface StructBar {
  type: StructureType;
  bg: Phaser.GameObjects.Image;
  fill: Phaser.GameObjects.Image;
  hpText: Phaser.GameObjects.Text;
}

interface LevelUpOption {
  id: SkillId;
  name: string;
  level: number;
  isUpgrade: boolean;
  description: string;
}

export class HUD {
  scene: Phaser.Scene;

  // 4 条古建结构血条
  private structBars: StructBar[] = [];

  // 倒计时
  private timerText!: Phaser.GameObjects.Text;

  // 经验条
  private expBg!: Phaser.GameObjects.Image;
  private expFill!: Phaser.GameObjects.Image;
  private expLabel!: Phaser.GameObjects.Text;

  // 升级面板（动态创建/销毁）
  private levelUpElements: Phaser.GameObjects.GameObject[] = [];
  // 技能弹窗
  private popupElements: Phaser.GameObjects.GameObject[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createStructureBars();
    this.createTimer();
    this.createExpBar();
  }

  // ── 4 条古建血条（屏幕上方居中横排） ──
  private createStructureBars(): void {
    const types: StructureType[] = ['wood', 'stone', 'tile', 'painting'];
    const icons = ['icon_wood', 'icon_stone', 'icon_tile', 'icon_painting'];
    const labels = ['木质', '石质', '砖瓦', '彩绘'];
    const fillKeys = ['bar_fill_wood', 'bar_fill_stone', 'bar_fill_tile', 'bar_fill_painting'];
    const { w: barW, h: barH, gap } = STRUCT_BAR;
    const totalW = 4 * barW + 3 * gap;
    const startX = (GAME_WIDTH - totalW) / 2;
    const y = 8;

    types.forEach((type, i) => {
      const bx = startX + i * (barW + gap);
      const depth = 102;

      // 像素图标 (12×12 像素格 = 24×24 物理px, 缩小显示为 14×14)
      this.scene.add.image(bx + 7, y + barH / 2, icons[i])
        .setOrigin(0, 0.5).setScrollFactor(0).setDepth(depth).setDisplaySize(14, 14);

      // 标签
      this.scene.add.text(bx + 22, y - 2, labels[i],
        { ...FONT.tiny, color: PALETTE.PARCHMENT })
        .setOrigin(0, 0).setScrollFactor(0).setDepth(depth);

      // 血条底板（像素纹理）
      const bg = this.scene.add.image(bx + 22, y + barH / 2 + 4, 'bar_bg')
        .setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);

      // 血条填充（像素纹理，带高光）
      const fill = this.scene.add.image(bx + 22, y + barH / 2 + 4, fillKeys[i])
        .setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);

      // HP 数值
      const hpText = this.scene.add.text(bx + barW / 2 + 22, y + barH / 2 + 4, '',
        { ...FONT.tiny, color: '#FFFFFF' })
        .setOrigin(0.5).setScrollFactor(0).setDepth(102);

      this.structBars.push({ type, bg, fill, hpText });
    });
  }

  // ── 倒计时（右上，像素面板） ──
  private timerPanelBg!: Phaser.GameObjects.Image;
  private timerIcon!: Phaser.GameObjects.Image;

  private createTimer(): void {
    const px = GAME_WIDTH - 90, py = 28;
    // 像素面板背景
    this.timerPanelBg = this.scene.add.image(px + 40, py, 'timer_panel')
      .setScrollFactor(0).setDepth(100);
    // 沙漏图标
    this.timerIcon = this.scene.add.image(px + 8, py, 'icon_timer')
      .setScrollFactor(0).setDepth(102).setDisplaySize(14, 14);
    // 倒计时文字
    this.timerText = this.scene.add.text(px + 36, py, '5:00',
      { ...FONT.large, color: '#FFFFFF' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(102);
  }

  // ── 经验条（底部全宽，像素边框） ──
  private expIcon!: Phaser.GameObjects.Image;

  private createExpBar(): void {
    const h = 12;
    const y = GAME_HEIGHT - 22;
    const fullW = GAME_WIDTH - 24;
    // 像素边框底板
    this.expBg = this.scene.add.image(12, y, 'exp_bar_frame')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(100);
    // 填充（用 bar_fill_exp 纹理，通过 crop 控制宽度）
    this.expFill = this.scene.add.image(12, y, 'bar_fill_exp')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(101);
    this.expFill.setCrop(0, 0, 0, h * 2); // 初始为 0 宽度
    // 经验图标
    this.expIcon = this.scene.add.image(16, y + h / 2, 'icon_exp')
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(102).setDisplaySize(10, 10);
    // 等级/经验文字
    this.expLabel = this.scene.add.text(GAME_WIDTH / 2, y + h / 2, 'Lv.1  0/15',
      { ...FONT.tiny, color: '#FFFFFF' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(102);
  }

  // ── 每帧刷新 ──
  update(player: Player, building: Building, gameTime: number): void {
    // 古建结构血条
    for (const bar of this.structBars) {
      const s = building.getStructure(bar.type);
      if (!s) continue;
      const ratio = s.currentHp / s.maxHp;
      const fullW = STRUCT_BAR.w * 2; // 物理 px（纹理 2x）
      bar.fill.setCrop(0, 0, Math.max(0, Math.floor(fullW * ratio)), STRUCT_BAR.h * 2);
      bar.hpText.setText(`${s.currentHp}/${s.maxHp}`);
      // 低血量闪烁
      if (ratio < 0.3) {
        bar.fill.setAlpha(0.5 + 0.5 * Math.sin(this.scene.time.now * 0.008));
      } else {
        bar.fill.setAlpha(1);
      }
    }

    // 倒计时
    const m = Math.floor(gameTime / 60);
    const s = Math.floor(gameTime % 60);
    this.timerText.setText(`${m}:${s.toString().padStart(2, '0')}`);
    if (gameTime < 30) {
      this.timerText.setColor('#E04040');
      // 危险闪烁：面板 alpha 脉冲
      this.timerPanelBg.setAlpha(0.5 + 0.5 * Math.sin(this.scene.time.now * 0.01));
    } else {
      this.timerText.setColor('#FFFFFF');
      this.timerPanelBg.setAlpha(1);
    }

    // 经验条
    const expRatio = player.level > 0 ? player.exp / player.expToNext : 0;
    const fullW = (GAME_WIDTH - 24) * 2; // 物理 px
    this.expFill.setCrop(0, 0, Math.max(0, Math.floor(fullW * expRatio)), 12 * 2);
    // 快满时脉冲
    if (expRatio > 0.8) {
      const pulse = 0.6 + 0.4 * Math.sin(this.scene.time.now * 0.01);
      this.expFill.setAlpha(pulse);
      this.expLabel.setColor('#FFD700');
    } else {
      this.expFill.setAlpha(1);
      this.expLabel.setColor('#FFFFFF');
    }
    this.expLabel.setText(`Lv.${player.level}  ${player.exp}/${player.expToNext}`);
  }

  // ── 升级选择面板（像素风） ──
  showLevelUpPanel(
    options: LevelUpOption[],
    onSelect: (id: SkillId, isUpgrade: boolean) => void,
  ): void {
    this.hideLevelUpPanel();

    const cardW = LEVELUP_CARD.w, cardH = LEVELUP_CARD.h;
    const cardGap = 24;
    const totalW = cardW * options.length + cardGap * (options.length - 1);
    const startX = (GAME_WIDTH - totalW) / 2;
    const centerY = GAME_HEIGHT / 2 - 20;
    const depth = 300;
    const cardGridW = Math.ceil(cardW / 2);
    const cardGridH = Math.ceil(cardH / 2);

    // 半透明遮罩
    const overlay = this.scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6)
      .setScrollFactor(0).setDepth(depth);
    this.levelUpElements.push(overlay);

    // 标题（像素风）
    const title = this.scene.add.text(GAME_WIDTH / 2, centerY - cardH / 2 - 45, '升级！选择一个技能', {
      ...FONT.title, color: PALETTE.BRIGHT_GOLD, fontFamily: 'monospace',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);
    this.levelUpElements.push(title);

    options.forEach((opt, i) => {
      const cx = startX + i * (cardW + cardGap) + cardW / 2;
      const cardKey = `card_${cardGridW}_${cardGridH}_${i}`;
      // 边框颜色：新技能=玉绿，升级=金色
      const borderColor = opt.isUpgrade ? PALETTE.BRIGHT_GOLD : PALETTE.JADE_GREEN;
      genOrnatePanel(this.scene, cardKey, cardGridW, cardGridH, borderColor, '#3E2510');

      // 卡片背景（像素纹理）
      const bg = this.scene.add.image(cx, centerY, cardKey)
        .setScrollFactor(0).setDepth(depth + 1)
        .setInteractive({ useHandCursor: true });
      this.levelUpElements.push(bg);

      // 类型徽章（像素小标签）
      const tag = opt.isUpgrade ? '技能升级' : '获得技能';
      const tagColor = opt.isUpgrade ? PALETTE.BRIGHT_GOLD : PALETTE.JADE_GREEN;
      const tagBg = this.scene.add.rectangle(cx, centerY - cardH / 2 + 18, 60, 14, 0x1A1410, 0.8)
        .setScrollFactor(0).setDepth(depth + 2).setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(tagColor).color);
      this.levelUpElements.push(tagBg);
      const tagText = this.scene.add.text(cx, centerY - cardH / 2 + 18, tag, {
        ...FONT.tiny, color: tagColor, fontFamily: 'monospace',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 3);
      this.levelUpElements.push(tagText);

      // 技能名
      const nameText = this.scene.add.text(cx, centerY - 32, opt.name, {
        ...FONT.large, color: '#FFFFFF', fontFamily: 'monospace',
        stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2);
      this.levelUpElements.push(nameText);

      // 等级
      const lvText = this.scene.add.text(cx, centerY - 10, `Lv.${opt.level}`, {
        ...FONT.body, color: PALETTE.BRIGHT_GOLD, fontFamily: 'monospace',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2);
      this.levelUpElements.push(lvText);

      // 效果描述
      const desc = this.scene.add.text(cx, centerY + 35, opt.description, {
        ...FONT.small, color: PALETTE.PARCHMENT, fontFamily: 'monospace',
        wordWrap: { width: cardW - 30 }, align: 'center',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2);
      this.levelUpElements.push(desc);

      // 像素按钮
      const btnW = Math.ceil(100 / 2), btnH = Math.ceil(28 / 2);
      const btnKey = `btn_card_${cardGridW}_${i}`;
      genPixelButton(this.scene, btnKey, btnW, btnH, PALETTE.OAK_WOOD, PALETTE.DARK_GOLD);
      const btnY = centerY + cardH / 2 - 30;
      const btnImg = this.scene.add.image(cx, btnY, btnKey + '_normal')
        .setScrollFactor(0).setDepth(depth + 2).setInteractive({ useHandCursor: true });
      this.levelUpElements.push(btnImg);

      // 按钮文字
      const btnText = this.scene.add.text(cx, btnY, '点此选择', {
        ...FONT.body, color: PALETTE.BRIGHT_GOLD, fontFamily: 'monospace',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 3);
      this.levelUpElements.push(btnText);

      // hover 效果
      bg.on('pointerover', () => { bg.setScale(1.02); btnImg.setTexture(btnKey + '_hover'); });
      bg.on('pointerout', () => { bg.setScale(1); btnImg.setTexture(btnKey + '_normal'); });
      btnImg.on('pointerover', () => btnImg.setTexture(btnKey + '_hover'));
      btnImg.on('pointerout', () => btnImg.setTexture(btnKey + '_normal'));
      btnImg.on('pointerdown', () => btnImg.setTexture(btnKey + '_press'));

      // 选择动作
      const handler = () => onSelect(opt.id, opt.isUpgrade);
      bg.on('pointerdown', handler);
      btnImg.on('pointerup', handler);
    });
  }

  hideLevelUpPanel(): void {
    for (const el of this.levelUpElements) el.destroy();
    this.levelUpElements = [];
  }

  // ── 怪物首次遭遇科普弹窗 ──
  showMonsterPopup(monsterType: MonsterType): void {
    const data: Record<MonsterType, { name: string; icon: string; tip: string }> = {
      termite: {
        name: '白蚁怪',
        icon: 'termite',
        tip: '白蚁是木构古建的头号威胁，会蛀蚀梁、柱、斗拱等木构件，严重时可导致建筑坍塌。山西许多古寺因白蚁蛀蚀而面临结构危机。',
      },
      wind: {
        name: '风蚀怪',
        icon: 'wind',
        tip: '风力侵蚀会磨损石质古建表面，尤其对石窟雕刻和彩绘壁画造成不可逆的损害。山西大同云冈石窟长期面临风蚀威胁。',
      },
      acid_rain: {
        name: '酸雨怪',
        icon: 'acid_rain',
        tip: '酸雨加速砖石风化，雨水渗入古建内部会造成木构件腐朽和墙体开裂。山西古建多处于酸雨多发区，防水是保护重点。',
      },
      fire: {
        name: '火焰怪',
        icon: 'fire',
        tip: '火灾是古建最致命的威胁之一，木质结构一旦起火蔓延极快，彩绘壁画也会被高温毁坏。历代不少名寺毁于火灾。',
      },
      freeze_thaw: {
        name: '冻融怪',
        icon: 'freeze_thaw',
        tip: '水渗入砖石裂隙后结冰膨胀，反复冻融会导致墙体崩裂。山西冬季寒冷，冻融是砖石古建的主要病害之一。',
      },
    };
    const info = data[monsterType];
    if (!info) return;

    // 清理旧弹窗
    for (const el of this.popupElements) el.destroy();
    this.popupElements = [];

    const depth = 350;
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2 - 80;
    const w = 340, h = 160;

    // 半透明遮罩（仅弹窗区域外暗）
    const fullOverlay = this.scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.35)
      .setScrollFactor(0).setDepth(depth).setInteractive(); // 点击关闭
    this.popupElements.push(fullOverlay);

    // 弹窗背景
    const panel = this.scene.add.rectangle(cx, cy, w, h, 0x2a1a0e, 0.95)
      .setScrollFactor(0).setDepth(depth + 1).setStrokeStyle(2, 0xffcc44);
    this.popupElements.push(panel);

    // 怪物图标
    const iconY = cy - h / 2 + 30;
    if (this.scene.textures.exists(info.icon)) {
      const icon = this.scene.add.image(cx - w / 2 + 30, iconY + 5, info.icon).setDisplaySize(28, 28);
      icon.setScrollFactor(0).setDepth(depth + 2);
      this.popupElements.push(icon);
    }

    // 标题
    const title = this.scene.add.text(cx, cy - h / 2 + 24, `发现新威胁：${info.name}`, {
      ...FONT.large, color: '#ff6644', fontFamily: 'monospace',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2);
    this.popupElements.push(title);

    // 科普内容
    const tip = this.scene.add.text(cx, cy + 8, info.tip, {
      ...FONT.tiny, color: '#cccccc', fontFamily: 'monospace',
      wordWrap: { width: w - 40 }, align: 'left', lineSpacing: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2);
    this.popupElements.push(tip);

    // 关闭提示
    const closeHint = this.scene.add.text(cx, cy + h / 2 - 18, '(点击任意处关闭)', {
      fontSize: '9px', color: '#666', fontFamily: 'monospace',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2);
    this.popupElements.push(closeHint);

    // 6 秒自动关闭
    this.scene.time.delayedCall(6000, () => {
      for (const el of this.popupElements) {
        if (el.active) el.destroy();
      }
      this.popupElements = [];
    });

    // 点击关闭
    fullOverlay.on('pointerdown', () => {
      for (const el of this.popupElements) {
        if (el.active) el.destroy();
      }
      this.popupElements = [];
    });
  }

  // ── 技能提示弹窗（像素风） ──
  showSkillPopup(skillId: SkillId, level: number): void {
    for (const el of this.popupElements) el.destroy();
    this.popupElements = [];

    const cfg = SKILL_CONFIGS[skillId][level - 1];
    const depth = 350;
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2 - 120;
    const w = 300, h = 150;
    const gridW = Math.ceil(w / 2), gridH = Math.ceil(h / 2);

    // 像素面板背景
    genOrnatePanel(this.scene, 'popup_panel', gridW, gridH, PALETTE.BRIGHT_GOLD, '#1E1810');
    const bg = this.scene.add.image(cx, cy, 'popup_panel')
      .setScrollFactor(0).setDepth(depth)
      .setInteractive().setScale(0.8);
    this.popupElements.push(bg);

    // 入场动画：scale 0.8 → 1.0
    this.scene.tweens.add({ targets: bg, scale: 1, duration: 150, ease: 'Back.easeOut' });

    // 标题
    const title = this.scene.add.text(cx, cy - h / 2 + 22, `获得技能：${cfg.name}`, {
      ...FONT.body, color: PALETTE.BRIGHT_GOLD, fontFamily: 'monospace',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);
    this.popupElements.push(title);

    // 效果描述
    const descLines = [
      `CD ${cfg.cooldown}s，伤害 ${cfg.damage}`,
      cfg.range > 0 ? `范围 ${cfg.range}` : '',
      cfg.repairAmount > 0 ? `回复${cfg.repairType.join('/')} ${cfg.repairAmount} 点` : '',
    ].filter(Boolean).join('，');
    const desc = this.scene.add.text(cx, cy, descLines, {
      ...FONT.small, color: PALETTE.PARCHMENT, fontFamily: 'monospace',
      wordWrap: { width: w - 40 }, align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);
    this.popupElements.push(desc);

    // 小知识
    const tips: Record<string, string> = {
      wood_reinforce: '木构古建需要定期检查梁、柱、斗拱等构件。',
      stone_repair: '石质古建面层风化是常见病害，需定期修补。',
      waterproof: '防水是古建保护的关键，雨水渗漏会造成严重损害。',
      insect_control: '木构古建需要注意白蚁和蛀虫防治。',
      painting_restore: '彩绘壁画受潮后颜料层会起甲、剥落。',
    };
    const tip = this.scene.add.text(cx, cy + h / 2 - 30, tips[skillId] ?? '', {
      ...FONT.tiny, color: '#8A8A80', fontFamily: 'monospace',
      wordWrap: { width: w - 40 }, align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);
    this.popupElements.push(tip);

    // 关闭图标 + 文字
    const closeIcon = this.scene.add.image(cx, cy + h / 2 - 12, 'icon_close')
      .setScrollFactor(0).setDepth(depth + 1).setDisplaySize(10, 10);
    this.popupElements.push(closeIcon);
    const closeHint = this.scene.add.text(cx + 12, cy + h / 2 - 12, '点击关闭', {
      ...FONT.tiny, color: '#666666', fontFamily: 'monospace',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(depth + 1);
    this.popupElements.push(closeHint);

    // 2 秒自动关闭
    this.scene.time.delayedCall(2500, () => {
      for (const el of this.popupElements) { if (el.active) el.destroy(); }
      this.popupElements = [];
    });

    // 点击关闭
    bg.on('pointerdown', () => {
      for (const el of this.popupElements) { if (el.active) el.destroy(); }
      this.popupElements = [];
    });
  }
}
