# Legal And Compliance Checklist For Saharanpur Launch

This document is informational and not a substitute for advice from an India-qualified lawyer or CA. It is meant to help you launch the product responsibly from Saharanpur, Uttar Pradesh.

## 1. Entity Setup

Before you start taking recurring clinic subscriptions, form a proper business entity. In practice, that usually means:

- Private Limited Company if you want easier fundraising, cleaner equity, and enterprise credibility
- LLP if you want a lighter structure and do not need investor-style equity soon

Official MCA incorporation workflow reference:

- MCA SPICe+ guide: https://www.mca.gov.in/content/dam/mca/videos/audio_pdfs/Video_SPICeplus_AudioText.pdf

## 2. GST And Invoicing

For SaaS billing in India, review GST registration and invoicing with a CA before launch. A practical default is:

- monitor the registration threshold carefully
- decide whether to register voluntarily before threshold for cleaner B2B invoicing
- confirm SAC classification and GST treatment with a CA before issuing production invoices

Official CBIC reference used here:

- CBIC sectoral GST FAQs: https://cbic-gst.gov.in/sectoral-faq.html

Inference:

- many Indian SaaS businesses charge 18% GST, but your exact classification and compliance setup should be confirmed by your CA before launch

## 3. Data Protection Timeline

Important verified dates:

- the Digital Personal Data Protection Act, 2023 received Presidential assent on August 11, 2023
- the Digital Personal Data Protection Rules, 2025 were notified on November 13, 2025
- under Rule 1 of the 2025 Rules:
  - Rules 1, 2, and 17 to 21 started on November 13, 2025
  - Rule 4 starts on November 13, 2026
  - Rules 3, 5 to 16, 22, and 23 start on May 13, 2027

Official source:

- DPDP Rules, 2025 notification: https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf

Practical meaning on April 7, 2026:

- the full operational notice/rights/compliance layer is published but not fully in force yet
- you should still build for it now because clinics will expect privacy maturity before May 13, 2027

## 4. Cyber Incident Response

If you operate this SaaS, you need a real incident response process. CERT-In’s 2022 directions and FAQs are important because they discuss reporting timelines and scope.

Verified point from the official FAQ:

- report qualifying cyber incidents within 6 hours of noticing the incident or being brought to notice of it

Official source:

- CERT-In FAQs on Cyber Security Directions: https://www.cert-in.org.in/PDF/FAQs_on_CyberSecurityDirections_May2022.pdf

## 5. What Your Contracts Should Say

Your clinic-facing contract set should include:

- Privacy Policy
- Terms of Service / Master Subscription Agreement
- Data Processing Addendum
- Security/incident notification language
- clause making each clinic responsible for maintaining its own medical licences, establishment registrations, prescriptions, and regulatory compliance

Why this matters:

- you are the software provider
- the clinic remains responsible for actual medical practice and local clinic legality

## 6. Uttar Pradesh Startup Support

If you incorporate and operate from Uttar Pradesh, check the state startup policy and portal. The official policy is industry-agnostic and can support startups across sectors.

Official source:

- UP Startup Policy 2020 (First Amendment 2022): https://startinup.up.gov.in/wp-content/uploads/2023/01/Startup-Policy-english_091122.pdf

## 7. Product Boundaries You Should Keep

For safer launch, keep these boundaries:

- do not market this as telemedicine yet
- do not enable public patient queue screens using raw appointment data
- do not store Aadhaar or extra identity data unless you have a strong legal/business reason
- do not promise “legal compliance” in marketing until your lawyer signs off on the document set

## 8. Immediate Manual Actions

1. incorporate the business
2. meet a CA for GST, accounting, and invoice setup
3. get a lawyer to finalize Privacy Policy, Terms, and DPA
4. appoint an internal incident contact for CERT-In workflow
5. migrate all old records so the Firestore rules match the tenant model
