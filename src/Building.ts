import Phaser from 'phaser';
import { StructureType } from './config';

interface StructureState {
  currentHp: number;
  maxHp: number;
  color: number;
  label: string;
}

interface StructureConfig {
  maxHp: number;
  color: number;
  label: string;
}

export class Building {
  scene: Phaser.Scene;
  x: number;
  y: number;
  graphics: Phaser.GameObjects.Graphics;
  structures: Map<StructureType, StructureState>;

  onFailure: (() => void) | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number, y: number,
    structureConfigs: Record<StructureType, StructureConfig>,
  ) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.structures = new Map();

    for (const [key, data] of Object.entries(structureConfigs) as [StructureType, StructureConfig][]) {
      this.structures.set(key, {
        currentHp: data.maxHp,
        maxHp: data.maxHp,
        color: data.color,
        label: data.label,
      });
    }

    this.graphics = this.drawBuilding();
  }

  private drawBuilding(): Phaser.GameObjects.Graphics {
    const g = this.scene.add.graphics();
    g.setDepth(3);

    const x = this.x, y = this.y;

    // 外墙（深棕色矩形）
    g.fillStyle(0x6B4226, 1);
    g.fillRect(x - 50, y - 35, 100, 70);

    // 屋顶 / 屋檐（红褐色，略宽）
    g.fillStyle(0xA0522D, 1);
    g.fillRect(x - 58, y - 45, 116, 14);

    // 内殿（浅棕色）
    g.fillStyle(0x8B7355, 1);
    g.fillRect(x - 18, y - 12, 36, 40);

    // 四根木柱（细长矩形，木色）
    g.fillStyle(0xC4884D, 1);
    g.fillRect(x - 42, y - 30, 6, 60);  // 左 1
    g.fillRect(x - 32, y - 30, 6, 60);  // 左 2
    g.fillRect(x + 26, y - 30, 6, 60);  // 右 1
    g.fillRect(x + 36, y - 30, 6, 60);  // 右 2

    // 屋脊中线
    g.lineStyle(2, 0x8B4513, 1);
    g.moveTo(x, y - 45);
    g.lineTo(x, y - 35);
    g.strokePath();

    return g;
  }

  /** 对指定结构造成伤害 */
  damageStructure(type: StructureType, amount: number): void {
    const s = this.structures.get(type);
    if (!s) return;
    s.currentHp = Math.max(0, s.currentHp - amount);
    this.flashDamage();

    if (s.currentHp <= 0 && this.onFailure) {
      this.onFailure();
    }
  }

  /** 回复指定结构血条（不超过 maxHp） */
  healStructure(type: StructureType, amount: number): void {
    const s = this.structures.get(type);
    if (!s) return;
    s.currentHp = Math.min(s.maxHp, s.currentHp + amount);
  }

  /** 受击闪烁 */
  private flashDamage(): void {
    this.graphics.setAlpha(0.4);
    this.scene.time.delayedCall(120, () => {
      if (this.graphics.active) this.graphics.setAlpha(1);
    });
  }

  /** 获取某个结构的状态 */
  getStructure(type: StructureType): StructureState | undefined {
    return this.structures.get(type);
  }

  /** 是否有任意结构被摧毁 */
  isAnyStructureDestroyed(): boolean {
    for (const s of this.structures.values()) {
      if (s.currentHp <= 0) return true;
    }
    return false;
  }
}
