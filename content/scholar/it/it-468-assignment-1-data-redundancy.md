---
title: "Data Redundancy and First Normalization: IT 468 Assignment 1"
date: 2023-01-06
course: "IT 468"
course_title: "Projects in Database"
professor: "Wang"
author: "Joshua Keyes"
editor: "Claude (Opus 4.7)"
module: "A01"
image: "https://images.unsplash.com/photo-1633412802994-5c058f151b66?w=1600&q=80&auto=format&fit=crop"
image_credit: "Photo via Unsplash"
category: "IT"
category_label: "Information Technology"
context: "Opening assignment for IT 468. A short diagnostic exercise on a flat file that mixes project assignments with employee contact records: identify the redundancy problems, recommend storage changes to the name and phone fields, name the distinct data topics living in the same table, and propose the new files that would clean it up. Two-page response written in the first week of the quarter, before any of the SQL or transaction-locking work that the course would later put on top of it."
relevance: "This is the foundational reflex the entire IT 468 sequence is built on. Spotting that a single table is doing two jobs, splitting first/last name, stripping formatting characters from a phone column, and pulling assignment data into its own file are exactly the moves that make later normalization, query design, and integrity work possible. The same pattern recurs in every project I build today: Battle-Buddy's recipient and letter tables, Redbook's Person and Address entities, Facsimile's character versus trait separation. Naming the move in week one made it a permanent habit."
connections: "Anchors the IT 468 sequence that ends in the A09 James River Jewelry transaction, rights-matrix, and backup paper (`it-468-a9-james-river-jewelry-db-security.md`). Threads forward into the entity-first modeling I do in HeadCannon, Atlas, and Redbook, into the rights-and-roles work in Battle-Buddy, and into the schema decisions baked into project-tracker's JSONL persistence layer."
tags: ["Database", "Normalization", "Data Redundancy", "Schema Design", "IT 468", "DBMS"]
draft: false
---

The first IT 468 assignment was a diagnostic on a single flat file that mixed project assignments with employee contact records. Four short questions asked us to find the redundancy problems, recommend storage changes to the name and phone columns, identify the data topics living together in the same table, and propose the files that should replace it. The answers below are mine as filed, lightly cleaned for presentation.

## a) Serious Data Redundancy Problems

The PROJ_NAME field carries three unique project names duplicated across rows. PROJECT_NUM has the same shape of problem. Records and fields should be updated to unify the redundancies. All projects should be labeled in one record, and unique JOB codes for individuals should be stored on a different table. The deeper issue is that the topic of the table is too broad: it is asking one file to be the system of record for both projects and employees, and neither set of data ends up clean.

## b) Storage Format of EMP_NAME and EMP_PHONE

EMP_NAME should be split into at least first and last to ensure more efficient query and processing. Sorting on last name, filtering by first name, building proper salutations downstream all become trivial once the field is decomposed, and remain painful while it is a single string.

EMP_PHONE should drop the dash separators and store the number as digits only. If area code is a value worth sorting or grouping on, it should become its own column rather than being parsed back out of a formatted string each time.

## c) Data Themes or Topics in the File

The different data topics are project assignments and employee contact information. These belong in two separate tables.

## d) New Files to Eliminate the Redundancies

One file should be Project Information. The other should be Employee Information. With that split in place, project records can carry their own identifiers without duplicating employee detail, and employee records can carry contact information without dragging along whatever project they were last associated with. The same separation is what every later assignment in the course will build on: clean tables for each topic, foreign-key relationships between them, and locking applied where transactions need to cross more than one of them.
