---
title: "Spokeo v. Robins: Data Broker Privacy and Concrete Harm"
date: 2023-01-22
course: "IT 301"
course_title: "Cybersecurity and Ethics"
professor: "Dan Smelser"
author: "Joshua Keyes"
editor: "Claude (Opus 4.7)"
module: "Assignment 02"
image: "https://images.unsplash.com/photo-1762163516269-3c143e04175c?w=1600&q=80&auto=format&fit=crop"
image_credit: "Photo via Unsplash"
category: "IT"
category_label: "Information Technology"
context: "An evaluation of Spokeo, Inc. v. Robins through Lessig's four modalities of regulation (Market, Law, Architecture, Norms). The case turns on whether misrepresented personal data published by a data broker constitutes 'concrete harm' under Article III standing, and what it means when the Supreme Court initially says no."
relevance: "Data brokers, standing doctrine, and the legal definition of harm are the upstream questions for every modern privacy program. Years after writing this, I worked the same questions from the operational side while building Kelvin's SOC 2 control set, where the Privacy and Confidentiality criteria force an organization to define, in advance, what it considers harm and how it prevents it. The Spokeo argument is the one that the framework is trying to answer."
connections: "Pairs with the Final Essay on Windows 11 telemetry from the same course, which applies the same Lessig lens to operating system design choices. Sits upstream of professional SOC 2 work on data classification, vendor risk, and breach impact assessment."
tags: ["Cybersecurity", "Privacy", "Data Brokers", "Lessig Framework", "Supreme Court", "IT 301"]
draft: false
---

Using Lessig's four basic elements, Market, Law, Architecture, and Norms, this analysis seeks to better understand the regulatory effects and modality influences, both direct and indirect, that the case of *Spokeo, Inc. v. Robins* may have on personal liberty and ethics. The analysis reveals a potential critical disjoint in founding constitutional processes when addressing contemporary cybersecurity and privacy concerns. While the constitutional reasoning that allowed the Supreme Court to overturn the lower court's initial finding in favor of Robins is clearly founded in precedent, it can be argued that "concrete evidence" of harm is not as easily obtained through the virtualization of persona and the datafication of people within cyberspace. Translation of ambiguous situations is required in order to accurately frame contemporary complexity.

## Facts of the Case

The case is about a consumer's privacy violation. Data broker Spokeo, Inc. allowed personal information about Thomas Robins to be disseminated, misrepresenting his education, family status, economic situation, and age. Robins sued for privacy violation and was awarded in the lower courts. When the case reached the Supreme Court, Spokeo was able to overturn the ruling on the argument that there was no concrete harm done to Robins. Proof of concrete harm is required to find the defending party responsible (Roberts, 2016; *Spokeo, Inc. v. Robins*, 578). From a strict constitutional perspective, this seems an appropriate ruling.

## Implications of the Overturned Case for Personal Data on the Web

There are many implications of this case being overturned for personal data stored on the web, and I would argue even broader implications beyond that. Using Lessig's Framework (Lessig, 2006) we can begin to analyze the true impact this decision has on individual liberty, and find that the decision is, in my opinion, ultimately unsound because it is unethical. Overturning the case has the effect of the Law modality indirectly encouraging the Market modality to be less careful with individuals' personal data.

To further demonstrate the dissonance with what concrete harm can be in the digital reality we now live in, consider the purchasers of Spokeo's fraudulent product. The organization had sold to companies in the human resources, background screening, and recruiting industries (Lazarus, 2017). These institutions, equipped with a false account of personal data, can cause sufficient and concrete harm to a person's ability to acquire resources for basic human needs. They clearly impact aspects of Maslow's hierarchy. The Supreme Court's findings amount to an indirect sanction of gross negligence in the consideration of consumer data.

Data integrity is increasingly impactful in concrete ways in today's culture. This case is several years old, and even now there is exponential growth in data acquisition and use that has greater effect and reach on people's lives than ever before, with no signs of slowing. Healthcare, credit scores, loans, scholarships, grants, job applications, and rental applications can all be affected by careless data practitioners. The conflicting information could even trigger legal responses, as applications based on incorrect data could be considered fraudulent.

Lessig addresses the ambiguity demonstrated in this case directly: the translation between what "concrete harm" means in physical space versus digital space. In the digital realm, harm is more difficult to conceive of and requires translation from traditional interpretations of law and rights in the constitution (Lessig, 2006). The solution, according to Lessig, is to allow creative and flexible lower court judges to find solutions to correct this issue.

## Why Top Tech Companies Sided With This Decision

The case decision clearly drew praise and approval from tech enterprises such as Google, Microsoft, Netflix, and Meta. These technology giants depend on and deal in user data as a very real currency. Less regulation and less required integrity allow them to face less user retaliation when data is mismanaged or misused. The corporations are not held responsible, and therefore cannot be sued and held financially liable for bad practices. It is no wonder that many filed amicus briefs in support of Spokeo (Augustine-Lo, 2015).

Without sufficient regulatory influence on the Market modality, liberty suffers. Financially successful organizations like Spokeo will continue to shrug off fines without changing their practices and unethical handling of data. That is exactly what happened here. Prior to the Robins incident, Spokeo had "paid $800,000 to settle Federal Trade Commission charges that it sold people's information... without taking steps to comply with the federal Fair Credit Reporting Act" (Lazarus, 2017). Without proper Law modality influence to protect data, the Market will continue to directly impact liberty and data privacy in a negative way, as the Market can be counted on to prioritize capital.

It is obvious, even to Spokeo CEO Harrison Tang, that his organization's product is unethical. He removed his own personal data from the site because he "was getting a lot of e-mails and threats," and "it was decided by others at the company, and by lawyers, that it would be better if I opted out" (Lazarus, 2017).

## Update to the Status of the Case

An update to the case status: it was corrected, and ethics seem to have prevailed. Just as Lessig suggests, the powers of the lower courts and creative problem solving are assisting in correcting the less flexible Supreme Court ruling, providing an avenue for translation and interpretation of constitutional law. The lower courts were able to determine that there was indeed concrete harm attributable to Robins. A three-judge panel of the appellate court ruled that "Robins had alleged injuries that were sufficiently concrete" (Lazarus, 2017).

These findings have put many regulations into place, including an avenue for individuals to be removed from Spokeo's databases. It is inconvenient, but it begins to balance the Law modality's influence on the Market in service of liberty. Lawsuits now have precedent for data mishandling being expressed as harm to individuals, a small victory in the many needed before personal data is treated with integrity and respect by larger organizations.

## References

Augustine-Lo, T. (2015, December). *Online Services Companies Await Supreme Court Ruling on Standing to Bring Class Actions under Fair Credit Reporting Act.* JDSupra.

Lazarus, D. (2017). *Spokeo lawsuit highlights challenge of protecting privacy in digital age.* Los Angeles Times.

Lessig, L. (2006). *Code.* Basic Books.

Roberts, J. (2016, May 16). *Supreme Court rejects privacy claim in data broker case.* Fortune.

*Spokeo, Inc. v. Robins*, 578 U.S. ___ (2016).
