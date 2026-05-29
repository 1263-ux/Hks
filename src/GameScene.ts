import Phaser from 'phaser';
import {
  MAP_WIDTH, MAP_HEIGHT, GAME_WIDTH, GAME_HEIGHT, GAME_DURATION,
  PLAYER_CONFIG, BUILDING_CONFIG, MONSTER_TEMPLATES,
  SPAWN_DISTANCE, INITIAL_SPAWN_INTERVAL, MonsterType,
} from './config';
import { Player } from './Player';
import { Building } from './Building';
import { Monster } from './Monster';
import { HUD } from './HUD';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private building!: Building;
  private hud!: HUD;
  private monsters: Monster[] = [];

  private gameTime = GAME_DURATION; // 倒计时（秒）
  private spawnTimer = 0;
  private spawnInterval = INITIAL_SPAWN_INTERVAL;
  private isGameOver = false;
  private killCount = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // 世界边界
    this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);

    // 背景
    this.drawBackground();

    // 古建（中央）
    this.building = new Building(
      this,
      BUILDING_CONFIG.x, BUILDING_CONFIG.y,
      BUILDING_CONFIG.structures as any,
    );
    this.building.onFailure = () => this.endGame(false);

    // 玩家（古建下方）
    this.player = new Player(
      this,
      BUILDING_CONFIG.x,
      BUILDING_CONFIG.y + PLAYER_CONFIG.startOffsetY,
      PLAYER_CONFIG.maxHp,
      PLAYER_CONFIG.moveSpeed,
      PLAYER_CONFIG.radius,
      PLAYER_CONFIG.color,
    );

    // 摄像机跟随玩家
    this.cameras.main.startFollow(this.player.sprite, true, 0.09, 0.09);

    // HUD
    this.hud = new HUD(this);

    // 调试键
    this.setupDebugControls();
  }

  update(time: number, delta: number): void {
    if (this.isGameOver) return;

    // 玩家
    this.player.update(delta);

    // 刷怪
    this.spawnTimer += delta;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer -= this.spawnInterval;
      this.spawnMonster();
    }

    // 怪物更新
    for (const m of this.monsters) {
      m.update(time, delta);
    }

    // 清理已死亡怪物
    this.monsters = this.monsters.filter(m => !m.isDead);

    // 玩家死亡检测
    if (this.player.isDead) {
      this.endGame(false);
      return;
    }

    // 倒计时
    this.gameTime -= delta / 1000;
    if (this.gameTime <= 0) {
      this.gameTime = 0;
      this.endGame(true);
      return;
    }

    // HUD 刷新
    this.hud.update(this.player, this.building, this.gameTime);
  }

  // ── 背景 ──
  private drawBackground(): void {
    const bg = this.add.graphics();
    // 草地绿底
    bg.fillStyle(0x2d5a1e, 1);
    bg.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    // 网格
    bg.lineStyle(1, 0x3d6a2e, 0.25);
    const step = 64;
    for (let x = 0; x <= MAP_WIDTH; x += step) {
      bg.moveTo(x, 0); bg.lineTo(x, MAP_HEIGHT);
    }
    for (let y = 0; y <= MAP_HEIGHT; y += step) {
      bg.moveTo(0, y); bg.lineTo(MAP_WIDTH, y);
    }
    bg.strokePath();
    bg.setDepth(0);
  }

  // ── 刷怪 ──
  private spawnMonster(): void {
    const angle = Math.random() * Math.PI * 2;
    const x = MAP_WIDTH / 2 + Math.cos(angle) * SPAWN_DISTANCE;
    const y = MAP_HEIGHT / 2 + Math.sin(angle) * SPAWN_DISTANCE;

    // Phase 1：仅白蚁怪
    const template = MONSTER_TEMPLATES.termite;
    const monster = new Monster(
      this, x, y, template,
      BUILDING_CONFIG.x, BUILDING_CONFIG.y,
      BUILDING_CONFIG.attackRange,
    );

    // 攻击回调：对每个攻击目标结构造成伤害
    monster.onAttack = (m) => {
      for (const structType of m.attackStructures) {
        this.building.damageStructure(structType, m.damage);
      }
    };

    // 死亡回调
    monster.onDeath = () => {
      this.killCount++;
    };

    this.monsters.push(monster);
  }

  // ── 胜负 ──
  private endGame(victory: boolean): void {
    if (this.isGameOver) return;
    this.isGameOver = true;

    const elapsed = GAME_DURATION - this.gameTime;
    const mins = Math.floor(elapsed / 60);
    const secs = Math.floor(elapsed % 60);

    const msg = victory ? '古建守卫成功！' : '古建被毁...';
    const color = victory ? '#ffdd44' : '#ff4444';
    const subtitle = `坚持时间 ${mins}:${secs.toString().padStart(2, '0')}  |  击杀 ${this.killCount}`;

    // 遮罩
    const overlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH, GAME_HEIGHT,
      0x000000, 0.5,
    ).setScrollFactor(0).setDepth(199);

    // 标题
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, msg, {
      fontSize: '42px', color, fontFamily: 'sans-serif',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

    // 副标题
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, subtitle, {
      fontSize: '16px', color: '#ccc',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

    // 重新开始提示
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, '刷新页面重开一局', {
      fontSize: '13px', color: '#888',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
  }

  // ── 调试键（Phase 1 验证用，后续移除） ──
  private setupDebugControls(): void {
    const kb = this.input.keyboard!;

    // 空格：秒杀所有怪物
    kb.on('keydown-SPACE', () => {
      for (const m of this.monsters) {
        m.takeDamage(999);
      }
    });

    // K：扣木质结构 10 点
    kb.on('keydown-K', () => {
      this.building.damageStructure('wood', 10);
    });

    // H：回木质结构 10 点
    kb.on('keydown-H', () => {
      this.building.healStructure('wood', 10);
    });

    // 1-4：直接摧毁指定结构
    kb.on('keydown-ONE', () => this.building.damageStructure('wood', 200));
    kb.on('keydown-TWO', () => this.building.damageStructure('stone', 200));
    kb.on('keydown-THREE', () => this.building.damageStructure('tile', 200));
    kb.on('keydown-FOUR', () => this.building.damageStructure('painting', 200));
  }
}
