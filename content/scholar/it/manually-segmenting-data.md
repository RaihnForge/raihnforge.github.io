---
title: "Manually Segmenting Data"
date: 2021-05-22
course: "IT 165"
course_title: "Seeing Through the Data"
professor: "Dr. Susan Rivera"
author: "Joshua Keyes"
editor: "Claude (Opus 4.7)"
module: "M8A"
image: "https://images.unsplash.com/photo-1762163516269-3c143e04175c?w=1600&q=80&auto=format&fit=crop"
image_credit: "Photo via Unsplash"
category: "IT"
category_label: "Information Technology"
context: "A manager-facing memo that takes a raw sales spreadsheet, groups the columns into four operational categories (order identification, geographic location, shipping, and sales figures), and proposes the analyses each category unlocks. Includes a pivot table on average profit by region and year, a skeptical read of the data's integrity, and a documented list of actions taken on the worksheet."
relevance: "Segmenting and stress-testing data is a daily move in my professional work, from Kelvin survey rollups to audience analytics for broadcast and creative campaigns. The instinct this paper exercises, asking whether the numbers in front of you actually represent reality before you build conclusions on them, is the difference between a useful dashboard and an expensive opinion."
connections: "Sets up later IT 165 work on visualization and dashboards by forcing the structural decisions to happen first: what is an entity, what is an attribute, and which columns belong together. The same logic carries into the portfolio's HeadCannon and Project Tracker data models, where entity-first thinking governs how records are grouped before any view is rendered."
tags: ["Data Segmentation", "Pivot Tables", "Excel", "IT 165", "Data Quality"]
draft: false
---

I received a sales worksheet and was asked to organize it so the columns would actually support reporting and decision making. The exercise had two parts: group the fields into categories that match how the business uses them, and run a first pass of analysis that surfaces what the data can and cannot tell us. The memo below captures the segmentation, the pivot table conclusions, and the questions the dataset raised along the way.

## Information Organization

I divided the worksheet into four categories that follow the natural flow of information through a sales operation: order identification, geographic location, shipping information, and sales figures.

Order identification is paramount in tracking activity. When a complaint surfaces, the order ID is what unlocks the chain of custody. The organization may need to increase training around poorly handled orders, build new efficiencies, or simply give customer support representatives the records they need to resolve issues. Without a clean order key, every other category becomes harder to use.

Geographic information narrows performance by location. Paired with sales figures, it informs decisions on management direction, advertising spend, and supply allocation for underperforming areas. The data starts to answer where, not just what.

Shipping information, especially during COVID times when sales are increasingly online and deliveries, deserves close attention. The category exposes the extra costs that online fulfillment generates, the leverage we might gain at higher volume, and the case for alternative shipping facilitators or even internal delivery departments in dense regions.

Sales figures are the category the organization's sustainability rides on. Paired with the other three, they show where the business is effective, where it is lacking, and where responsiveness to customers is translating into profitability. These numbers shape future action.

## Further Analysis

I built a pivot table to show what the segmented data can produce. It reports average profit by region, segmented by year, and can be filtered by quarter. I excluded 2017 because the dataset only covers January for that year, which would distort the comparison. From the remaining years, the South region is by far the least profitable, and 2016 is the weakest year of the three on record.

Two caveats need to live alongside that conclusion. Records for some years appear incomplete, with months missing from the underlying rows. I am also skeptical of the Product Base Margin and Profit columns. There are order IDs showing massive profit alongside negative Product Base Margin, which should not be possible if the two figures describe the same transaction. Either the columns are not measuring what their names suggest, or the dataset was generated without enforcing the relationship between them.

## Actions on the Data Set

Below are the actions I took on the worksheet, kept in a list so a reviewer can audit each step and either keep, revise, or reverse it.

- Applied Freeze Pane so the header row stays visible while scrolling.
- Conditional formatting on the sales column to flag positive numbers in green.
- Conditional formatting with icons on Product Base Margin to surface higher than average performing margins.
- Filter options enabled on every table header. Filtered to the WA region as a sanity check.
- Added a second worksheet, "Additional Figures," for the derived views.
- Regrouped headers from left to right into a more logical segmentation:
  - Order Data: Row ID, Order ID. The Row ID column was displaying as 1900s-era dates because of an incorrect format; I reverted it to a number, which appears to have been the original intent.
  - Geographic Data: Region, State, Postal Code.
  - Shipping Data: Ship Date, Ship Mode, Order Priority, Order Quantity, Shipping Cost.
  - Sales Figures: Unit Price, Discount, Sales, Profit, Product Base Margin.
- Attempted to reconcile the numbers, but the inconsistencies suggest the dataset is randomly generated rather than drawn from real operations. A profitable order should not show a negative Product Base Margin.
- Formatted Product Base Margin as a percentage.
- Added the pivot table and accompanying chart using Profit, Quarters, Years, and Region, with 2017 filtered out for the reasons noted above.

## What This Exercise Reinforced

The structural work has to happen before the visual work. Grouping the columns into four categories made the pivot table almost write itself, and it also made the data quality issues legible. If the four categories had stayed scrambled across the worksheet, the negative-margin-but-positive-profit rows would have looked like noise instead of a flag worth raising to leadership.
