---
title: "Mecromage"
image: "/images/gamedev/mecromage/hero-cavern.png"
hero_pan: true
date: 2013-03-02
description: "A 2D metalvania set in a world of dark mechanical fantasy. The longest creative thread in my portfolio: begun in 2009 at the indie studio I co-founded, and being rebuilt now through Archkey Studio."
status: "In Progress"
engine: "Phaser 4 / AI-Assisted Pipeline"
role: "Producer, Artist & Game Director"
timeline: "2009–Present"
featured: true
icon: "/images/gamedev/icons/mecromage.svg"
banner_tint: "#B9A7E0"
aliases:
  - "/gamedev/unchosen-paths/"
  - "/gamedev/indie-dev-dues/"
draft: false
---

The design philosophy draws on four classics: Final Fantasy I, Castlevania, Zelda, and Doom. To that lineage it adds frost magic, a grappling hook, dynamic environmental interactions, and a metal soundtrack.

You play Kochay, a Frostwolf cleric and half arcane construct. She wakes alone in a ruined cave with no memory of how she arrived. From that first moment the story turns outward: what became of her, what became of her order, what became of her realm, and at the center of it all, what became of her father, the Mecromage Tyrant, whose apparent corruption she sets out to understand.

The rebuild is happening now under [Archkey Studio](/gamedev/archkey/), on an AI-assisted Phaser 4 pipeline.

## The Concept

The name combines "Necromancer" and "Mech." The game lives at the seam between the mechanical and the arcane. Heavy armor and industrial ruins on one side. Ice, mana, and ritual on the other. Creatures that blur the line between built and born. Dark fantasy with a machine edge.

{{< figure src="/images/wp-imports/gamedev/tilesscene04b.png" alt="Kochay in a columned stone hall, environmental study from Mecromage." caption="Environmental study · the seam between mechanical and arcane." loading="lazy" >}}

The creative vision has never been the bottleneck. The art direction, the mood, and the world have been intact for over a decade. What was missing was a production pipeline capable of carrying it across the finish line.

## Kochay, the Frostwolf Cleric

A Frostwolf cleric and half arcane construct. Trained in frost magic and acrobatic combat. Kochay wakes in a ruined cave with no memory of how she arrived, then steps out into a realm she once knew but no longer recognizes. The story unfolds from that first breath: what became of her, of her order, and of her realm. Gradually, of her father, the Mecromage Tyrant, whose corruption is the central mystery she is following.

She fights with a set of cleric relics: a shield, a chain mace, a grappling hook, and her frost magic. Acrobatic movement lets her read each room and decide how to reshape it.

{{< figure src="/images/gamedev/mecromage/sketch-recent.jpg" alt="Pencil sketch of Kochay swinging her chain mace toward a wolf-creature in a graveyard." caption="Kochay in motion · 2026 combat study." loading="lazy" >}}

## Core Mechanic: Free Traversal, Reactive Environments

Mecromage is built on a guiding design rule. Traversal should feel free, and the world should feel reactive. The spine of that system is the pairing of grapple and frost. Fire and soul energy round out the environmental palette.

{{< figure src="/images/wp-imports/gamedev/plate.png" alt="Grizlow's Roost level plate, an isometric study of a Mecromage level." caption="Grizlow's Roost level plate · a study in how focal objects shape a room." loading="lazy" >}}

- **Grapple is the verb.** Thrown in any direction, it engages whatever it touches, called a Focal Object. The interaction follows the object's type: pull toward it, swing from it, climb along it, or sling it as ammunition. The whole game is conjugated around this verb.
- **Frost is the change agent.** Kochay's frost magic does not deal damage. It changes state. Freezing an enemy or a surface converts it into a grappleable object, which is how frost feeds the grapple loop.
- **Fire and soul energy.** The other agents in the environmental palette, alongside frost.

Taken together, these elements turn every room into a sandbox of state changes, and traversal into something closer to a conversation with the environment than a sequence of jumps.

### The Freezing System: Three States

- **Thawed.** The default. Every enemy, every pool of water, every host object in the world starts here.
- **Frosted.** First hit of frost damage. The target slows, and if left alone, it gradually thaws back. A second hit pushes it further.
- **Frozen.** Fully stopped. A frozen host becomes a Modified Object: temporary, grappleable, and shatterable, until it thaws back to its host form.

Frost is temporary, and everything thaws. Kochay can also reverse a Modified Object back to its host on demand with a fire utility, which keeps every tactical choice grounded in real time.

### Focal Objects: Every Frozen Thing Becomes a Tool

A Focal Object exists in two forms. The permanent Primary version is an indestructible alloy, often embedded in walls. The temporary Modified version emerges when Kochay freezes a living host. Each form has its own silhouette and its own verb.

- **Anchor Point.** Coffin or crystal shape. Pull to it, then drop. Host: medium enemies. Falls and shatters on impact for area damage.
- **Through Point.** Stabby cross. Pull toward and through it, flying out the far side. Host: the Mana Vortex.
- **Grapple Strip.** A row of teeth. Pull to it and climb. Host: water. Freeze deep water and its surface becomes a climbable ice wall.
- **Boulder.** Small sphere. Sling it into enemies or surfaces to shatter. Host: small enemies such as Flyers and Crawlers.
- **Swing Point.** Horseshoe. Swing across hazards, then release with jump. Host: ceiling hangers such as Spawners and Hanging Bats.

Modified objects can be broken by a Shield Bash, a Pip 3 attack, or a high speed impact. Some deal area damage on the break.

## The Moveset

{{< figure src="/images/wp-imports/gamedev/herowolf_breakdown_thumb2.png" alt="Hero Wolf breakdown sheet, Kochay's steel-wolf transformation design study." caption="Hero Wolf breakdown · the steel-wolf transformation at the top of the moveset." loading="lazy" >}}

- **Chain Mace.** Repeated slices build Pips on a 0 to 3 scale, extending range and then power. Charge attacks branch by direction: Uppercut, Chop, Lariat, 360 Twirl.
- **Shield.** Block in any direction, even airborne. Shield plus Attack fires the Freeze Shot, small or charged large. Run plus Shield triggers the Shield Bash.
- **Grapple.** Thrown omnidirectionally. The hub verb of the moveset. Upgrade paths add damage while grappling, and area damage at the endpoint.
- **Pip System.** A momentum economy. Consecutive strikes earn pips, and pausing loses them. Pip 3 unlocks shatter grade power.
- **Health and Alloy.** Three hearts. Collect Alloy. 30 alloy forms a metallic shield icon that absorbs one hit, capped at heart capacity.
- **Wolf Mode.** Maximize armor patches and Kochay becomes a steel wolf for 20 to 30 seconds: melee that petrifies, and a grapple that becomes a grab and throw.
- **Mobility.** Run for higher jumps, Slide, Backflip, Kip (an omnidirectional air dash), Shield Surf on water, and Ground Slam.

## The World

One floating island, crowned by the Mecromage's castle, the Mecropolis. The structural design draws from four games.

{{< figure src="/images/gamedev/mecromage/world-map.png" alt="Three-quarter perspective map of the Mecromage realm, showing Emerald Forest, Blood Mountain, and the Forgotten Kingdom." caption="The realm of Mecromage · Emerald Forest, Blood Mountain, and the Forgotten Kingdom." loading="lazy" >}}

{{< zone-tiles
  "/images/gamedev/mecromage/zone-emerald-forest.png|Emerald Forest"
  "/images/gamedev/mecromage/zone-forgotten-kingdom.png|Forgotten Kingdom"
  "/images/gamedev/mecromage/zone-blood-mountain.png|Blood Mountain"
>}}

- **Final Fantasy I.** A single mysterious world to traverse, with a sense of mythic scale and reverence for what the player does not yet understand.
- **Castlevania II.** Explore outward from a central town, and return to upgrade. Wilderness hides dungeons.
- **Zelda.** Dungeon keys gate progress. A focused, purposeful weapon set, instead of a bloated arsenal.
- **Doom.** Colored keys make non linear layouts legible, pacing the player without hand holding.

The map has four parts. A Central Hub, with a plaza, altars for save and teleport, upgrade rooms, and two wilderness paths leading outward. Traversal Paths, the wilderness routes dotted with altars and dungeon entrances. Dungeons, where the player finds colored keys, goes deeper, defeats the boss, and claims a triquetra sigil. And the Mecromage Castle, unlocked by placing all the sigils. Past the Reaper lies the Mecromage, and the final reckoning.

Navigation runs on Altars (save and teleport, some broken and restorable with the frost mechanic) and threshold doorways (scene-shift entries with a signature zoom-fade transition).

## Four Pillars of Fun

Every component of Mecromage serves one or more pillars. Each level type answers to a single primary pillar.

- **Combat.** Read the enemy type and choose the optimal technique. Many encounters have a right answer.
- **Exploration.** Out from the hub into unmapped wilderness, where the Sage and the secrets reward the curious.
- **Traversal.** Grapple, swing, climb, slide. Movement itself is a source of joy and challenge.
- **Puzzle.** Dungeons as locks. Frost and grapple interactions become spatial puzzles.

---

## The Arc: 2009 to Present

The project has unfolded across three chapters. A studio that built beautifully but could not ship. A stretch of dormant years. A rebuild on new terms.

{{< figure src="/images/recovered/stagedemo.png" alt="In-game stage demo from the Unchosen Paths era." caption="Stage demo from the Unchosen Paths era · the foundation the rebuild is built on." loading="lazy" >}}

### Chapter One: Unchosen Paths (2009–2018)

Unchosen Paths was the two person studio I co-founded in 2009 with a guitarist known for Castlevania remixes. The name captured the philosophy: take roads that are not mapped out yet. I served as producer, artist, game director, and software designer, because two person studios require everyone to do everything.

Mecromage became the flagship project. From 2013 onward it absorbed the majority of our creative energy, supported by exploratory work in environment studies, character concepts, and tool development. The studio formally wound down in 2018 without shipping.

### Chapter Two: The Dormant Years (2018–2023)

Work continued, but only sporadically and only solo. The tooling of the era had not closed the velocity gap, and the project remained too large for one person at the old pace. The vision was too strong to abandon, so the work waited while the lessons, and the tools, compounded.

### Chapter Three: Archkey Studio and the AI-Assisted Pipeline (2024–Present)

The path forward is not a new engine or a new art style. It is a new production model. [Archkey Studio](/gamedev/archkey/) is a learning-first studio built around AI-assisted development, with Mecromage as its reason to exist. Foundational assets are being ported forward, and a playable vertical slice is the next tangible milestone.

---

## Why It Didn't Ship, and Why It Will Now

The original failure was never about craft. It was about velocity, scope, and the discipline of finishing.

### What Worked

- **The craft held up.** Concept art, sprites, and environments. The visual foundation still looks right a decade later.
- **The problem solving was real.** UI resolution, dynamic 2D platforms, tile systems, and asset pipelines. Genuine engineering whose lessons carry forward.
- **The partnership was productive.** Two complementary skill sets kept the project alive across many iterations.

### The Postmortem

- **Ambition outran velocity.** A metroidvania's scope is enormous, and every hour produced roughly one hour of output. The math never closed.
- **Tooling of the era.** Every asset was hand made, every system hand coded. No force multipliers were available.
- **Project versus process blurred.** Making a game, which has an end, was run like running a studio, which is continuous. That blurring stretched the timeline until the runway ran out.
- **The Four C's gate, in hindsight.** We moved past comfort and confidence and into competence without ever establishing a sustainable delivery rhythm. [The Forge Framework](/gamedev/forge-framework/) names this pattern explicitly, as the primary failure mode of over ambition.

### The New Model

Code generation, AI-assisted art workflows, procedural tooling, and rapid Phaser 4 prototyping collapse the hours to output ratio. A solo developer with AI leverage can operate at something close to small team velocity, and can ship.

- **Scope becomes tractable.** Tileset variations, behavior trees, level iterations, and animation fills. Weeks of work explored in hours.
- **The craft stays human.** AI handles drafts, variations, and boilerplate. The creative decisions, what feels right for this world, remain with the director.
- **Every prototype is a study.** Time boxed builds that answer a single question each. Studies compound, and nothing is throwaway: U2DTS, NDLZ, Phaser experiments.
- **Pipeline first.** Tools and automation are first class deliverables alongside content, so the next project does not take another decade.

The rebuild runs under explicit rules designed to prevent the failure modes of the Unchosen Paths era: a project versus process distinction, Four C's gating, and the FORGE cycle. Production discipline is built in from the start.

---

## Current Status

Active development is underway under the Archkey pipeline. Foundational assets are being ported to the modern substrate, the design document is living and evolving, and a playable vertical slice is the next tangible milestone. For the first time in the project's history, the math on getting there closes.

The work begun in 2009 will be finished.

*Raise your hammer to the storm.*

---

{{< wordmark src="/images/gamedev/mecromage/title.png" alt="Mecromage" >}}

## Explore More

A handful of devlogs and demos showing the world in motion. Speedpaints, animation studies, and gameplay clips spanning the long arc of the project.

{{< youtube-cards
  "KlvPs8ble8Y|Devlog 01"
  "ZXUX9TNHaRY|Devlog 02"
  "bjgVuIQCDVQ|Devlog 03"
  "JXKLIoJjPgY|Devlog 04"
  "XrV6_LVH1gM|Devlog 05"
  "TlDkAGqsVcs|Devlog 06"
>}}

---

## Development Log

The devlog below spans the full arc: Unchosen Paths daily diaries from 2011, concept and asset work from 2013 through 2017, the dormant years, and the Archkey-era rebuild posts. Earlier entries are preserved as the historical record, and the newest work sits at the top.
