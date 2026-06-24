---
title: "Grima's Bane"
date: 2026-06-22
description: "A Chrome extension that shuts the short-form feed — it blocks Shorts and Reels on YouTube, Facebook, Instagram, and TikTok by default, with a one-click per-site toggle when you actually want them."
status: "Released"
engine: "Chrome Extension (MV3)"
role: "Creator & Developer"
timeline: "2026"
featured: false
image: "/images/gamedev/grimas-bane.png"
icon: "/images/gamedev/icons/grimas-bane.svg"
banner_tint: "#C41212"
tags: ["Developer Tool", "Chrome Extension", "Productivity", "Open Source"]
draft: false
---

**Grima's Bane** is a small Chrome extension that closes the short-form video feed before it can open you.

Short-form video is engineered to be involuntary — the scroll arrives before the decision does. The name is the whole thesis: Grima Wormtongue whispered King Théoden into passivity while Rohan rotted around him. The feed is that whisper in your ear — *stay, scroll, don't act.* This is its bane. The tool moves the default so that opening Shorts or Reels becomes a deliberate act, never a reflex — without ever nagging or blocking the rest of the web.

## What it does

- **Hides the feed by default** on YouTube (Shorts shelves + sidebar), Facebook and Instagram (Reels cards + nav), and stands a full block curtain in front of TikTok — the whole site *is* the feed.
- **Redirects short-form URLs** — open a `/shorts/<id>` link and you land on the normal `/watch` page instead; `/reels/` bounces home. The redirects key off URL shape, so they stay stable even as the sites reshuffle their markup.
- **One toolbar popup** with a master switch plus a toggle per site. Turning a feed back on is one click and zero guilt — the tool is a switch, not a scold.

## How it works

Blocking is **on by default**. CSS hides short-form content at `document_start` with zero JavaScript wait, so there's never a flash of Shorts that then vanishes — it was simply never there. The script only ever *un-hides*, adding an allow-flag when you toggle a site off. A lightweight navigation watcher keeps it working across single-page-app route changes.

## Built deliberately small

No build step, no dependencies, no background worker, no network calls, no analytics. The icon and store-zip scripts use only the Node standard library. The only state that exists is a handful of per-site on/off booleans in `chrome.storage.sync` — nothing leaves the browser.

## Get it

Grima's Bane is open source under the MIT license. Load it unpacked today, or watch for the Chrome Web Store listing.

**[→ Source & install on GitHub](https://github.com/RaihnForge/grimas-bane)**

**[→ Landing page](https://raihnforge.github.io/grimas-bane/)**
