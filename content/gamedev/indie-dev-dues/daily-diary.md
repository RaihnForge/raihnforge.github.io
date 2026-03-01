---
title: "Daily UP 2011.10.25"
date: 2011-10-26
description: "2011.10.25 - Goal: Generate a screen shot of a game more rooted in the NES era."
tags: ["Design", "E2D", "Game Design", "Indie Game Art", "Indie Game Blog", "Indie Game Design", "Indie Game development", "Indie game Concept Art", "Joshua Keyes", "Raihn", "Speed Painting", "Unchosen Paths", "daily grind", "photoshop"]
aliases:
  - "/gamedev/daily-diary/"
draft: false
recovered: true
---
**2011.10.25 - Goal: Generate a screen shot of a game more rooted in the NES era.**

{{< youtube "M5nyFPNcnq8" >}}

UP E2D – vLog 2011.10.25–all in a days work

[![ed2_screen_shot_reference](http://www.joshuakeyes.us/wordpress/raihn/images/e17c3994a1b5_B4AE/ed2_screen_shot_reference_thumb.jpg "ed2_screen_shot_reference")](http://www.joshuakeyes.us/wordpress/raihn/images/e17c3994a1b5_B4AE/ed2_screen_shot_reference.jpg)

referencing set pieces & reusing textures

[![ed2_screen_shot_no_lights](http://www.joshuakeyes.us/wordpress/raihn/images/e17c3994a1b5_B4AE/ed2_screen_shot_no_lights_thumb.jpg "ed2_screen_shot_no_lights")](http://www.joshuakeyes.us/wordpress/raihn/images/e17c3994a1b5_B4AE/ed2_screen_shot_no_lights.jpg)

Screen shot with no shadows included

[![ed2_screen_shot_baked_in_lights](http://www.joshuakeyes.us/wordpress/raihn/images/e17c3994a1b5_B4AE/ed2_screen_shot_baked_in_lights_thumb.jpg "ed2_screen_shot_baked_in_lights")](http://www.joshuakeyes.us/wordpress/raihn/images/e17c3994a1b5_B4AE/ed2_screen_shot_baked_in_lights.jpg)

Screen shot with baked in shadows

[![ed2_screen_shot_baked_spotlights_lights](http://www.joshuakeyes.us/wordpress/raihn/images/e17c3994a1b5_B4AE/ed2_screen_shot_baked_spotlights_lights_thumb.jpg "ed2_screen_shot_baked_spotlights_lights")](http://www.joshuakeyes.us/wordpress/raihn/images/e17c3994a1b5_B4AE/ed2_screen_shot_baked_spotlights_lights.jpg)

Screen shot with demo ‘engine’ light and shadow spots

[![smart_objects_hero](http://www.joshuakeyes.us/wordpress/raihn/images/e17c3994a1b5_B4AE/smart_objects_hero_thumb.jpg "smart_objects_hero")](http://www.joshuakeyes.us/wordpress/raihn/images/e17c3994a1b5_B4AE/smart_objects_hero.jpg)

Breaking down item pieces via Smart Objects

**Time line:**
0715: Start work diary collect meeting thoughts
0745: Start work on ‘screen shot’
0900: Working on a ‘Hero’ character still. Coming along interestingly
1130: Have a solid hero concept, working on a background/level
1200: Finished 30 min annotating concepts and ideas going through my mind as I work.
15:20: Commenced closing meeting with Chris
16:00: Wrapping up saves and documentation
17:15: Finished up documentation and vlog (exporting to movie). plus about an hour for vlog etc.

Hrs Today: **10** Total SiST: **10**

**NOTES**

**Smart Objects:**  keying out smart objects slowly for things I think will be useful later.  Note that I using smart objects in combination with some other quick tricks should allow smart objects to be more persistent.

- Transform Mesh:  using the transformer will allow for slight perspective shifts.  Remember that using the Warp tool allows for more flexibility, and the modification can be canceled.- Masks:  Masking smart objects means you can put a detail or object behind something else without having to reorder layers.- Paint-over:  with tight paint overs to smooth oddities we should still be able to modify item types and sets without a ton of overhaul work.

**Character Pieces:**  Working on the breaking up the character.  Looks like it will be very fun to have Helm - Torso - Boots as interchangeable armor.  Left and right hand equipment as well.   Going for a NES style game with some of these armor pieces in might be really fun.  I dont know how much it should effect or be included, I do think for the scope of this first official game we add some sort of equipment swapping, even if its purely upgrades.  Working with a simplified seeded images will help us get experience for later game more vast changes.

**Player Actions:**  Thinking about how this hero could play.

- The hero throws axe out, little more range than a basic NES attack, and it come back out (a little like zelda 1 first boomerang with much less range, little like Rygar but much slower). - Your first press of the attack button will throw the axe out, until the axe gets back you will punch out with your fist, doing less damage, and much less range, but you are able to push back enemies.- I feel like most attacks would have a ‘pushback’ rating.  This way combat feels a bit more in your control, and we can have fun by sending more enemies toward the player.  The player will have to keep enemies back with melee punching while the axe is ‘out’ (axe shouldn't be out long, maybe time enough for 2-3 punches).- we can still implement some fun items that give you power ups.  Jump boots etc, but mostly in a linear map, not so much like a Super Metroid feel, but more like Super Mario feel, where sometimes you can go up or down you can find things.


**Quick levels:**  thinking on techniques that will finely tune creating quick levels in our games.  The following is some thoughts on creating these quick levels.  Remember, when I mention ways that we can use assets in the level editor, I will be using them nearly the same way in Photoshop.  If there is at some point implementation in the level editor I feel like it would be a good way for someone to iterate or riff out levels on the fly and get a 70% feel of how that level would play out without extra assets being created.

- **Texture Library:**  Creating a library of repeatable textures will help to quickly flush out environments.  Perhaps at some point we can even put this library into the editor, where you can create the shape primitives and fill them with the repeating textures.- **Repeatable blocks:**  Repeatable blocks would be 64x64 and can represent things like walls and platforms.  When working in the Level editor your could select 64x64 blocks and place them in the grid- **Set Pieces:**  I imagine set pieces to be set block sized objects that can be freely placed anywhere.  This is where the largest amount of background assets would be found.  Much like a Stage set, these objects could be categorized and placed in a library to bring out anytime.  Extra advantages of set pieces will be the ability to maximize memory space in different ways, which may become more relevant when porting to ipad/android platforms.- **Global Backdrops:**  This would be Skies, mists, weather effect assets that can be set in to effect the mood of the environment or level.  would also include reusable far off assets, like a mountain range, a town, or an ocean set.  So, the furthest layer out, and the one just after it could be set right away in a level creation sense.- **Layering in Photoshop:** very similar to the level editor I will have folders representing would could be parallax layers in the game engine.  0 (zero) is always the player’s layer.  -1, -2, etc are behind the player (away fro the viewer) and +1, +2, etc are in front of the hero (toward the viewer)- **Level Considerations:**
            - Remember to user your color wheel!- Consider creating monster sprites the specifically work within the color harmony per level.- **Basic environment asset steps:**
              - Create texture or blocked in object color- Paint over to detail object- Paint Edges of object- Add Vegetation and Wear- Add 1 shadows and highlights layer- **Lighting execution:**
                - I plan to have baked in lighting to the environment stage.  I want to keep this minimal to preserve the 2d/nes style.  I will try to consistently make 1 highlight and 1 shadow layer between layer 0 and layer -1.  This is to not effect sprites- I will make one more layer for laying out real time lighting effects, most time in front of the sprites.  This will demo the interactive lighting.  I think this is a good way to start and keep the lighting system minimal but effective.  As we come across more advance situations we can change it up.  We may want to set up defaults like this in the level editor.
