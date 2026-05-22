---
title: "IT 248 — Web Fundamentals"
date: 2026-05-22
course: "IT 248"
course_title: "Web Fundamentals"
type: "course-summary"
curator: "Joshua Keyes"
compiler: "Claude (Opus 4.7)"
source: "CWU course catalog"
category: "IT"
category_label: "Information Technology"
image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&q=80&auto=format&fit=crop"
image_credit: "Photo via Unsplash"
tags: ["Course Reference", "HTML", "CSS", "Web Development", "IT 248", "AI-compiled"]
draft: false
---

## Course Snapshot

- **Institution.** Central Washington University.
- **Full title.** Web Fundamentals.
- **Catalog description.** Introductory course in web development covering HTML structure, CSS styling, and the core practices of building accessible, standards-based web pages. Paraphrased from the CWU course catalog.
- **Credits.** 4 to 5, depending on catalog year.
- **Prerequisites.** None listed at the introductory level. Some sections recommend prior exposure to file systems and basic computing concepts from IT 101 or equivalent.
- **Designation.** Core requirement in the CWU Information Technology and Administrative Management program. The course is the on-ramp for the web-focused upper-division IT and ITAM electives.
- **Thematic frame.** Building for the open web. The course treats HTML and CSS as the two foundational languages of the public internet and trains students to write both by hand before any framework, content-management system, or builder tool enters the conversation.

## Official Learning Outcomes

Paraphrased from CWU course-catalog and ITAM program materials. On completion, a student should be able to:

1. Write valid, semantic HTML5 documents from scratch, using appropriate structural and content elements.
2. Apply CSS3 to style web pages, including typography, color, layout, and responsive behavior.
3. Implement the CSS box model correctly and use modern layout systems (flexbox, grid) to construct page structures.
4. Build pages that meet baseline web accessibility expectations, including semantic markup, alt text, color contrast, and keyboard navigability.
5. Organize a multi-file web project on disk, manage relative file paths, and publish a working site to a hosted environment.
6. Read and reason about a small body of source code well enough to debug, extend, or modify it.

## How the Course Is Usually Organized

IT 248 is a hands-on lab course. The standard format runs as a sequence of weekly skills-checks delivered through Canvas, with practical assignments that build cumulatively. Most sections do not use a heavy textbook. Lecture is light. The course operates on the assumption that web development is learned by writing code, breaking it, and fixing it.

The term moves through three large arcs. The first arc is HTML structure and document semantics. The second arc is CSS for typography, color, and the box model. The third arc is layout, responsive design, and accessibility. A final project, usually a multi-page personal site or small portfolio, integrates the term's work into a single deliverable that is published to the public web.

Instructors typically expect students to use a code editor like Visual Studio Code, a modern browser with developer tools open, and either a hosting target (GitHub Pages, a CWU-provided host, or a free static-site host) or at minimum a local preview workflow. Some sections introduce basic version control (git) or basic file transfer (SFTP) as part of the deployment unit. Treatment of JavaScript at the introductory level varies by instructor: some sections introduce a small JavaScript exposure unit at the end, others leave JavaScript entirely for the follow-on course.

## Major Content Blocks

### HTML Structure and Semantics

The opening block. Coverage starts with the anatomy of an HTML5 document (doctype, html, head, body), moves through the standard content elements (headings, paragraphs, lists, links, images), and then into the semantic structural elements (header, nav, main, article, section, aside, footer). The block also introduces tables for tabular data, forms and form controls for user input, and the role of attributes in modifying element behavior. Emphasis falls on choosing the right element for the meaning, not the visual effect.

### CSS Selectors, Properties, and the Cascade

The first CSS block. Coverage includes the syntax of CSS rules, the major selector families (type, class, id, attribute, pseudo-class, pseudo-element, combinator), specificity and inheritance, the cascade itself, and the principle of progressive enhancement. Students learn to write CSS in external stylesheets, to organize rules predictably, and to read the browser developer tools to inspect computed styles.

### The Box Model and Typography

The block that builds the visual foundation. Coverage includes the box model itself (content, padding, border, margin), box-sizing behavior, the difference between block and inline elements, display modes, and the typography stack (font families, size, line-height, letter-spacing, web fonts, font loading). Color systems (named colors, hex, rgb, hsl) and basic color theory show up here. Many sections introduce CSS custom properties (variables) in this block.

### Layout: Flexbox and Grid

The block that historically separated IT 248 graduates from students who had only touched HTML in a previous class. Coverage includes the conceptual move from float-based layouts to modern layout systems, the flexbox model (main axis, cross axis, justify-content, align-items, flex-grow, flex-shrink, flex-basis), and the CSS grid model (template columns, template rows, gap, named lines, named areas). Students build progressively more complex multi-column and responsive layouts in lab assignments.

### Responsive Design and Accessibility

The block that ties the course to the realities of the modern web. Coverage includes the mobile-first principle, the viewport meta tag, media queries, fluid typography, responsive images, and the testing discipline of resizing and inspecting layouts at multiple breakpoints. Accessibility runs in parallel: semantic markup as the foundation, alt text for images, sufficient color contrast, keyboard-only navigation, and the principle that accessible markup tends to be better markup for every user.

### Deployment and the Final Project

The closing arc. The final project is typically a small personal site or portfolio, multiple pages, semantically marked up, styled with CSS, responsive across common device widths, and published to a real public URL. The deployment unit covers file organization, relative path discipline, and a hosting target. Many sections use GitHub Pages and introduce just enough git for students to push their site live. The course closes on the experience of having a real public URL that the student wrote, byte by byte.

## Cross-Cutting Concepts

- **Separation of concerns.** HTML carries structure and meaning. CSS carries presentation. JavaScript, when present, carries behavior. The course makes that separation a habit before any framework collapses it.
- **The cascade is the model.** CSS is not a styling language sitting on top of HTML. It is a system of rules that resolve against a tree. Students who internalize the cascade learn to debug CSS instead of guessing at it.
- **Semantics is accessibility is SEO is maintainability.** Choosing the right element for the meaning is not a separate accessibility task. It is the through-line that makes pages accessible, searchable, and easy to revisit a year later.
- **The browser is the runtime.** The course teaches students to live with developer tools open. The browser is not a delivery target; it is the environment the student is programming inside.
- **Standards matter.** Code is written against published specifications maintained by the W3C and WHATWG. Students learn that the platform is documented and that the documentation is the source of truth.
- **Build less, understand more.** The course teaches the platform directly rather than a framework that abstracts the platform. The argument is that framework knowledge dates fast and platform knowledge does not.

## Commonly Used Reference Texts

IT 248 sections rarely require a heavy textbook. The following resources are the standard companions for introductory HTML and CSS work.

- Duckett, Jon, *HTML and CSS: Design and Build Websites.* The visually designed introductory text that has been the dominant student-friendly reference for over a decade.
- Robbins, Jennifer, *Learning Web Design.* The other long-standing introductory reference, used in many ITAM and IT programs.
- Meyer, Eric A. and Estelle Weyl, *CSS: The Definitive Guide.* The deep CSS reference of record for students moving beyond the introductory level.
- Andrew, Rachel, *The New CSS Layout* and *Get Ready for CSS Grid Layout.* The standard short books on modern CSS layout.
- MDN Web Docs (developer.mozilla.org). The de facto reference for HTML, CSS, and JavaScript across the industry. Most IT 248 instructors point students at MDN early and often.
- The W3C and WHATWG HTML Living Standard. The specifications themselves. Rarely required reading at the introductory level but the authoritative source for any question the textbooks and MDN do not resolve.
- web.dev and web.dev/learn. Google's free, structured introductory courses for HTML, CSS, and responsive design. Frequently used as supplementary practice.

## Reading the Field as a Whole

- **The web is the largest deployment target in software.** A working HTML and CSS skill set ships anywhere a browser runs, which is everywhere. The course teaches a skill that crosses platforms, decades, and employer stacks.
- **Hand-coding the basics still matters.** Builder tools and frameworks make hand-coding feel old-fashioned. The opposite is closer to true: the people who can read and write the underlying HTML and CSS are the ones who can debug and extend whatever sits on top.
- **Accessibility is a craft discipline.** Treating accessibility as a checklist applied after the fact is the failure mode. Treating semantic structure as the default is the working practice.
- **Layout is the hard part.** Most introductory-web students get HTML and basic CSS quickly. Layout, particularly responsive layout that holds up under resizing, is where the work lives.
- **Publishing matters.** A site that exists only on the student's laptop has not yet finished the assignment. The course's deployment requirement is the moment students cross from doing schoolwork to making something public.

Related work that reads against this course:

- The [RaihnForge portfolio site](https://github.com/RaihnForge/raihnforge.github.io) itself, a Hugo-based static site built on the same HTML, CSS, and deployment foundations IT 248 teaches.
- [Lark Resorts Software Solutions Plan](/scholar/it/lark-resorts-software-solutions-plan/), the IT 260 step that follows from IT 248's introduction to the technology stack of web-based business software.
- Studio product work in the [products section](/gamedev/), where the skills introduced in IT 248 surface in the public-facing pages for Mecromage, Archkey, MellonOS, My Drink, the TTRPG character generator, and the Forge Framework.

## Curator's Takeaway

*This section is the place for Joshua's own short reflection on the course, what stuck, what surprised, what shows up in the studio practice or product work. To be filled in once he has reviewed the rest of the page.*
