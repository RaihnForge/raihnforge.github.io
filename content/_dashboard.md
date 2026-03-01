---
title: "Content Dashboard"
draft: true
---

# Content Dashboard

> Open this file in Obsidian with the Dataview plugin installed to see live queries.

## Active Art by Section

```dataview
TABLE length(rows) AS Count
FROM "art"
WHERE !archived AND !draft
GROUP BY file.folder AS Section
SORT Section ASC
```

## Active Game Dev by Section

```dataview
TABLE length(rows) AS Count
FROM "gamedev"
WHERE !archived AND !draft
GROUP BY file.folder AS Section
SORT Section ASC
```

## Recovered Content (Needs Attention)

```dataview
TABLE date AS Date, file.folder AS Section
FROM ""
WHERE recovered = true AND !archived
SORT date DESC
LIMIT 30
```

## Archived Content

```dataview
TABLE date AS Date, file.folder AS Section
FROM ""
WHERE archived = true
SORT date DESC
```

## Recently Modified

```dataview
TABLE file.mtime AS Modified, file.folder AS Section
FROM ""
WHERE file.name != "_index"
SORT file.mtime DESC
LIMIT 20
```

## Featured Content

```dataview
TABLE file.folder AS Section, date AS Date
FROM ""
WHERE featured = true
SORT date DESC
```

## Thin Content (<20 words)

```dataview
TABLE length(file.content) AS Characters, file.folder AS Section
FROM ""
WHERE length(file.content) < 100 AND !draft AND file.name != "_index"
SORT file.folder ASC
```
