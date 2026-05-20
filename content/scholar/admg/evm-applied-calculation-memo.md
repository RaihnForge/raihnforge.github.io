---
title: "Earned Value Management Applied"
date: 2023-04-23
course: "ADMG 477"
course_title: "Project Performance Reporting"
author: "Joshua Keyes"
editor: "Claude (Opus 4.7)"
module: "L2"
category: "ADMG"
category_label: "Administration & Management"
context: "A Lesson 2 calculation memo for ADMG 477 walking the full Earned Value Management workflow against a small project case: BAC of $4,000, 17 months elapsed against a 48-month plan, and 35% actual completion. The memo derives Planned Value, Actual Cost, and Earned Value, then layers on Schedule and Cost Variance, SPI and CPI, EAC, ETC, VAC, and TCPI to read the project's health and forecast what efficiency the remaining work needs to absorb."
relevance: "EVM is the language project performance reporting actually speaks. This memo is where I went from understanding the formulas in the abstract to running them as a coherent diagnostic, the same way a status report uses them in the field. The TCPI conclusion (the project needs to find 4% efficiency to land on the original BAC) is the kind of one-number-tells-the-story output that justifies the whole framework. The accompanying Excel sheet I built to run the calculations is the artifact I'd still hand a small-project owner today."
connections: "Direct companion to the ADMG 477 Tuckman teaming paper, which holds the people side of project performance while this one holds the numbers. Pairs with the ADMG 476 Managing Crisis Projects paper and the ADMG 479 capstone reflection where the same status-reporting instincts get applied to higher-uncertainty work. Threads back into the ADMG 285 sustainability and decision-making track because EVM is ultimately a decision tool, not a reporting tool."
image: "https://images.unsplash.com/photo-1586936893354-362ad6ae47ba?w=1600&q=80&auto=format&fit=crop"
image_credit: "Photo via Unsplash"
tags: ["Earned Value Management", "EVM", "Project Performance", "SPI", "CPI", "TCPI", "EAC", "Project Reporting", "ADMG 477"]
draft: false
---

**TO:** ADMG 477, Lesson 2
**FROM:** Joshua Keyes
**DATE:** April 23, 2023
**SUBJECT:** Earned Value Management Applied

## Information Gathering

To begin the project status evaluation, we must determine Planned Value (PV). This is done by taking the Budget At Completion (BAC), which is $4,000, and multiplying it by the completed (planned) percentile. The completed (planned) percentile is 17 months divided by 4 years (48 months). We can see that the project is close to being on track as it sits at 35.42% planned completion. This means that the Planned Value (PV) currently is $1,416.67.

By adding all expenditures so far on the project, it has been determined that the Actual Cost (AC) of the project is $1,500.

Multiplying the completed (actual) percentile by the Budget At Completion (BAC), the Earned Value (EV) becomes evident. The completion of the project is determined by evaluation of each task as 0%, 50%, or 100% completed and aggregated (Roseke, 2020). This project's evaluation has been conducted and is reported to be at 35% actual completion. The resulting Earned Value (EV) is $1,400.

## Metrics Essential for Small Projects

Schedule Variance (SV) is determined by subtracting the Planned Value (PV) from the Earned Value (EV), giving us -$16.67. The negative amount means that our project is ever so slightly behind schedule (Roseke, 2020).

Finding the Cost Variance (CV) is accomplished by subtracting Actual Cost (AC) from Earned Value (EV). Subtracting the Actual Cost (AC) of $1,500 from the Earned Value (EV) of $1,400 reveals that the Cost Variance (CV) of the project is -$100.00. This means the project is currently over budget by $100.

## Additional Status Indicators

Determining the Schedule Performance Index (SPI) is accomplished by taking the Earned Value (EV) and dividing it by Planned Value (PV). $1,400.00 divided by $1,416.67 results in 0.988. This is less than one, therefore we have done less work than we'd planned for and our project is behind schedule.

The Cost Performance Index (CPI) helps us understand the project's cost efficiency. Dividing the Earned Value (EV) of $1,400.00 by the Actual Cost (AC) of $1,500.00 yields 0.933 and confers that efficiency thus far is lacking slightly.

Taking account of current variances, we can Estimate At Completion (EAC) by taking the Actual Cost (AC) of $1,500.00 plus Budget At Completion (BAC) of $4,000 and subtracting the Earned Value (EV) of $1,400.00. The result is $4,100.00.

The Estimate To Complete (ETC) is determined by taking the Estimate At Completion (EAC) and subtracting the Actual Cost (AC). The expected cost to complete the remainder of the project is $2,600.00.

This leaves the project with a Variance At Completion (VAC) of -$100.00 by evaluating the Budget At Completion (BAC) of $4,000.00 and subtracting the Estimate At Completion (EAC) of $4,100.00.

To-Complete Performance Index (TCPI) helps us establish the amount of efficiency the project will need to find in order to complete to its original plan. This is done by taking the result of Budget At Completion (BAC) minus Earned Value (EV) and dividing it by the result of Budget At Completion (BAC) minus Actual Cost (AC). The solution of ($4,000 - $1,400.00) ÷ ($4,000 - $1,500.00) = 1.04. For the project to become aligned with the original project plan, it will need to find 4% efficiencies.

## Summary of Calculated Values

| Metric | Value |
| :-- | :-- |
| Budget At Completion (BAC) | $4,000.00 |
| Planned Value (PV) | $1,416.67 |
| Actual Cost (AC) | $1,500.00 |
| Earned Value (EV) | $1,400.00 |
| Schedule Variance (SV) | -$16.67 |
| Cost Variance (CV) | -$100.00 |
| Schedule Performance Index (SPI) | 0.988 |
| Cost Performance Index (CPI) | 0.933 |
| Estimate At Completion (EAC) | $4,100.00 |
| Estimate To Complete (ETC) | $2,600.00 |
| Variance At Completion (VAC) | -$100.00 |
| To-Complete Performance Index (TCPI) | 1.04 |

## Developed Excel Document

A companion Excel workbook was built to run these calculations end to end, with a Results view (the values above) and a Formulas view (the cell references behind them).

*Excel Document Developed by me. Please let me know if you spot any errors so I may correct them. Thank you!*

## References

Low, C. (2009, January). *Understanding earned value made easy.* PM Times. https://www.projecttimes.com/articles/understanding-earned-value-made-easy/

Rivera, M. (2022, August). *A beginner's guide to earned value management (2021).* The Blueprint, The Ascent, Motley Fool. https://www.fool.com/the-ascent/small-business/project-management/articles/earned-value-management/

Roseke, B. (2020, March). *The 8 steps to earned value analysis.* Project Engineer. https://www.projectengineer.net/the-8-steps-to-earned-value-analysis/
