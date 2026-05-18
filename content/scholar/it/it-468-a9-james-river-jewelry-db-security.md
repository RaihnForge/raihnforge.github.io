---
title: "Atomic Transactions, Rights Matrices, and Recovery: A James River Jewelry Case"
date: 2023-03-03
course: "IT 468"
course_title: "Projects in Database"
professor: ""
author: "Joshua Keyes"
editor: "Claude (Opus 4.7)"
module: "A9"
category: "IT"
category_label: "Information Technology"
context: "Assignment 9 for IT 468. A three-part database administration analysis of the James River Jewelry case. Part one decides which of three application transactions (Acceptance, Sales, Price Adjustment) must be made atomic to prevent lost updates, reasoning from logical units of work and multi-table modification. Part two designs processing rights for three user groups (Administrative Personnel, Managers, System Administrators) via a Database Rights Matrix that locks down the JEWELRY_ITEM.NegotiatedSalesPrice and JEWELRY_ITEM.CommissionPercentage columns. Part three critiques the company's current backup-to-manager's-house scheme and recommends cloud and isolated virtual server backups with encryption and proper recovery strategy."
relevance: "This is the late-stage IT 468 paper where the course shifts from schema design and SQL into the operational side of databases: who is allowed to do what, how transactions are bounded, and how the system survives failure. The rights matrix is the artifact I still reach for first when designing any multi-user application — including the entity-first life-binder work in Redbook and the veteran-claim workflows in Battle-Buddy. The backup critique is the kind of plain-spoken operational thinking that translates straight into running ecosystem infrastructure today."
connections: "Capstone of the IT 468 sequence after the M07 transaction-isolation work and the M08 BeautyGallery Access database. Threads forward into every project in the studio that touches multi-user data — Battle-Buddy's recipient encryption model, Redbook's entity rights, Mellon's app sandbox boundaries — and the IT 238 cyberwarfare lens of insider threat and recovery planning sits underneath it."
image: "https://images.unsplash.com/photo-1762163516269-3c143e04175c?w=1600&q=80&auto=format&fit=crop"
image_credit: "Photo via Unsplash"
tags: ["Database", "Transactions", "Atomicity", "Access Control", "Backup and Recovery", "IT 468", "DBMS"]
draft: false
---

## 1. Which Transactions Must Be Atomic?

The Acceptance Transaction and the Sales Transaction must be made atomic because their logical units of work (LUW) involve more than one table. Unintended results could occur if they are not declared as such. Once made atomic, this means that all changes within the transaction will be committed or none of them will. This introduces resource locking and prevents concurrency problems. The DBMS will automatically utilize implicit locks.

The Price Adjustment Transaction only utilizes one table, modifying one record at a time, and will not require transaction locking. It is already an autonomous LUW.

## 2. Processing Rights for the Three User Groups

There are two layers of security in the proposed design: authentication (login name and password) and authorization (permissions). Permissions grant processing rights for authenticated users, groups, or objects.

Processing rights define who is permitted to do what and when. Individuals are identified by a username and a password. Granting access and processing rights or privileges may be granted to an individual, a role, or both. Users possess the compiled set of rights granted to the individual and all the roles for which they are members.

### Database Rights Matrix

| Table (record) | Administrative Personnel | Managers | System Administrators |
| --- | --- | --- | --- |
| CUSTOMER | Read, Insert, Change | Read, Insert, Change, Delete | Read, Insert, Change, Delete, Grant Rights, Modify Structure |
| PURCHASE | Read, Insert, Change | Read, Insert, Change, Delete | Read, Insert, Change, Delete, Grant Rights, Modify Structure |
| PURCHASE_ITEM | Read, Insert, Change | Read, Insert, Change, Delete | Read, Insert, Change, Delete, Grant Rights, Modify Structure |
| ITEM | Read, Insert, Change | Read, Insert, Change, Delete | Read, Insert, Change, Delete, Grant Rights, Modify Structure |
| OWNER | Read, Insert, Change | Read, Insert, Change, Delete | Read, Insert, Change, Delete, Grant Rights, Modify Structure |
| JEWELRY_ITEM | Read, Insert, Change | Read, Insert, Change, Delete | Read, Insert, Change, Delete, Grant Rights, Modify Structure |
| JEWELRY_ITEM (NegotiatedSalesPrice) | Read | Read | Read, Insert, Change, Delete, Grant Rights, Modify Structure |
| JEWELRY_ITEM (CommissionPercentage) | Read | Read | Read, Insert, Change, Delete, Grant Rights, Modify Structure |

Administrative Personnel may read, insert, and change on all tables, but they are locked out of write access to JEWELRY_ITEM.NegotiatedSalesPrice and JEWELRY_ITEM.CommissionPercentage. Managers may read, insert, change, and delete on all tables, but they are similarly locked out of write access to those two columns. System Administrators may read, insert, change, delete, grant rights, and modify structure on all tables with no lockouts.

The reasoning behind this layout is that Price Adjustment Transactions may only be made by System Administrators. At the same time, Managers and Administrative Personnel conduct both Acceptance and Sales Transactions, which both require access to JEWELRY_ITEM. The table as a whole cannot be locked from modification by these user groups, so the constraint is applied at the column level instead.

I am assuming that DateReceived and ActualSalesPrice are not values entered manually but are populated automatically by another system. If those values are in fact entered manually, the same column-level technique would extend to lock them down for non-administrative users. If the above are automated and not manually entered, then write access to JEWELRY_ITEM could be restricted to System Administrators only.

## 3. Backup and Recovery Strategy

The strategy of James River Jewelry's backups is not a sound one and should be changed to provide better security and faster recovery. Physical copies of the database being transported to an employee's home may cause security incidents or loss of data records. Insider trading, the selling of data, or additional compromises may occur when a single employee is storing the information at home. Disgruntled employee issues and inadequate physical security at a residence are real risks. Insurance, litigation, and security certification problems may follow.

### Backup

Backups should not be stored at home. They should be made to cloud services in addition to onsite computers. I would add cloud provider support with automated backups to off-network targets. Network backup to an additional secure computer is acceptable, but the target should be transferred to an isolated virtual server rather than a peer machine on the same production network. Physical backups of data should be made more frequently than once a month and should be stored on less depreciable media at a secure company-owned site. Physical backups of documentation are acceptable, but they should be used only as redundancy and should be stored off-site in case of fire.

### Security

Security measures should include encryption of databases for all backups and for the live server.

### Recovery

The organization should utilize rollback practices when there are minor errors that need to be undone for a short period in question. The roll-forward option is best to redo a process from the file log, as long as the log is in scope. Reprocessing is not recommended, as results may vary depending on the times of edits made to the server and other variables. It is also the slowest recovery option.

## Source Information: James River Jewelry

### Transactions

**Acceptance Transaction.** When an item is received on consignment, owner data are stored in OWNER if the owner is new; otherwise existing owner data are used. New ITEM and JEWELRY_ITEM rows are created. In ITEM, ItemNumber and Description are recorded, Cost is set to $0.00, and if there is an artist associated with the piece, ArtistName is entered. For JEWELRY_ITEM, data are stored for all columns except DateSold and ActualSalesPrice.

**Price Adjustment Transaction.** Later, if the jewelry item does not sell, the NegotiatedSalesPrice and CommissionPercentage values may be reduced.

**Sales Transaction.** When an item sells, the DateSold and ActualSalesPrice fields for the item are given values, and the AmountOwed value in OWNER is updated by increasing AmountOwed by the owner's percentage of the ActualSalesPrice value.

### Groups of Users

- System Administrators: Acceptance Transactions, Sales Transactions, Price Adjustment Transactions
- Managers: Acceptance Transactions, Sales Transactions
- Administrative Personnel: Acceptance Transactions, Sales Transactions

### Current Backup and Recovery (Before Recommendation)

- Each night: database from SERVER is backed up to a SECOND COMPUTER on the SAME network.
- Once a month: a CD copy of the database is stored at the manager's house.
- Physical documents are retained for one year.
- Plan: Restore from backup and reprocess all service requests.
