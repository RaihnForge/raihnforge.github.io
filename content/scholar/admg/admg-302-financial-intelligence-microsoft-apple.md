---
title: "Financial Intelligence Fundamentals Applied to Microsoft and Apple 2019 10-K Statements"
date: 2023-12-04
course: "ADMG 302"
course_title: "Financial Analysis"
professor: "Dr. Julie Bonner"
author: "Joshua Keyes"
editor: "Claude (Opus 4.7)"
module: "Final"
image: "https://images.unsplash.com/photo-1573164574572-cb89e39749b4?w=1600&q=80&auto=format&fit=crop"
image_credit: "Photo via Unsplash"
category: "ADMG"
category_label: "Administration & Management"
context: "Final project for ADMG 302 Financial Analysis. A side-by-side financial intelligence read on Microsoft and Apple from their FY2019 10-Ks, working through profitability, solvency, efficiency-activity, financial management metrics, and liquidity, then naming which I would rather work for under a pure financials lens."
relevance: "Financial intelligence is the layer of product thinking I used to leave to other people. Building this paper out from the 10-Ks instead of a textbook example forced me to read real statements, accept the artistic license accountants carry, and form an opinion. That habit travels into every product role I take next, especially Product Owner work where understanding the unit economics of what we ship is part of the job."
connections: "Pairs directly with the agile and project management work in ADMG 479 and the Forge Framework chapters on prioritization. Where agile gives me cadence and product discovery, financial intelligence gives me the scoreboard. The cash conversion cycle reasoning here also underlies how I now talk about runway and feature ROI in the Keyes Dev Studio backlog."
tags: ["Financial Analysis", "10-K", "Microsoft", "Apple", "Cash Conversion Cycle", "Product Thinking", "ADMG 302"]
draft: false
---

This paper explains the foundational ratios and metrics required to understand and assess the financial status of an organization, then applies those fundamentals to the FY2019 10-K statements of Microsoft and Apple to compare two competitors in the same broad industry. After the assessment, I name which of the two I would rather work for through a purely financial lens. The fundamentals covered are profitability ratios, solvency ratios, efficiency-activity ratios, financial management metrics, and liquidity ratios, with notes on the considerations that keep each one honest.

## Profitability Ratios

Profitability is the ability of a company to generate sales and control expenses, and the ratios are powerful precisely because they are innately comparative. Comparing line items on the Income Statement to one another begins to tell a larger narrative than any single number can on its own.

**Gross profit margin percent** is gross profit divided by revenue. The result reveals how much of each dollar of revenue an organization gets to keep after the direct cost of goods or services. For smaller companies it is generally more important that this ratio be higher, because the buying power provided by sales has to cover operating expenses against a smaller base. Larger companies can run a lower gross margin and still produce significant gross profit dollars to operate against.

**Net profit margin percent** is net profit divided by revenue and accounts for COGS or COS, operating expenses, liabilities, one-time purchases, and taxes. It is known as the bottom line because it represents what the company actually keeps after every cost has been recognized.

The honest caveat: profitability ratios bake in accountants' artistic license, especially in how revenue is recognized and how depreciation, amortization, and liabilities are estimated. GAAP allows considerable leeway as long as the method is reasonable and consistent, and over-focus on a single ratio is how companies like Ford ended up not appreciating inventory costs and how Sunbeam ended up cutting jobs to dress up short-term results at the expense of long-term health.

## Solvency Ratios

Solvency is the possession of assets in excess of liabilities and the ability to pay one's debts (Oxford, 2023). The **Debt to Asset ratio** is total liabilities divided by total assets and is a measure of long-term financial flexibility (Bonner, 2015). No debt at all can also be a signal that the company lacks vision for future development (Berman and Knight, 2013), though in unstable markets, reducing debt is the more prudent move because flexibility erodes fast when the market turns.

Liabilities and assets break into **current and non-current** buckets. Current assets are expected to be sold or used within one year and have high liquidity, like cash, receivables, and inventories. Non-current assets include land and buildings, plant and machinery, and goodwill (tutor2u, 2016). Current liabilities are generally due within a year and long-term liabilities are due in a year or more. Total assets and total liabilities are not the same as their current subsets.

Solvency ratios are essential to financial intelligence. The Income Statement is analogous to a single course grade for the indicated period, while the Balance Sheet reveals performance over time, analogous to GPA (Berman and Knight, 2013). Comparing like entities indicates fiscal priorities, organizational solvency, and how a potential emergency might impact a company (Bonner, 2015).

## Efficiency - Activity Ratios

Efficiency-activity ratios reveal how a company is handling its cash flows by adding context to the numbers, and they feed directly into the cash conversion cycle calculation.

**Accounts Receivables Turnover** is total revenue divided by the average of the last two years of receivables, and **Days Sales Outstanding** is 365 divided by the receivables turnover, which translates the ratio into the time between a sale and cash in hand. It is a cash-generating process.

**Accounts Payable Turnover** is cost of revenue divided by the average of the last two years of accounts payable, and **Days Payables Outstanding** is 365 divided by that turnover. Days Payables Outstanding is a use of cash and represents how quickly a company spends cash to pay its bills.

**Inventory Turnover** is cost of revenue divided by the average of the last two years of inventory, and **Days in Inventory** is 365 divided by inventory turnover. It represents how quickly a company converts inventory back into cash.

A savvy company can use a deep understanding of these ratios to invest expected receivables in short-term federal government bonds and earn a base return in the lag before cash arrives. Likewise, accounts payable can be invested in the gap before payment is due. Cash is a poor investment on its own because its value decreases over time, so the spread between receivables and payables timing is real money.

## Financial Management Metrics

Financial management metrics focus on a broader read of a company's efficiency and health, and the Cash Flow Statement is the centerpiece. Operations cash covers salaries, payments to vendors and landlords, and everything that keeps the doors open. Investing cash covers land, buildings, and equipment, and shows whether a company is investing for its future or coasting. Financing cash covers bank loans and shareholder activities, and its read depends entirely on the company's situation.

**Free Cash Flow** is operating cash flow less net capital expenditures. Also known as owner earnings by its progenitor, it has surpassed EBITDA on Wall Street in recent years and was popularized by Warren Buffett's Berkshire Hathaway after decades of strong results. A positive number means the company is generating more cash from operations than it is spending on capital investments, which leaves room to pay debt, pay dividends, or reinvest. Its resilience to tampering is one of the reasons it has become a staple, because over long periods it strips out most of the estimates accountants get to make elsewhere.

**Cash Conversion Cycle** is Days in Inventory plus Days Sales Outstanding minus Days Payables Outstanding. The lower the number, the better, and a negative number means the company gets cash before it has to pay its bills. Not every company needs a negative CCC to be successful, though. The metric should be compared to competitors in similar industries because order business dynamics differ. Buffett famously stayed away from tech for the same reason: he only used Free Cash Flow strategies in industries he understood.

**Working Capital** is current assets minus current liabilities and is closely tied to the liquidity ratios below. Effective working capital management means being slow to pay debts, encouraging direct receivable conversion, keeping inventory lean, and mitigating long-term financing options. Amazon was unprofitable for years but reinvested its free cash flow into growth and diversification until Amazon Web Services proved out as the exceptional venture that finally paid the e-commerce business back.

## Liquidity Ratios

The **Current Ratio** is current assets divided by current liabilities. A result of one or greater is the floor. Higher is better, and trending the ratio over time against itself and competitors helps spot anomalies worth investigating in 10-K and FCC reports.

The **Quick Ratio**, sometimes called the Acid Test, is current assets minus inventory, divided by current liabilities. It strips out inventory because inventory is not always easy to convert to cash quickly. Together with the Current Ratio it determines whether a company can pay its bills without relying on inventory turnover.

## Microsoft and Apple Assessment

Both companies manage their finances well, and both look healthy across the full set of ratios. The differences are where the story lives.

**Profitability.** Microsoft's gross profit margin is much higher than Apple's, which tracks with Microsoft being primarily a software company while Apple is rooted in hardware. Apple's net profit margin relative to its gross profit is the more interesting reading: Microsoft retains about 46 percent of gross after operating expenses while Apple retains about 56 percent. Microsoft is reinvesting heavily into R and D to maintain its position against Google's productivity stack, Apple's OSX, and gaming competitors like Sony and Nintendo.

**Solvency.** Apple's Debt to Asset Ratio is 73 percent against Microsoft's 64 percent. Both are solvent, both are healthy for the competitive industry they operate in. Apple increased debt from 70 percent in 2018 while Microsoft decreased debt from 68 percent in 2018, which reads to me as Microsoft playing it safer and Apple more willing to lever into future earnings.

**Efficiency-Activity.** Apple is dramatically faster on the cash cycle. Days in Inventory of 9.09 against Microsoft's 20.1. Days Sales Outstanding of 32.35 against Microsoft's 81.23. Days Payables Outstanding of 115.2 against Microsoft's 76.55. Apple collects faster on direct-to-consumer sales and pays slower on its supplier liabilities, which gives it far more room to put cash to work in the gap.

**Financial Management Metrics.** Apple's Cash Conversion Cycle is decidedly negative while Microsoft's is positive. Free Cash Flow is much stronger for Apple, which means Apple has more room to reduce debt, reinvest in growth, or pay dividends. Had Buffett understood the tech industry well enough to make a call, the cash story would have pointed at Apple.

**Liquidity.** Microsoft's Current Ratio of 2.53 and Quick Ratio of 2.47 beat Apple's 1.54 and 1.52. The minimal gap between current and quick for both companies means inventory is not the variable holding either back. Apple's lower liquidity reads as hardware-heavy accounts payable tied up in production rather than weakness, and goodwill from a tightly controlled device platform supports the brand in a way pure liquidity does not measure.

## Conclusion

Apple would be my preferred company to work for from a financial intelligence standpoint. Microsoft is the safer of the two on a pure liquidity read, but Apple's efficiency-activity ratios, cash conversion cycle, and free cash flow tell the more confident story. Cash is king is a phrase popularized by Pehr G. Gyllenhammar of Volvo during the 1987 market crash, and in this comparison Apple has more cash to commit to company priorities. That translates into flexibility, security, and growth headroom.

Microsoft invests in software across a dynamic range of devices that are influenced but not controlled. Apple maintains control of the device platform first and runs a consistent ecosystem on top of it. Both companies have spent the years since 2019 making sure their strengths do not become their weaknesses. Microsoft has kept investing in Surface to bring a device platform under its control, and Apple has expanded iCloud, Apple TV, and other services to devices outside its immediate hardware ecosystem.

Apple's strong profitability ratios, solvency, efficiency-activity ratios, financial management metrics, and liquidity make it an outstanding financial investment over even a strong competitor like Microsoft. Given this financial analysis perspective, I would choose to work with Apple.

## References

Accounting Stuff. (2018). *The accounting equation for beginners.* YouTube.

Berman, K., and Knight, J. (2013). *Financial intelligence for IT professionals.* Business Literacy Institute.

Bonner, J. (2015). *Receivables turnover and days sales outstanding.* The Bean Counter. YouTube.

Bonner, J. (2015). *Payables turnover and payables outstanding.* The Bean Counter. YouTube.

Bonner, J. (2015). *Inventory turnover and days in inventory ratios.* The Bean Counter. YouTube.

Bonner, J. (2015). *Cash conversion cycle.* The Bean Counter. YouTube.

Bonner, J. (2015). *How to calculate current ratio.* The Bean Counter. YouTube.

Bonner, J. (2015). *How to calculate quick ratio.* The Bean Counter. YouTube.

Bonner, J. (2015). *Solvency: how to calculate debt to assets ratio.* The Bean Counter. YouTube.

Browning, K., and McCabe, D. (2023). Microsoft closes $69 billion Activision deal, overcoming regulators' objections. *The New York Times.*

Oxford Languages. (2023). *Oxford Languages.* Oxford University Press.

Ortiz, L., and Posadas, P. (2013). *Working capital management.* Ultraviolet427. YouTube.

Rule #1 Investing. (2016). *What is free cash flow.* YouTube.

Tutor2u. (2016). *Introduction to the balance sheet.* YouTube.
