---
title: "Stuxnet and the Olympic Games: The First Kinetic Cyberweapon"
date: 2021-02-18
course: "IT 238"
course_title: "Introduction to Cyberwarfare"
professor: ""
author: "Joshua Keyes"
editor: "Claude (Opus 4.7)"
module: "W7"
category: "IT"
category_label: "Information Technology"
context: "A study paper covering the Stuxnet worm (operation Olympic Games), its target on the Natanz nuclear facility in Iran, the technical anatomy of the four zero-day vulnerabilities it consumed, the man-in-the-middle subroutine that quietly destroyed centrifuges while feeding false telemetry to operators, and the strategic question of whether the United States should disclose zero-day vulnerabilities or hold them in reserve. Closes with a personal note connecting the material to my service in OIF and OEF and to the period when my wife was a linguist working classified missions at Fort Meade."
relevance: "This is the paper from the cyberwarfare course where the academic content collided with my personal history. I was a boots-on-the-ground veteran of Iraq during the timeline that produced this weapon, and my then-wife later worked top secret missions at the agency widely understood to be one of Stuxnet's progenitors. Writing it required me to study the first cyberweapon designed to cause physical destruction while sitting with what that infrastructure had meant for my own life. It is the kind of paper that proves the discipline is not abstract."
connections: "Sits alongside the IT 238 Malware Analysis worksheet (PowerShell payload obfuscation, base64 decoding, IR analysis) and the W9 Scenario-Based Response paper that walks the Cyber Incident Response Cycle and Cyber Kill Chain against two breach scenarios. Threads into the larger ITAM track where security thinking shows up again in the IT 248 web fundamentals stack and the IT 468 database security and recovery work."
image: "https://images.unsplash.com/photo-1762163516269-3c143e04175c?w=1600&q=80&auto=format&fit=crop"
image_credit: "Photo via Unsplash"
tags: ["Cyberwarfare", "Stuxnet", "Olympic Games", "Zero Day", "Critical Infrastructure", "SCADA", "IT 238"]
draft: false
---

## Stuxnet and the Olympic Games

The malware used in the Stuxnet attack, known by its operational name Olympic Games, was a worm, "a type of malware that spreads copies of itself from computer to computer" (Norton, 2019). The worm is notable for many reasons, but the most consequential is that it was the first piece of malware engineered to cause kinetic destruction (Gibney, 2016). The Stuxnet virus has been likened to the achievement of nuclear weapons. While they are substantially different in form, they are similar in that each can cause a scale of degradation and destruction so enormous and catastrophic that it is difficult to predict.

Beyond being the first virus targeted toward physical destruction, Olympic Games made another historic mark. The virus took advantage of four zero-day vulnerabilities at once. This is an illogical design pattern for a typical bad actor motivated by greed. A hacker working for profit would have been leaving money on the table by not using the zero-day vulnerabilities separately, or by selling them individually on the black market (Gibney, 2016). The combined exploitation was unprecedented, and it reinforced the impression that the operator was emphatic about ensuring success (Singer and Friedman, 2013).

The worm had access to the Windows OS kernel by way of digital signing keys stolen from two separate Taiwanese companies. The code was so well written that it worked on operating systems over a decade old (Singer and Friedman, 2013) and had no bugs (Gibney, 2016). Disguised as a device driver, the virus was able to communicate directly with the kernel. The Windows Trusted Driver signature is exceptionally difficult to cultivate, and this fact added to the conclusion that government agencies were its progenitors (Gibney, 2016).

Further setting it apart from other traditional malware was the inclusion of a self-destruct timer set for 2012 (Singer and Friedman, 2013), with one version's expiration date falling just before the presidential inauguration of President Obama (Gibney, 2016). The worm would only allow itself to spread to three computers, atypical behavior for worms, which are usually designed to infect as many systems as possible. This restraint indicated that it was trying to stay under the radar as long as viable (Gibney, 2016). The worm was clearly aimed at a specific target, the WinCC/PCS 7 SCADA control software (Singer and Friedman, 2013).

It targeted very specific hardware as well, an industrial controller manufactured by Siemens, configured to run a series of nuclear centrifuges (Singer and Friedman, 2013). Not just the hardware itself but a cascade array of 984 centrifuges linked together. This was the number and the exact setup for the Natanz nuclear facility in Iran, which was suspected of developing isotopes intended to aid in the development of a nuclear weapon (Singer and Friedman, 2013; Gibney, 2016).

## The Man-in-the-Middle Subroutine

Included in the code was a subroutine dubbed "the man-in-the-middle subroutine." Its purpose was not to shut down the centrifuges. It was to cause small pressure adjustments. Rotor speed fluctuations ruined work, caused failures in production, and broke down the mechanisms over time. Some centrifuges would spin out of control and explode or shatter (Singer and Friedman, 2013).

To evade notice, the virus would also record correctly functioning telemetry data over a fourteen-day period. It would then feed that normalized data back to monitoring overseers' software while the compromising instructions were delivered to the Siemens hardware in order to destroy the centrifuges (Gibney, 2016). Operators looking at their dashboards saw a healthy facility, while the physical plant was being patiently ground down beneath them.

The attack was considered better than explosives, analogous to Chinese water torture (Singer and Friedman, 2013), and it caused rippling effects within Iran's nuclear weapons development program (Gibney, 2016). Interestingly, some sources attest to how successful the attack was in its mission, while others appear to downplay its effect, even spinning it as having invigorated Iran's program and accelerated its cyber capabilities.

## Attribution

Because of the targets, the intent, the sophistication, and the level of access required, the attack is thought to have been perpetrated by both United States agencies (NSA and U.S. Cyber Command) and Israeli intelligence (Mossad) (Singer and Friedman, 2013). Journalistic sources have claimed to be a part of the program and have also claimed involvement in the development of Stuxnet. It is thought that the weapon was deployed to prevent the Israeli government from bombing Iran in order to draw the United States into a kinetic war, with the goal of removing the threat posed by Iran's nuclear program. It is also postulated that the attack might have gone unnoticed if Israel had not overstepped its authority. In a zealous and hasty attempt to breach the air gap of the Iranian nuclear facility, Mossad agents reportedly modified the malware to spread more aggressively, which caused the mass spread and detection of the virus (Gibney, 2016).

## Aftermath and Arms Race

It has been many years since the Stuxnet attack, but it is likely that there have been more such operations and that there will be more still. Beyond the count of attacks, there is likely an ever-growing array of targets and cyberweapons that have been developed and are waiting to be used. There may not be many on the same level as Stuxnet for a long time to come, but it is evident that an arms race is underway. Much like the Cold War era, we are poised on a particularly perilous precipice.

## Should the U.S. Disclose Zero-Day Vulnerabilities?

When considering whether the United States should report zero-day vulnerabilities to vendors, or hold them for leverage over adversaries, there is a great deal of conflicting care and consideration ingrained in the question. The only realistic answer is that, currently, it must be situation dependent. It is a difficult realm we are presuming to preside over. The ethics of right and wrong may project different truths in a scholarly discussion, but at the peak of human sociopolitical evolution, we are stretching traditional understanding and conceptualization.

Competition for survival, for the sake of the perpetuity of culture and continued ethical progress, must be carefully considered. The Greeks were further along in sophistication of human rights, scholarship, and equal political representation in their time, yet they were wiped out by less advanced but more brutish civilizations. This predicament is an ever-swinging pendulum, paramount to the paradigm of progression. In short, vulnerabilities would ideally be communicated immediately. Realistically, the United States is likely not in a position where any edge can be forfeit. Eventually, as protection and confidence grow, the need for offense as the best defense will wane and give way to a better future state.

## Personal Note

Delving into this subject matter happened to be quite emotionally excruciating for me. I am a veteran of the Iraq war (OIF, OEF 1, OEF 2). The imagery, cultural references, and news clips when overviewing the events in the documentary were very difficult. This study brought back a lot of memories and considerations for what was happening in other dimensions of the battlefield at the time. I was in the very intimate position of being the boots on the ground at the time some of the information discussed here was unfolding. I was very focused from a different perspective, but with an intimate relation to the place and the moment. While absorbing this information I recalled briefings and considerations of capabilities and countermeasures as I was making my way up to Baghdad. It is an illuminating venture, but through the darkest mazes of my memories.

Further, my wife joined the Air Force about eight years after my last deployment overseas. She became a linguist stationed at Fort Meade. I have seen the NSA building many times. I have been inside the building and most of the people I knew at the time worked there. About a year and a half ago my wife informed me that she no longer wanted to be married and had cheated on me. I feel a large wedge was driven between us during those years in Maryland. She was working top secret missions that had life and death stakes, and we could not discuss them. We never recovered. This assignment brought me face to face with a lot of uncomfortable memories. I hope that people understand that those of us who honorably serve and protect others often face the ripple effects for a lifetime.

## References

Gibney, A. (Director). (2016). *Zero Days* [Film]. Magnolia Pictures.

Norton LifeLock. (2019). *What is a computer worm and how does it work.* Norton LifeLock. https://us.norton.com/internetsecurity-malware-what-is-a-computer-worm.html

Singer, P. W., and Friedman, A. (2013). *Cybersecurity and cyberwar: What everyone needs to know.* Oxford University Press.
