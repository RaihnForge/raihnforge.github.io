---
title: "Basics of Computer Hardware Components"
date: 2024-11-17
course: "IT 229"
course_title: "Foundations of Information Technology"
professor: "Robert Lupten"
author: "Joshua Keyes"
editor: "Claude (Opus 4.7)"
module: "D06"
category: "IT"
category_label: "Information Technology"
context: "A taxonomy of system software versus application software and an applied look at GPU and SMPS roles in a modern workstation, written from years of hands-on PC building and modification."
relevance: "As an artist, designer, and product manager who lives in Adobe Creative Suite, SolidWorks, AI tooling, and broadcast production, hardware decisions translate directly into hours of my life. Speccing a workstation correctly is the difference between a fluid creative session and a queue of render bars."
connections: "Anchors the broader IT track at CWU by formalizing terminology I had previously used loosely, and feeds into ADMG-side decisions about workstation budgets and team tool standards. Practical companion to the studio's own conversations about AI-assisted pipelines, where GPU capacity is the gating constraint."
tags: ["Computer Hardware", "GPU", "Workstation", "IT 229", "System Software"]
draft: false
---

Having spent years using and modifying computers, I had developed an intrinsic understanding of two primary aspects of the machine: hardware and software. While the distinction was always evident, I had previously given little thought to the nuanced categories of system software and application software, perceiving them as generic terms. The nomenclature and taxonomy of these terms carry far more significance than I had understood.

## System Software vs. Application Software

System software and application software are specific and mutually exclusive terms (Learn Computer Science, 2022). System software refers to programs that interact directly with computer hardware: operating systems, device drivers, and similar low-level tools. These often remain less visible to users because their interface and organizational focus is the machine itself.

Application software runs on top of the system to fulfill user-oriented tasks: design, research, entertainment, production. The distinction can blur in everyday discussion. An application might feature "system" menus or list "system requirements," leading to confusion with application-specific preferences. Even a PC game might include internal "systems," which should more accurately be called game mechanics, reserving the term "system" for software that integrates directly with hardware. Complex applications like Adobe Creative Suite or SolidWorks for 3D printing illustrate the distinction, since their "system" references relate to external hardware integration rather than internal features.

## Functionality of Key Components

### GPU (Graphics Processing Unit)

Graphics Processing Units are specialized processors optimized for handling graphical instructions. Unlike CPUs, which process tasks linearly, GPUs operate on many instructions simultaneously, a feature known as parallelism. This specialization lets CPUs focus on general workloads while GPUs handle rendering and graphical computation.

GPUs have evolved beyond their traditional graphics role. Over the past decade they have been leveraged for physics simulation, real-time audio processing, and, most notably, AI computation. Parallel processing makes them ideal for the compute-intensive workloads associated with AI (Analytics Vidhya, 2020). This versatility has made the GPU indispensable in production environments like AI research and media production (Learn Computer Science, 2022).

### SMPS (Switch-Mode Power Supply)

The Switch-Mode Power Supply delivers clean and efficient power to internal components. Unlike older linear power supplies, which relied on bulky and less efficient transformers, SMPS converts AC power to DC in a lightweight and highly efficient manner (Avnet Inc., n.d.). Modern power supplies often use modular designs, allowing cables to be added or removed as needed for additional flexibility.

## Applied Understanding

Understanding GPU and SMPS roles is critical when evaluating productivity requirements. An office or student workstation, used for research and office productivity software, requires less power and fewer components, and AI-powered enhancements often rely on cloud processing, rendering a high-performance GPU unnecessary. Tasks like 3D animation, video production, and graphic design demand robust hardware to maximize efficiency. The cost difference between a basic workstation (about $400) and a high-performance setup (over $3,000) is significant, and the SMPS must scale with the GPU it powers. Misaligned hardware choices have direct cost implications for individual users and for organizations standardizing their equipment.

## References

Analytics Vidhya. (2020). *Why GPUs are so important for deep learning.*

Avnet Inc. (n.d.). *Switched-mode power supplies: Overview and use cases.*

Learn Computer Science. (2022). *System software and application software.*
