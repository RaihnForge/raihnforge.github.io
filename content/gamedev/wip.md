---
title: "UF: VERG-Delvroid"
date: 2019-03-30
description: "Unchosen Forge: Validity Exercise in Retro Graphics - Delvroid"
tags: ["Game Graphics", "Indie Game Design", "Pixel Art"]
image: "/images/wp-imports/gamedev/colortheory01.png"
draft: false
---

![](/images/wp-imports/gamedev/colortheory01.png)

Unchosen Forge: Validity Exercise in Retro Graphics - Delvroid

---

### Pixel Zeld-A-Like

Zelda Like Dungeon Adventure Art Study. Concept is to create usable assets in the vein of a classic retro Zelda style romp.

For this project I'd like to create a complete set of Dungeon assets in the like of the classic Zelda 1 game. I'm making the pixel graphics 400% larger so that I test the viability of swapping them with HD graphics.

The animations, like-wise will aim to have a one frame redundancy in the pixel version, so that an HD swap would have the extra frame to express more subtle movement that would only likely add confusion in a low resolution animation.

#### Environment

Here are some examples of pixel study of a Zelda style dungeon. Developing pallets for the rooms and floor tiles is an interesting task. The problem of the one point perspective for the classic dungeon room vs the oblique parallel projection foreshortening of later none 3D top-down Zelda games.

![](/images/wp-imports/gamedev/tiletestv04.png)

Conjoining Rooms Tiled Test

![](/images/wp-imports/gamedev/tiletestv04._lroomtmx.png)

Larger Room Tiled Test

I've done some work with testing the concepts of values in order to create separation between 'active objects' in the scene (player, enemy, projectile, etc). This theory leaves a dedicated band of value for the UI, Sprites, and Environment. It's a very rough draft and will need some future tweaking. Particularly the collide-able walls will likely bleed some color into the 'active objects' band.

![](/images/wp-imports/gamedev/colortheory01.png)

Mapping Colors and Values

![](/images/wp-imports/gamedev/roomdemo05.png)

Applying Value Band Concept

#### Sprites

I've begun working with Aesprite in order to better learn the subtleties of pixel animation. My process was first to add in-between frames for Link's retro sprite maintaining his original frames. Next, I developed an original sprite in the same style. I examined my efficiency of structure by creating a second 'skin'my breakdown of layers.

![](/images/wp-imports/gamedev/walk4_pro.gif)

Link at 8 Frames

![](/images/wp-imports/gamedev/walk4_herobluex.gif)

Original Musing

![](/images/wp-imports/gamedev/walk4_herored.gif)

Efficiency Test

For more practice I've developed an enemy sprite skeleton. This one is more difficult because it lacks clothing or armor variation in order to provide broad indicators of proportion to the viewer.

![](/images/wp-imports/gamedev/sprite-0002-1.gif)

Skeleton Enemy Walk

---

## Output Goals

### **A**ssets

- Dungeon Tile-set Asset Pack Variant (2)
- Over-world Tile-set Asset Pack Variant 1
- UI Asset Pack
- Basic Enemies Assets (5)
- Boss Enemies Assets (3)
- Items Asset pack

### Study Findings

- Documentation on methods of production and execution of assets.
- Tiled Demos of above Environmental Assets in order to prove viability
- Video Demo of above assets in order to prove animation viability

---

### HD Zeld-A-Like..

[![Scene02](/images/wp-imports/gamedev/scene02.png)](/images/wp-imports/gamedev/scene02.png)

Break down of possible asset configuration for HD support.
