---
title: "Internship Week 05: Cloud as Sustainability Strategy"
date: 2024-02-12
course: "IT 490A"
course_title: "ITAM Internship A"
professor: "Dr. James Brown"
author: "Joshua Keyes"
editor: "Claude (Opus 4.7)"
module: "Week 05"
category: "IT"
category_label: "Information Technology"
context: "Week 05 weekly memo from my Winter 2024 ITAM Internship A at an EdTech employer. A short systems-thinking piece on sustainability that argues remote work plus cloud-vendor infrastructure (AWS, Heroku) are themselves a sustainability strategy for a small SaaS organization, and that publishing a standalone ESG or CSR report at our scale would be performative compared to deferring to the vendors actually carrying the infrastructure footprint. Also includes a forward-looking note on ESG management software and device-lifecycle tracking as the next sustainability moves for a maturing organization."
relevance: "This is the original-systems-thinking piece of the internship-memo set. Rather than treating sustainability as a checklist obligation, I work through the actual decision: for a small remote SaaS, the highest-leverage sustainability action is not generating a glossy ESG report at twenty-five employees, it is not running your own data center and not maintaining a physical office. Once you make that call, the next move is instrumenting the choices you did make (device lifecycle, power profiles, vendor ESG inheritance). The same systems-and-leverage lens shows up later in ADMG 285's life-cycle work and in the operational decisions I describe in the IT 490B capstone."
connections: "Pairs with the Week 02 contribution memo (scholar/it/itam-internship-week-02-contribution.md) and the two reflection papers (scholar/it/itam-internship-reflection-a.md, scholar/it/itam-internship-reflection.md). The argument about deferring to vendor ESG until organizational scale justifies an independent report is consistent with the ADMG 285 sustainable-decision-making lens. The asset-inventory discussion in the discussion-board comment is the same admin-team work documented in the Week 02 memo, just one layer further on: device security, MDM configuration, data clearing at end of life, and the human follow-through that makes all of it actually happen."
role_note: "Although my official title during this internship was <strong>Lead Production Designer</strong>, I operated as a <strong>Product Manager</strong> and was treated as such by both peers and leadership. The titling was a mutually understood compensation-banding decision, not a reflection of scope or authority. The weekly memos use 'project manager' the way the original assignment did; in practice the role was closer to acting PM."
image: "https://images.unsplash.com/photo-1762163516269-3c143e04175c?w=1600&q=80&auto=format&fit=crop"
image_credit: "Photo via Unsplash"
tags: ["Internship", "Sustainability", "ESG", "EdTech", "Cloud", "Remote Work", "IT 490A"]
draft: false
---

## 1. Sustainability Initiatives at the Organization

### Energy Reduction Through Cloud and Remote Work

The EdTech employer saves energy through two structural choices: cloud-vendor infrastructure and a fully remote workforce. By running our application on services like AWS and Heroku, we get secure, scalable servers that are partitioned from other tenants' data but still co-located on shared physical hardware. That co-location is the point. Greater efficiency is gained when the server assets in use are kept as loaded and as well-maintained as possible, by experts whose entire job is keeping those machines efficient.

If the company ran its own servers for the application, the power draw and the hardware we could realistically maintain to that same standard would generate an exponentially larger ecological footprint. The same logic applies to office space. A dedicated office building requires its own maintenance, electricity and plumbing, the occasional elevator, overnight heating and lighting to accommodate the occasional late-working employee, and so on. Remote work substitutes dual-purpose home spaces that are already heated and lit for living. The resource imprint required to support the professional workplace drops sharply as a result.

### ESG and CSR Posture

The company has not published an Environmental, Social and Corporate Governance (ESG) report or a Corporate Social Responsibility (CSR) statement. The company started a few years ago as roughly four people working from home and has grown, but not significantly. For a web-app development company at this scale, using industry-standard cloud services as its operational base, publishing a standalone ESG report would be a little arrogant. At present, the public interest in our ecological impact is better served by deferring to the ESG and CSR statements of the vendors whose infrastructure actually carries our footprint.

### Changes That Would Improve Sustainability IT

The company should begin looking into ESG management software and start producing CSR and ESG reports as the organization matures. ESG management tooling would give us better understanding and control over our resource use, and it would let us make informed recommendations to remote employees about power-profile settings for work devices.

The company purchases and supplies employees with devices appropriate to their roles. Those devices are tracked, but we could capture more information about which systems are in use and how efficiently they are running for the role they were issued for. As the organization ages, those devices will need to be replaced. Knowing the right time to retire a device, and the right next use for it after retirement, is both a sustainability move and a business-asset spending decision. The two arguments stack.

## 2. Mid-Internship Evaluation

I have informed my supervisor to watch for the Mid-Internship Evaluation Survey from CWU Career Services.

## 3. Group Discussion Board

### Post

My overall internship experience has been interesting in that this has been my daily job for over a year, and my role continuously evolves. I am technically titled as a project manager, but I also execute many other administrative tasks for the organization. That work has included communicating and managing state compliance for doing business and for maintaining employees across multiple states. The organization is a small remote-only SaaS company with the ability to hire talent across the United States.

When I first started, not much was known about our state-compliance processes. The requirements and practices had to be discovered and implemented from scratch. Along with the rest of our admin team, I led the production of the processes and documentation for this management area. Over the last several weeks, I have been very happy to be able to pass that domain off to capable hands. Learning what worked and what could be improved going forward has been genuinely rewarding.

The greatest lesson is that the work is never really done. Change is constant, particularly when working with governmental agencies, so the idea of a process that will always be perfect is not realistic. What matters is an adaptive process with a strong conceptual foundation and a flexible organizational structure. Overall I feel successful in the sense that I started in a domain with no knowledge and have been able to be substantial assistance to the organization in finding its footing and moving into a tidy, proactive, compliant culture.

### Comment

I have been involved in this kind of corporate asset-inventory management as well. The security details and the potential complications cannot be understated. Clearing data from old devices, purchasing and provisioning replacements, configuring MDM and security assets, and installing the operational software for the new device are each their own small project and each can be tricky. Following up with the human factor is the most time-consuming part for me, and probably the most important one. The work is much more complicated than most people imagine.
