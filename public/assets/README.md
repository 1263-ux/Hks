# 外部精灵图目录

把 AI 生成的 spritesheet PNG 放到这个目录。

## 文件命名规范

```
player-sheet.png       ← 玩家 4方向行走（32×48px/帧, 16帧）
termite-sheet.png      ← 白蚁怪（20×20px/帧, 4帧）
wind-sheet.png         ← 风蚀怪（28×28px/帧, 4帧）
acid_rain-sheet.png    ← 酸雨怪（24×28px/帧, 4帧）
fire-sheet.png         ← 火焰怪（32×32px/帧, 6帧）
freeze_thaw-sheet.png  ← 冻融怪（34×34px/帧, 4帧）
building-sheet.png     ← 古建寺庙（96×56px/帧, 5段损毁）
exp_orb-sheet.png      ← 经验球（10×10px/帧, 4帧辉光）
```

## 工作流

1. 用 Holopix AI 生成精灵 → 下载 PNG
2. 用 Aseprite/lospec.com 清理杂色 + 映射到 palette.gpl
3. 导出 PNG-8 索引色 → 放到这个目录
4. 刷新浏览器 → 游戏自动使用 spritesheet（带动画）
5. 如果 PNG 不存在 → 自动回退到 Canvas2D 纹理（零影响）

## 格式要求

- PNG-8 索引色（256 色调色板）
- 硬边缘（Nearest Neighbor 缩放）
- 单行水平排列（Horizontal Strip）
- 帧之间间距 0px
- 透明背景
