---
title: "Risk Management Plan: Nurse Workstation Refresh"
date: 2022-04-10
course: "ADMG 475"
course_title: "Executing Project Management 2"
author: "Joshua Keyes"
editor: "Claude (Opus 4.7)"
module: "Module 3"
category: "ADMG"
category_label: "Administration & Management"
context: "Notional client project for coursework purposes. 'Central Medical Center' and 'Dr. Phylicia Patterson' are fictional names assigned in the assignment brief; the risk identification methodology, register, qualitative matrix, and response planning below are my own applied work. This is the ADMG 475 Module 3 Risk Management Plan deliverable for the cumulative nurse workstation OS refresh project that started in ADMG 474."
relevance: "ADMG 475 Module 3 is the point in the program where I had to stop treating risk as a vague horizon and start writing it down as named items with probability, impact, owners, triggers, and response strategies. The Risk Register is the artifact, the qualitative matrix is the prioritization tool, and the response plan is what makes the register actually do work during execution. Naming Technology (software compatibility), Legal (regulatory compliance), and Business (space limits) as the top three for this project gave me a feel for how cleanly the PMBOK categorization (technology, team, scope, business, economy, competition) translates into something the team can actually plan around."
connections: "Direct companion to the Master Project Management Plan for the same project. Extends the risk vocabulary first introduced in ADMG 374's communication-and-risk paper, where I argued that most project risk is really a communication failure that nobody named in time, the risk register is the document that breaks that pattern. Threads forward into the ADMG 476 crisis paper, where the same risk discipline gets tested at the higher end of the impact scale, and into the Forge Framework project pillar docs, where every active project carries its own running register."
image: "https://images.unsplash.com/photo-1586936893354-362ad6ae47ba?w=1600&q=80&auto=format&fit=crop"
image_credit: "Photo via Unsplash"
tags: ["Project Management", "Risk Management", "Risk Register", "Qualitative Risk Matrix", "ADMG 475"]
draft: false
---

*Notional client project. "Central Medical Center" and "Dr. Phylicia Patterson" are fictional names from the assignment brief. The risk identification approach, register, matrix, and response strategies below are my own applied work, presented here lightly edited from the course deliverable.*

## Risk Management Plan

Risk management is a necessary aspect to review due to the potential aspects of the project that may deviate to varying degrees from expected outcomes. These possibilities are primarily associated with the core constraints of the project, and the degree of deviation from those constraints is what constitutes the risk factor. The core constraints, in priority order, are time, scope, quality, and cost.

To identify risks the Project Manager conducted expert interviews, risk assessment meetings, and historical reviews of similar projects. These are effective, industry-standard strategies for identifying risk. Risks are qualified and prioritized through the risk register and then continuously monitored. Risk is mitigated and avoided by following the contingencies identified per item on the register.

The overall risk of the project is low. The most common sources of known risk are Technology, Team, Scope, Business, Economy, and Competition. Unknown risks are factored into the project's budget and timeline as a 5 percent buffer, based on the overall risk of the project being assessed as low.

The top three risks identified for this project are:

1. **Technology: software compatibility.** The Windows 10 Master Load must integrate cleanly with the existing application ecosystem on floors 3 to 5.
2. **Legal: meeting of regulations.** Any change to clinical workstation configuration must remain in compliance with applicable medical and data regulations.
3. **Business: space limits.** Per-floor execution requires physical workspace to stage, swap, and validate stations without disrupting active clinical operations.

Management of risk and the Risk Register is the responsibility of Project Manager Keyes, and contingencies are approved by Project Sponsor Dr. Patterson.

## Risk Register

The Risk Register is the primary working document for risk on the project. Each row represents an identified risk, with its source category, likelihood, impact, qualitative score, owner, trigger, and response strategy.

Likelihood and impact are each rated on a 1 to 5 scale (1 = Very Low, 2 = Low, 3 = Medium, 4 = High, 5 = Very High). Score is Likelihood multiplied by Impact (range 1 to 25). Scores at 15 and above are treated as High priority; 8 to 12 as Medium; below 8 as Low.

| ID | Risk | Source Category | Likelihood | Impact | Score | Owner | Trigger | Response Strategy |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :--- |
| R-01 | Software compatibility break with clinical applications after OS upgrade | Technology | 4 | 5 | 20 | IT Coordinator | Application fails validation against Master Load image | Mitigate. Build full application ecosystem regression suite into Stage A Master Load testing. Hold per-floor cutover until floor-level test passes. |
| R-02 | Regulatory non-compliance from configuration change | Legal | 2 | 5 | 10 | Project Manager | Compliance review flags drift from required configuration | Mitigate. Validate Master Load against current regulatory configuration baseline before Stage A approval. Document configuration at each floor handoff. |
| R-03 | Insufficient physical workspace to stage and swap stations on active floors | Business | 3 | 4 | 12 | Nursing Coordinator | Floor unable to release rooms or cart bays during scheduled window | Mitigate. Coordinate with Nursing Coordinator to schedule per-floor execution during the floor's lowest-load shift. Stage in adjacent unused rooms when available. |
| R-04 | Network integration failure after upgrade | Technology | 3 | 5 | 15 | IT Coordinator | Workstation fails to authenticate or reach required services post-upgrade | Mitigate. Include network integration as a Stage A validation step. Hold a dedicated Stage C Networking Validation milestone before Sponsor sign-off. |
| R-05 | Security protocol drift on upgraded stations | Technology | 3 | 5 | 15 | IT Coordinator | Security policy scan flags non-conforming station | Mitigate. Validate security protocols as a Stage C deliverable. Re-image any non-conforming station from the approved Master Load. |
| R-06 | Loss of trained team member during execution | Team | 2 | 3 | 6 | Functional Manager | Team member departs or is reassigned mid-stage | Accept and monitor. Functional Managers maintain a small bench of cross-trained staff; slack time in the schedule absorbs short-term loss. |
| R-07 | Scope creep from adjacent initiative work | Scope | 4 | 3 | 12 | Project Manager | Change requests arrive that exceed Phase 1 scope | Avoid. Route every petition through the Change Control Board. Defer out-of-scope items to follow-on projects. |
| R-08 | Hardware failure on legacy stations during upgrade | Technology | 3 | 3 | 9 | IT Coordinator | Station fails hardware diagnostic prior to imaging | Accept and reserve. Pull from reserve budget for spot hardware replacement when failure is identified. |
| R-09 | Budget variance beyond the +/- 0.5 corrective threshold | Business | 2 | 4 | 8 | Project Manager | CPI exceeds +/- 0.5 in weekly EVM report | Mitigate. Weekly CPI / SPI reporting with corrective planning at +/- 0.2 and Sponsor approval at +/- 0.5. Reserve fund draws require Sponsor authorization. |
| R-10 | Schedule slippage past 8 percent on critical path | Scope | 3 | 4 | 12 | Project Manager | Critical path task exceeds 8 percent slippage versus baseline | Mitigate. Weekly schedule reporting. Slippage at or above 8 percent escalates to Sponsor for express approval per the Schedule Management Plan. |
| R-11 | Stakeholder communication gap producing late surprises | Team | 3 | 3 | 9 | Project Manager | Stakeholder raises a previously unsurfaced concern late in execution | Mitigate. Communications Matrix defines channel and cadence per role. PM holds bimonthly Sponsor check-ins and monthly all-hands status. |
| R-12 | Vendor or supply delay on replacement hardware | Economy | 2 | 3 | 6 | IT Coordinator | Ordered hardware misses planned arrival date | Accept and monitor. Order critical material ahead of Stage B floor windows. Reserve absorbs minor cost impact of expedited shipping if required. |

## Qualitative Risk Matrix

The qualitative matrix below positions each registered risk by likelihood and impact. It is the visual companion to the Risk Register and the primary tool used in CCB and weekly status discussions to communicate where the project's attention should go.

| Likelihood \ Impact | 1 Very Low | 2 Low | 3 Medium | 4 High | 5 Very High |
| :--- | :---: | :---: | :---: | :---: | :---: |
| 5 Very High | | | | | |
| 4 High | | | | | R-01 |
| 3 Medium | | | R-08, R-11 | R-03, R-07, R-10 | R-04, R-05 |
| 2 Low | | | R-06, R-12 | R-09 | R-02 |
| 1 Very Low | | | | | |

**Reading the matrix.** R-01 (software compatibility) sits at the top-right and is the most urgent item. The Stage A Master Load process is structured around it. R-04 and R-05 (network and security validation) are next; both are addressed by dedicated Stage C validation milestones. R-02 (regulatory compliance) carries low likelihood but maximum impact, justifying the early Master Load compliance check. R-03, R-07, and R-10 (workspace, scope creep, schedule slippage) are the medium-tier items that day-to-day execution governance is built to catch.

## Risk Response Planning

Responses are categorized using the standard PMBOK strategies for negative risks: Avoid, Transfer, Mitigate, and Accept. The register lists the chosen strategy per risk; the notes below summarize how each strategy is applied across this project.

**Avoid.** Used for scope creep (R-07). The Change Control Board exists in part to make avoidance enforceable, every out-of-scope petition is routed away from Phase 1 and parked for follow-on projects.

**Mitigate.** The dominant strategy on this project. Mitigation is built directly into the schedule: Stage A Master Load is the mitigation for R-01, R-02, R-04, and R-05; Stage C Validation milestones convert the mitigation into a checkpoint; the Communications Matrix mitigates R-11; the EVM and schedule thresholds mitigate R-09 and R-10.

**Accept.** Used for items where the cost of active mitigation outweighs the expected impact, R-06 (team loss), R-08 (legacy hardware failure during imaging), and R-12 (vendor delay). The 5 percent reserve buffer and the schedule slack absorb these.

**Transfer.** No formal risk transfer is used on this project. The work is performed by internal staff and uses on-site equipment, so there is no external party to transfer risk to. If hardware procurement scope expanded, vendor warranty terms would become the transfer mechanism.

**Contingency reserves.** A 5 percent buffer is built into the project's budget and timeline against unknown risks. The Project Manager may request reserve funds when accepted or emergent risks materialize, subject to Project Sponsor authorization.

## Monitoring and Control

The Risk Register is reviewed and updated by the Project Manager at every weekly status meeting and at every bimonthly Sponsor check-in. New risks identified by team members or stakeholders are submitted via the same change-request channel used for scope and schedule petitions, and are added to the register after Project Manager review.

Risks that escalate (likelihood or impact rises, or a trigger fires) are reported immediately to the Project Sponsor regardless of meeting cadence. Risks that close (the triggering window has passed or the response has neutralized the item) are marked closed in the register but retained for the Lessons Learned closeout deliverable.

## Closeout

At project close, the Risk Register feeds the Lessons Learned document. Each item is reviewed for whether the chosen response strategy was the right one, whether the likelihood and impact ratings were accurate in hindsight, and whether the trigger fired as expected. This is the artifact the next phase of the Nurse Workstation Refresh Initiative will inherit, and the discipline carries forward into every project that follows it.
