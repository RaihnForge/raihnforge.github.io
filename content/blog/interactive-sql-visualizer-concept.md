---
title: "Interactive SQL Visualizer — a Concept"
date: 2025-08-09
description: "A concept for transforming SQL queries into visual events in a top-down RPG-style town. Every command becomes a building, villager, or piece of infrastructure."
tags: ["Concept", "SQL", "Game Design", "Data Visualization", "RPG"]
image: "/images/wp-imports/visualizer_proto.png"
draft: false
---

This concept transforms SQL queries into visual events in a top-down RPG-style town visualizer. Every SQL command becomes a building, villager, or infrastructure change, creating a living, evolving data town.

## Event Mapping

| SQL Concept         | Visualizer Action                              |
|---------------------|-----------------------------------------------|
| `SELECT ... FROM`   | Spawn a house for each table touched          |
| `WHERE`             | Draw roads to filtered houses                 |
| `JOIN`              | Build walls or bridges between table houses   |
| `GROUP BY`          | Place a market square with stalls             |
| `ORDER BY`          | Align road lights in sequence                 |
| `INSERT`            | Add villagers entering town                   |
| `UPDATE`            | Upgrade a building level                      |
| `DELETE`            | Demolish a structure                          |
| `CREATE TABLE`      | Lay foundations                               |
| `DROP TABLE`        | Collapse ruins with a dust puff               |

## Sample Visualizer Output

![Early prototype sketch](/images/wp-imports/visualizer_proto.png)

The idea grew out of wanting to teach SQL to people who learn visually, and — honestly — out of wanting to see what a query *does to a world* instead of what it does to a result set.
