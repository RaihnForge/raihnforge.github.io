---
title: "Narya"
date: 2026-06-22
description: "A Windows system-tray watcher that shows which apps are using which GPU - discrete vs integrated - ranked by minute-by-minute average utilization and grouped by app kind."
status: "Released"
engine: "PowerShell / Windows"
role: "Creator & Developer"
timeline: "2026"
featured: false
image: "/images/gamedev/narya.png"
icon: "/images/gamedev/icons/narya.svg"
banner_tint: "#E2603E"
tags: ["Developer Tool", "Windows", "PowerShell", "GPU", "Open Source"]
draft: false
---

**Narya - the Ring of Fire** is a tiny Windows system-tray tool that answers a question laptops keep hidden: *which apps are actually using my real GPU, and how hard?*

Modern laptops ship with two graphics chips - a power-hungry discrete GPU (NVIDIA / AMD / Intel Arc) and an integrated one baked into the CPU. Windows quietly decides, per app, which one runs. That decision is invisible, and "is the expensive GPU even being used?" is a question you can usually only answer by digging through Task Manager. Narya makes it an ambient glance.

## What it does

- **Tray icon** shows the discrete GPU's live load as a traffic-light dot - green when idle, amber when busy, red when it's pinned.
- **Double-click** for a clean per-GPU breakdown: each GPU (discrete first, then integrated) with its load, VRAM, and the apps using it - ranked by **minute-by-minute average** and grouped into Games / Browser / Communication / Creative / Dev Tools / System.
- **Right-click** for a quick summary plus shortcuts to Windows Graphics Settings and the NVIDIA Control Panel.
- **Install / uninstall manager** to start and stop the watcher and toggle run-at-login, with live status.

## Works on any machine

Narya is **vendor-agnostic**. It enumerates every GPU from the Windows DirectX registry and reads per-app usage from the standard Windows GPU performance counters - the same source Task Manager uses - so it works the same on NVIDIA, AMD, and Intel hardware. No vendor SDK required; `nvidia-smi` is used only as an optional temperature readout when an NVIDIA card is present.

## Built deliberately small

One PowerShell file, no build step, no install, no background service - just Windows primitives and a tray icon. Copy the folder, double-click `Narya Manager.cmd`, and you're running.

## Get it

Narya is open source under the MIT license.

**[→ Source & downloads on GitHub](https://github.com/RaihnForge/narya)**
