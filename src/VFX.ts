/**
 * VFX — 战斗手感特效模块
 * 命中反馈、死亡爆破、升级庆祝、碎屑粒子、屏幕震动
 */
import Phaser from 'phaser';

export class VFX {
  // ═══════════════════════════════════
  // 粒子工具
  // ═══════════════════════════════════

  /** 发射一组彩色粒子爆散 */
  static burst(
    scene: Phaser.Scene, x: number, y: number,
    count: number, colors: number[], speed = 120, size = 3, lifetime = 400,
  ): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = speed * (0.5 + Math.random());
      const c = colors[Math.floor(Math.random() * colors.length)];
      const p = scene.add.circle(x, y, size, c, 1);
      p.setDepth(40);
      scene.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * spd * (lifetime / 1000),
        y: y + Math.sin(angle) * spd * (lifetime / 1000),
        alpha: 0,
        scale: 0.2,
        duration: lifetime,
        ease: 'Power2',
        onComplete: () => p.destroy(),
      });
    }
  }

  /** 冲击波扩散圈 */
  static shockwave(scene: Phaser.Scene, x: number, y: number, radius: number, color: number, duration = 300): void {
    const ring = scene.add.circle(x, y, 5, color, 0);
    ring.setStrokeStyle(3, color, 0.8);
    ring.setDepth(35);
    scene.tweens.add({
      targets: ring,
      radius: radius,
      alpha: 0,
      duration,
      ease: 'Power2',
      onUpdate: () => {
        ring.setStrokeStyle(2, color, ring.alpha * 0.8);
      },
      onComplete: () => ring.destroy(),
    });
  }

  /** 屏幕震动（强度随伤害递增） */
  static shake(scene: Phaser.Scene, intensity = 0.005, duration = 80): void {
    scene.cameras.main.shake(duration, Math.min(intensity, 0.02));
  }

  /** 镜头短暂闪白 */
  static flash(scene: Phaser.Scene, duration = 60): void {
    scene.cameras.main.flash(duration, 255, 255, 255, false);
  }

  /** 浮动数字 */
  static floatText(
    scene: Phaser.Scene, x: number, y: number,
    text: string, color = '#ffffff', size = '14px',
  ): void {
    const t = scene.add.text(x + (Math.random() - 0.5) * 16, y - 8, text, {
      fontSize: size, color, fontFamily: 'monospace',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(50);
    scene.tweens.add({
      targets: t, y: t.y - 36, alpha: 0, duration: 700, ease: 'Power2',
      onComplete: () => t.destroy(),
    });
  }

  // ═══════════════════════════════════
  // 战斗反馈
  // ═══════════════════════════════════

  /** 怪物受击反馈 */
  static hitMonster(scene: Phaser.Scene, x: number, y: number, damage: number): void {
    // 白碎屑
    VFX.burst(scene, x, y, 3, [0xffffff, 0xcccccc], 60, 2, 200);
    // 伤害数字（大伤害红色）
    const color = damage >= 20 ? '#ff4444' : damage >= 10 ? '#ffaa44' : '#ffffff';
    const size = damage >= 20 ? '16px' : '13px';
    VFX.floatText(scene, x, y, `${Math.round(damage)}`, color, size);
    // 微震
    if (damage >= 15) VFX.shake(scene, 0.002, 50);
  }

  /** 怪物死亡 */
  static killMonster(scene: Phaser.Scene, x: number, y: number, color: number): void {
    // 主爆散
    VFX.burst(scene, x, y, 10, [color, 0xffffff, 0xffdd88], 150, 3, 500);
    // 冲击波
    VFX.shockwave(scene, x, y, 40, color, 350);
    // 微震
    VFX.shake(scene, 0.003, 60);
    // 白色闪光
    const flash = scene.add.circle(x, y, 8, 0xffffff, 1);
    flash.setDepth(39);
    scene.tweens.add({
      targets: flash, scale: 4, alpha: 0, duration: 150,
      onComplete: () => flash.destroy(),
    });
  }

  /** 升级庆祝 */
  static levelUp(scene: Phaser.Scene, x: number, y: number): void {
    // 金色粒子螺旋上升
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const dist = 20 + Math.random() * 30;
      const tx = x + Math.cos(angle) * dist;
      const ty = y + Math.sin(angle) * dist - 30 * Math.random();
      const p = scene.add.circle(x, y, 3, 0xffdd44, 1);
      p.setDepth(45);
      scene.tweens.add({
        targets: p,
        x: tx,
        y: ty - 20,
        alpha: 0,
        scale: 0.3,
        duration: 800,
        delay: i * 30,
        ease: 'Power2',
        onComplete: () => p.destroy(),
      });
    }
    // 冲击波
    VFX.shockwave(scene, x, y, 80, 0xffdd44, 500);
    // 闪光
    VFX.flash(scene, 80);
    VFX.shake(scene, 0.004, 100);
  }

  // ═══════════════════════════════════
  // 技能特效
  // ═══════════════════════════════════

  /** 木构加固：木梁冲击波 */
  static skillWood(scene: Phaser.Scene, x: number, y: number, angle: number): void {
    // 木屑拖尾
    for (let i = 0; i < 5; i++) {
      const bx = x - Math.cos(angle) * (20 + Math.random() * 30);
      const by = y - Math.sin(angle) * (20 + Math.random() * 30);
      const p = scene.add.circle(bx + (Math.random() - 0.5) * 10, by + (Math.random() - 0.5) * 10, 2, 0xc4884d, 1);
      p.setDepth(20);
      scene.tweens.add({
        targets: p, alpha: 0, y: p.y - 10, duration: 300 + Math.random() * 200,
        onComplete: () => p.destroy(),
      });
    }
  }

  /** 石材修补：石粉碎屑 */
  static skillStone(scene: Phaser.Scene, x: number, y: number, radius: number): void {
    VFX.burst(scene, x, y, 12, [0x999999, 0xaaaaaa, 0x888888], 130, 2, 400);
    VFX.shockwave(scene, x, y, radius, 0x999999, 350);
  }

  /** 防水封护：水纹多层 */
  static skillWater(scene: Phaser.Scene, x: number, y: number, radius: number): void {
    for (let r = 0; r < 3; r++) {
      const ring = scene.add.circle(x, y, 5, 0x4488cc, 0);
      ring.setStrokeStyle(2, 0x4488cc, 0.6 - r * 0.15);
      ring.setDepth(35);
      scene.tweens.add({
        targets: ring,
        radius: radius * (0.6 + r * 0.2),
        alpha: 0,
        duration: 400 + r * 150,
        delay: r * 60,
        ease: 'Power2',
        onComplete: () => ring.destroy(),
      });
    }
    // 水滴粒子
    VFX.burst(scene, x, y, 8, [0x4488cc, 0x66aadd, 0xaaddff], 80, 2, 500);
  }

  /** 防虫处理：药雾 */
  static skillInsect(scene: Phaser.Scene, x: number, y: number, radius: number): void {
    // 雾团粒子缓慢扩散
    for (let i = 0; i < 15; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.random() * radius * 0.8;
      const p = scene.add.circle(x + Math.cos(a) * d * 0.3, y + Math.sin(a) * d * 0.3, 4, 0x44cc44, 0.3);
      p.setDepth(18);
      scene.tweens.add({
        targets: p,
        x: x + Math.cos(a) * d,
        y: y + Math.sin(a) * d,
        alpha: 0,
        scale: 2,
        duration: 1000 + Math.random() * 500,
        ease: 'Sine.easeOut',
        onComplete: () => p.destroy(),
      });
    }
  }

  /** 彩绘修复：颜料溅射 */
  static skillPaint(scene: Phaser.Scene, x: number, y: number): void {
    const colors = [0xff4488, 0xff8800, 0xffee00, 0x44ff88, 0x4488ff, 0xcc44ff];
    VFX.burst(scene, x, y, 8, colors, 100, 3, 500);
    VFX.shockwave(scene, x, y, 30, 0xff66cc, 280);
  }

  /** 普攻命中 */
  static boltHit(scene: Phaser.Scene, x: number, y: number): void {
    VFX.burst(scene, x, y, 2, [0x88ccff, 0xffffff], 40, 1.5, 150);
  }

  // ═══════════════════════════════════
  // 古建特效
  // ═══════════════════════════════════

  /** 古建受击碎屑 */
  static buildingHit(scene: Phaser.Scene, x: number, y: number, type: string): void {
    const colorMap: Record<string, number[]> = {
      wood: [0xc4884d, 0xa07040, 0x8b6914],
      stone: [0x999999, 0x888888, 0xaaaaaa],
      tile: [0xa0522d, 0x8b4513, 0xb0603d],
      painting: [0x9966cc, 0x8855bb, 0xaa77dd],
    };
    const colors = colorMap[type] ?? [0xcccccc];
    VFX.burst(scene, x, y, 5, colors, 90, 2, 350);
    VFX.shake(scene, 0.005, 100);
  }

  /** 古建回血粒子 */
  static buildingHeal(scene: Phaser.Scene, x: number, y: number): void {
    for (let i = 0; i < 6; i++) {
      const p = scene.add.circle(x + (Math.random() - 0.5) * 60, y + (Math.random() - 0.5) * 40, 2, 0x44ff88, 0.8);
      p.setDepth(42);
      scene.tweens.add({
        targets: p, y: p.y - 20, alpha: 0, duration: 600,
        onComplete: () => p.destroy(),
      });
    }
  }
}
