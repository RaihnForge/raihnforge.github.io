---
title: "mellonOS"
date: 2026-04-20
description: "A windowed desktop environment for a personal development ecosystem. Portal shell that hosts every service as a sovereign app, with its own SDK, themes, and built-in tools."
status: "In Development"
engine: "Vanilla JS / Custom Runtime"
role: "Architect & Developer"
timeline: "2025–Present"
featured: true
icon: "/images/gamedev/icons/mellon-os.svg"
banner_tint: "#A8D0E0"
draft: false
---

mellonOS is the desktop environment I built to run the ecosystem of development tools I live inside. It's not an operating system — it's a shell. A browser-based windowed desktop that treats every service I've written as an app, framed in draggable windows with consistent chrome, themes, and a shared SDK.

## Why Build a Desktop

Running twenty-plus local services across a workstation is noisy. Terminal tabs, bookmark folders, inconsistent UIs, and no shared sense of place. mellonOS gives those tools a home. Everything launches from a global menu bar, lives in a taskbar, respects the same keyboard shortcuts, and talks through the same message-passing layer.

## What It Covers

- **Window management** — draggable, resizable, snap-to-edge, per-app state persistence.
- **App registry** — `mellon.json` declares what apps exist, where they live, what icons they use.
- **PostMessage SDK** — `mellon-sdk.js` gives apps a clean way to talk to the shell and to each other.
- **Built-in tools** — Notepad, Sticky Notes, Chronos (calendar), Amp (audio), TV (retro emulator), About.
- **Themes** — first-class light/dark plus a Tolkien-flavored theme pack.

## Where It's Headed

The near-term work is stabilization and polish on the app registry, SDK, and a handful of core built-ins. Longer-term, mellonOS becomes the default surface for anything I ship as a personal tool — instead of standalone browser tabs, they become apps on a desktop I already know.
