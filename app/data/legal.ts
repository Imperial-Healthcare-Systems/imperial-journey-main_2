export type LegalSection = { n: string; h: string; body: string };
export type LegalPage = {
  eyebrow: string;
  title: string;
  sub: string;
  meta: string;
  sections: LegalSection[];
};

export type LegalKey = "privacy" | "terms" | "refund";

export const LEGAL_PAGES: Record<LegalKey, LegalPage> = {
  privacy: {
    eyebrow: "Legal",
    title: "Privacy Policy",
    sub: "Imperial Journeys — Governing Data Collection, Processing & Protection",
    meta: "Effective Date: April 20, 2026 · Last Updated: April 20, 2026",
    sections: [
      {
        n: "01",
        h: "Introduction & Scope",
        body: `<p>This Privacy Policy governs the collection, processing, storage, and protection of personal data by Imperial Journeys ("Company", "we", "our", or "us"), a travel brand of Imperial Healthcare Systems Pvt Ltd (CIN: U62099HR2025PTC137921), registered in Gurugram, Haryana, India.</p>
        <p>By accessing our website, requesting a travel itinerary, or booking any journey through us, you acknowledge that you have read, understood, and consent to the practices described in this Policy.</p>
        <p>This Policy applies to:</p>
        <ul>
          <li>Website visitors and prospective travellers</li>
          <li>Existing clients with active or completed bookings</li>
          <li>Co-travellers whose details are submitted as part of a group booking</li>
          <li>Individuals interacting with us through any communication channel</li>
        </ul>`,
      },
      {
        n: "02",
        h: "Information We Collect",
        body: `<p><strong>a. Identity & Contact Data</strong></p>
        <ul>
          <li>Full name, date of birth, nationality, gender</li>
          <li>Personal email, phone number, residential address</li>
        </ul>
        <p><strong>b. Travel Document Data</strong></p>
        <ul>
          <li>Passport number, expiry date, country of issue</li>
          <li>Visa records, OCI/PIO documents where applicable</li>
          <li>Photographs required for visa applications and on-site identification</li>
        </ul>
        <p><strong>c. Booking & Itinerary Data</strong></p>
        <ul>
          <li>Travel dates, destinations, hotel preferences, dining preferences</li>
          <li>Flight, transfer, and on-ground service bookings</li>
          <li>Co-traveller details for group bookings</li>
        </ul>
        <p><strong>d. Health & Special Requirements</strong></p>
        <ul>
          <li>Medical conditions, allergies, dietary restrictions, mobility needs (where shared voluntarily)</li>
          <li>Travel insurance documentation where applicable</li>
        </ul>
        <p><strong>e. Financial & Transaction Data</strong></p>
        <ul>
          <li>Billing details processed via secure, certified third-party payment processors</li>
          <li>We do not store raw card numbers or sensitive payment credentials</li>
        </ul>
        <p><strong>f. Technical & Usage Data</strong></p>
        <ul>
          <li>IP address, browser type, device identifiers</li>
          <li>Pages visited, session duration, and platform usage analytics</li>
        </ul>`,
      },
      {
        n: "03",
        h: "Legal Basis for Processing",
        body: `<p>We process personal data under the following lawful bases, in accordance with applicable law including the Digital Personal Data Protection Act, 2023 (India) and relevant international frameworks:</p>
        <ul>
          <li><strong>Contractual Necessity</strong> — to deliver travel services as defined in the booking confirmation</li>
          <li><strong>Legitimate Business Interests</strong> — for fraud prevention, supplier coordination, and service improvement</li>
          <li><strong>Legal & Regulatory Obligation</strong> — for taxation, immigration disclosures, and AML compliance</li>
          <li><strong>Explicit Consent</strong> — where required (e.g., processing of health data for medical-emergency planning)</li>
        </ul>`,
      },
      {
        n: "04",
        h: "Use of Information",
        body: `<p>Data collected is used exclusively to:</p>
        <ul>
          <li>Plan, book, and deliver your itinerary</li>
          <li>Coordinate with hotels, airlines, ground operators, embassies, and on-trip suppliers</li>
          <li>Process visas and travel documents on your behalf where authorised</li>
          <li>Manage billing, refunds, and supplier reconciliations</li>
          <li>Communicate trip updates, pre-departure briefings, and on-trip alerts</li>
          <li>Ensure security, fraud prevention, and regulatory compliance</li>
          <li>Send periodic itinerary inspiration and offers — only with explicit opt-in</li>
        </ul>`,
      },
      {
        n: "05",
        h: "Data Sharing & Disclosure",
        body: `<p>We do not sell, rent, or trade personal data to any third party for commercial gain.</p>
        <p>Data may be shared with:</p>
        <ul>
          <li>Hotels, airlines, ground transport, and tour suppliers strictly to the extent required to deliver your booking</li>
          <li>Embassies and consular authorities for visa processing</li>
          <li>Insurance providers and emergency assistance services where applicable</li>
          <li>Trusted technology vendors (hosting, analytics, payment processors) bound by confidentiality obligations</li>
          <li>Legal and regulatory authorities where required by applicable law</li>
          <li>Successors or acquirers in the event of a merger, acquisition, or corporate restructuring</li>
        </ul>`,
      },
      {
        n: "06",
        h: "International Data Transfers",
        body: `<p>As a travel brand operating globally with offices in India and the United States, your data will frequently be transferred across borders to enable service delivery (e.g., a hotel in Switzerland or a supplier in Tanzania). All cross-border transfers are conducted with appropriate contractual and technical safeguards to ensure lawful and secure handling of personal data in accordance with applicable law.</p>`,
      },
      {
        n: "07",
        h: "Data Retention",
        body: `<ul>
          <li>For the duration of the active booking and trip lifecycle</li>
          <li>Up to seven (7) years post-trip for legal, audit, tax, and insurance purposes</li>
          <li>For extended periods where required by applicable law or regulatory obligation</li>
        </ul>
        <p>Upon expiry of the retention period, data is securely archived or permanently deleted in accordance with our internal data governance protocols.</p>`,
      },
      {
        n: "08",
        h: "Data Security",
        body: `<p>We implement enterprise-grade security controls including:</p>
        <ul>
          <li>AES-256 encryption for data at rest; SSL/TLS for data in transit</li>
          <li>Role-based access — only the planner assigned to your trip and accounting personnel see your full file</li>
          <li>Periodic security audits and vulnerability assessments</li>
          <li>Strict access controls on passport scans and travel documents</li>
        </ul>
        <p>While we apply rigorous security standards, no system guarantees absolute protection. We commit to responding promptly and transparently in the event of any security incident.</p>`,
      },
      {
        n: "09",
        h: "Cookies, Tracking & User Consent",
        body: `<p>By accessing, browsing, or continuing to use this website, you acknowledge and consent to the use of cookies and similar tracking technologies for the purposes outlined below.</p>
        <p>Cookies are used exclusively to:</p>
        <ul>
          <li>Enable core website functionality and platform performance</li>
          <li>Analyse user behaviour, traffic patterns, and usage analytics</li>
          <li>Enhance user experience and optimise service delivery</li>
        </ul>
        <p><strong>Explicit Affirmation:</strong> Cookies are not used for unsolicited marketing, behavioural advertising, or third-party profiling without explicit user consent. Users retain full control over cookie preferences through browser settings.</p>`,
      },
      {
        n: "10",
        h: "User Rights",
        body: `<p>Subject to applicable law, you have the right to:</p>
        <ul>
          <li>Access, correct, or request deletion of your personal data</li>
          <li>Restrict or object to specific processing activities</li>
          <li>Withdraw consent at any time, without affecting the lawfulness of prior processing</li>
          <li>Request data portability in a structured, machine-readable format</li>
        </ul>
        <p>All rights requests may be directed to: info@imperialtechinnovations.com</p>
        <p><strong>Grievance Officer (DPDP Act 2023 — India)</strong></p>
        <p>In accordance with the Digital Personal Data Protection Act, 2023, the designated Grievance Officer for India-based data subjects is reachable at info@imperialtechinnovations.com. Grievances will be acknowledged within 48 hours and resolved within 30 days.</p>`,
      },
      {
        n: "11",
        h: "Data Breach Response",
        body: `<p>In the event of a personal data breach, we will:</p>
        <ul>
          <li>Immediately investigate and contain the incident</li>
          <li>Notify affected users and relevant authorities within timelines required by applicable law</li>
          <li>Document the nature, scope, and remediation actions taken</li>
          <li>Implement preventive controls to mitigate recurrence</li>
        </ul>`,
      },
      {
        n: "12",
        h: "Minors",
        body: `<p>For travellers under the age of 18, all bookings must be made by a parent or legal guardian who consents to the processing of the minor's personal data on their behalf. We do not knowingly collect personal data directly from minors without parental consent.</p>`,
      },
      {
        n: "13",
        h: "Policy Updates & Contact",
        body: `<p>We reserve the right to update this Privacy Policy periodically. Material changes will be communicated via website notice or direct email to active clients. Continued use of our services following any update constitutes acceptance of the revised Policy.</p>`,
      },
    ],
  },

  terms: {
    eyebrow: "Legal",
    title: "Terms of Service",
    sub: "Imperial Journeys — Governing All Travel Engagements",
    meta: "Effective Date: April 20, 2026 · Last Updated: April 20, 2026",
    sections: [
      {
        n: "01",
        h: "Acceptance of Terms",
        body: `<p>By accessing our website, requesting a quotation, or completing payment for any journey, you ("Client") agree to be bound by these Terms of Service ("Terms") in their entirety. These Terms apply to all travel planning, booking, and on-trip services offered by Imperial Journeys ("Company"), a travel brand of Imperial Healthcare Systems Pvt Ltd.</p>
        <p>If you do not agree to these Terms, you must not use our services.</p>`,
      },
      {
        n: "02",
        h: "Services",
        body: `<p>The Company provides curated travel services including:</p>
        <ul>
          <li>Bespoke itinerary design across India and international destinations</li>
          <li>Hotel, flight, transfer, and ground-service bookings</li>
          <li>Visa coordination and documentation support</li>
          <li>On-trip concierge and 24×7 emergency assistance</li>
          <li>Group, corporate (MICE), and event-based travel programmes</li>
          <li>Specialty journeys including heritage, wildlife, mountain, and culinary tours</li>
        </ul>
        <p>The precise scope of each engagement, including inclusions, exclusions, dates, and commercial terms, is defined in a written booking confirmation. In the event of conflict, the booking confirmation shall prevail over these Terms.</p>`,
      },
      {
        n: "03",
        h: "Role of Imperial Journeys as Agent",
        body: `<p>The Company acts as a booking agent on behalf of independent third-party suppliers including hotels, airlines, ground operators, and tour providers. While we vet every supplier rigorously, the actual delivery of accommodation, transport, and on-ground services is performed by these third parties.</p>
        <p>The Company is not liable for the acts, omissions, or service failures of independent suppliers, except to the extent caused by our own negligence in selecting or instructing them. Where supplier failure occurs, we will use all reasonable efforts to resolve the issue and pursue remedies on your behalf.</p>`,
      },
      {
        n: "04",
        h: "Client Responsibilities",
        body: `<p>The Client agrees to:</p>
        <ul>
          <li>Provide accurate identity, passport, and traveller details on time</li>
          <li>Hold a valid passport with at least six (6) months remaining validity at the date of return</li>
          <li>Obtain all required visas, vaccinations, and health certifications for the destinations covered</li>
          <li>Make payments as agreed and within stipulated timelines</li>
          <li>Disclose any material medical or mobility conditions that may affect trip planning</li>
          <li>Carry adequate travel insurance — strongly recommended for all international journeys</li>
          <li>Behave lawfully and respectfully toward suppliers, staff, and fellow travellers</li>
        </ul>`,
      },
      {
        n: "05",
        h: "Pricing & Payment Terms",
        body: `<p>All quotations are valid for fourteen (14) days from the date of issuance unless otherwise stated. Prices are subject to revision in case of:</p>
        <ul>
          <li>Currency fluctuations between quotation and booking confirmation</li>
          <li>Changes in supplier rates, taxes, or government-levied charges</li>
          <li>Modifications to the original itinerary requested by the Client</li>
        </ul>
        <p>Standard payment structure:</p>
        <ul>
          <li><strong>25% non-refundable booking deposit</strong> required to confirm any journey</li>
          <li><strong>50% interim payment</strong> due 60 days prior to departure</li>
          <li><strong>Balance 25%</strong> due 30 days prior to departure</li>
        </ul>
        <p>For bookings made within 60 days of departure, full payment is required at the time of booking. Detailed payment provisions are governed by the Payment & Refund Policy.</p>`,
      },
      {
        n: "06",
        h: "Cancellation, Changes & Refund Governance",
        body: `<ul>
          <li>All cancellation requests must be submitted in writing via email</li>
          <li>The 25% booking deposit is non-refundable in all cases</li>
          <li>Cancellation charges escalate as the departure date approaches (see Payment & Refund Policy for the detailed slab)</li>
          <li>Changes to confirmed itineraries are subject to supplier availability and may incur amendment fees</li>
          <li>No refunds shall be issued for unused portions of an in-progress trip (e.g., early departure, missed activities)</li>
        </ul>
        <p>Detailed cancellation slabs and refund procedures are governed by the Company's Payment & Refund Policy.</p>`,
      },
      {
        n: "07",
        h: "Travel Documents, Visas & Health Requirements",
        body: `<p>The Client is solely responsible for ensuring all travel documents, visas, vaccinations, and health certifications meet the requirements of the destination countries. While the Company offers visa coordination support, visa approval is at the sole discretion of the relevant consular authority, and the Company makes no guarantee of issuance.</p>
        <p>Visa rejection by an embassy does not entitle the Client to a refund of supplier deposits already paid. Visa processing fees are non-refundable in all cases.</p>`,
      },
      {
        n: "08",
        h: "Travel Insurance",
        body: `<p>Travel insurance is <strong>strongly recommended</strong> for all journeys and is mandatory for certain destinations and adventure activities. Insurance should cover, at minimum:</p>
        <ul>
          <li>Trip cancellation and interruption</li>
          <li>Medical emergencies and evacuation</li>
          <li>Lost or delayed baggage</li>
          <li>Adventure activity coverage where applicable</li>
        </ul>
        <p>The Company can recommend insurance partners but does not act as an insurance broker. Failure to obtain adequate insurance is at the Client's own risk.</p>`,
      },
      {
        n: "09",
        h: "Service Standards & Disclaimer",
        body: `<p>Services are coordinated to a high professional standard, but the Client acknowledges that:</p>
        <ul>
          <li>Travel involves inherent unpredictability — weather, traffic, supplier operations, local conditions</li>
          <li>Itinerary modifications may be required mid-trip for safety, logistics, or supplier reasons</li>
          <li>The quality, taste, and ambience of meals, lodging, and activities are inherently subjective</li>
          <li>The Company will use reasonable efforts to substitute equivalent or superior alternatives where original arrangements become unavailable</li>
        </ul>`,
      },
      {
        n: "10",
        h: "Force Majeure",
        body: `<p>The Company shall not be liable for any delay, modification, cancellation, or failure of services caused by events beyond its reasonable control, including but not limited to: acts of God, natural disasters, severe weather, pandemics, epidemics, war, civil unrest, government-imposed travel restrictions, airline industrial action, terrorism, supplier insolvency, or border closures.</p>
        <p>In the event of force majeure, the Company will use reasonable efforts to rebook, postpone, or substitute services. Any unrecoverable supplier costs (non-refundable hotel deposits, airline fees, etc.) shall remain at the Client's account.</p>`,
      },
      {
        n: "11",
        h: "Limitation of Liability",
        body: `<ul>
          <li>The Company's total aggregate liability for any claim arising out of or related to a specific booking shall not exceed the total fees paid by the Client for that specific journey</li>
          <li>The Company shall not be liable for any indirect, incidental, consequential, punitive, or special damages, including loss of enjoyment, loss of business opportunity, or emotional distress</li>
          <li>The Company is not liable for actions of independent third-party suppliers beyond the extent set out in Section 3</li>
          <li>These limitations apply regardless of the form or basis of the claim</li>
        </ul>`,
      },
      {
        n: "12",
        h: "Indemnification",
        body: `<p>The Client agrees to indemnify, defend, and hold harmless the Company and its affiliates, officers, and employees against any third-party claims, losses, damages, or liabilities arising from:</p>
        <ul>
          <li>Misrepresentation of travel documents or traveller details</li>
          <li>Unlawful or unsafe conduct during the journey</li>
          <li>Damage to supplier property or third-party assets</li>
          <li>Breach of these Terms by the Client or any co-traveller</li>
        </ul>`,
      },
      {
        n: "13",
        h: "Confidentiality & Marketing Use",
        body: `<p>The Company maintains strict confidentiality of all Client travel data. Photographs, testimonials, or itinerary excerpts will only be used in marketing materials with explicit written consent.</p>`,
      },
      {
        n: "14",
        h: "Termination",
        body: `<ul>
          <li>Either party may terminate the engagement upon written notice in the event of a material breach that remains uncured for fourteen (14) days following notice</li>
          <li>The Company may suspend or cancel a booking immediately for non-payment, security concerns, or risk to staff and other travellers</li>
          <li>Upon termination, the Client remains liable for all supplier costs and work completed up to the date of termination</li>
        </ul>`,
      },
      {
        n: "15",
        h: "Governing Law & Dispute Resolution",
        body: `<p><strong>India:</strong> These Terms are governed by and construed in accordance with the laws of India. Any dispute shall be subject to the exclusive jurisdiction of courts in Gurugram, Haryana.</p>
        <p><strong>International Clients:</strong> For clients domiciled outside India, disputes shall be resolved through good-faith negotiation followed, if necessary, by binding arbitration in accordance with internationally recognised arbitration rules.</p>`,
      },
      {
        n: "16",
        h: "Amendments",
        body: `<p>The Company reserves the right to update or amend these Terms at any time. Material changes will be communicated via website notice or direct email to active clients. Continued use of services following publication of amendments constitutes acceptance of the revised Terms.</p>`,
      },
    ],
  },

  refund: {
    eyebrow: "Legal",
    title: "Payment & Refund Policy",
    sub: "Imperial Journeys — Governing All Bookings, Cancellations & Refunds",
    meta: "Effective Date: April 20, 2026 · Last Updated: April 20, 2026",
    sections: [
      {
        n: "01",
        h: "Payment Structure",
        body: `<p><strong>Standard Payment Schedule:</strong></p>
        <ul>
          <li><strong>25% non-refundable booking deposit</strong> required to confirm any journey and lock in supplier inventory</li>
          <li><strong>50% interim payment</strong> due 60 days prior to departure</li>
          <li><strong>Balance 25%</strong> due 30 days prior to departure</li>
        </ul>
        <p>For bookings confirmed within 60 days of departure, the full balance is payable at the time of booking. For peak-season or premium properties, suppliers may require earlier or full upfront payment — these terms will be communicated at the time of quotation.</p>
        <p><strong>Accepted Payment Methods:</strong></p>
        <ul>
          <li>India: Bank transfer, UPI, or authorised payment gateway</li>
          <li>International: Wire transfer (SWIFT), ACH, or authorised international payment gateway</li>
          <li>All payments must be received in cleared funds before confirmations are released to suppliers</li>
        </ul>
        <p><strong>Taxation:</strong></p>
        <p>All quoted amounts are exclusive of GST and applicable government-levied taxes, duties, and statutory charges. GST shall be charged at the prevailing statutory rate and payable separately by the Client. For international clients, applicable taxes shall apply per the relevant jurisdiction. Tax invoices and GST receipts will be issued in accordance with statutory requirements.</p>`,
      },
      {
        n: "02",
        h: "Late Payment & Default",
        body: `<ul>
          <li>Invoices are payable within seven (7) days of issuance unless otherwise specified</li>
          <li>Failure to make interim or balance payments by the due date may result in cancellation of the booking and forfeiture of deposits paid</li>
          <li>Overdue amounts shall accrue interest at two percent (2%) per month from the due date</li>
          <li>The Company reserves the right to release reserved supplier inventory upon payment default</li>
        </ul>`,
      },
      {
        n: "03",
        h: "Cancellation Slabs",
        body: `<p>Cancellation charges apply based on how far in advance written cancellation is received before the date of departure. Charges are calculated as a percentage of the total trip cost:</p>
        <ul>
          <li><strong>More than 90 days before departure</strong> — 25% of trip cost (booking deposit forfeit only)</li>
          <li><strong>60 to 90 days before departure</strong> — 50% of trip cost</li>
          <li><strong>30 to 60 days before departure</strong> — 75% of trip cost</li>
          <li><strong>Less than 30 days before departure</strong> — 100% of trip cost (no refund)</li>
          <li><strong>No-show or cancellation after departure</strong> — 100% of trip cost</li>
        </ul>
        <p>For premium properties, peak-season departures, group bookings, and certain international suppliers, stricter supplier cancellation terms may apply. These will be communicated in writing prior to booking confirmation and shall override the standard slab where applicable.</p>`,
      },
      {
        n: "04",
        h: "Non-Refundable Items",
        body: `<p>The following are strictly non-refundable under all circumstances:</p>
        <ul>
          <li>The 25% booking deposit</li>
          <li>Visa application and processing fees</li>
          <li>Travel insurance premiums (refer to insurer's own policy)</li>
          <li>Airline tickets once issued (subject to airline rules)</li>
          <li>Non-refundable supplier deposits (clearly identified at booking)</li>
          <li>Charges for services already consumed or trips already commenced</li>
          <li>Bespoke planning and consultation fees</li>
          <li>Currency conversion losses</li>
        </ul>`,
      },
      {
        n: "05",
        h: "Visa Rejection",
        body: `<p>Visa approval is at the sole discretion of consular authorities. In the event of visa rejection:</p>
        <ul>
          <li>The Company will use reasonable efforts to recover refundable supplier costs</li>
          <li>Non-refundable supplier deposits, visa fees, and processing fees remain at the Client's account</li>
          <li>The cancellation slab in Section 3 shall apply based on the date the rejection is communicated to the Company</li>
          <li>Where time permits, alternative travel dates may be offered subject to supplier availability</li>
        </ul>`,
      },
      {
        n: "06",
        h: "Force Majeure & Trip Disruption",
        body: `<p>Where a trip is disrupted, postponed, or cancelled due to events beyond the Company's reasonable control (natural disasters, pandemics, government travel restrictions, war, civil unrest, airline industrial action, etc.):</p>
        <ul>
          <li>The Company will use reasonable efforts to rebook, postpone, or restructure the journey</li>
          <li>Recoverable supplier credits may be applied toward future travel within twelve (12) months</li>
          <li>Unrecoverable supplier costs (non-refundable hotel deposits, airline cancellation fees, etc.) shall remain at the Client's account</li>
          <li>The Company shall not be liable for losses caused by force majeure beyond what is recoverable from suppliers</li>
        </ul>
        <p>Travel insurance is the recommended primary protection against force majeure losses.</p>`,
      },
      {
        n: "07",
        h: "Refund Processing",
        body: `<p>Where a refund is approved:</p>
        <ul>
          <li>Refunds are processed exclusively to the original payment source account</li>
          <li>Processing timelines may extend up to twenty-one (21) business days from approval</li>
          <li>Timelines are subject to banking and payment gateway settlement cycles, supplier release timelines, and regulatory verification requirements</li>
          <li>The Company shall not be liable for delays attributable to external financial institutions or supplier reconciliation cycles</li>
          <li>Where original payment was made in foreign currency, refunds will be issued in the same currency at the exchange rate in effect on the date of refund disbursement</li>
        </ul>`,
      },
      {
        n: "08",
        h: "Mandatory Documentation for Refund Processing",
        body: `<p>To initiate a refund review, the Client must submit:</p>
        <ul>
          <li>Formal written cancellation letter stating the reason and original booking reference</li>
          <li>Self-attested government-issued photo identification (passport, Aadhaar, or equivalent)</li>
          <li>Bank account details matching the identity proof for refund credit</li>
          <li>Where applicable, supporting documentation (visa rejection letter, medical certificate, etc.)</li>
        </ul>
        <p>Incomplete or unverifiable documentation may delay or invalidate the refund request at the sole discretion of the Company.</p>`,
      },
      {
        n: "09",
        h: "Chargeback & Payment Dispute Protection",
        body: `<p>By initiating payment, the Client expressly acknowledges and agrees that:</p>
        <ul>
          <li>All disputes regarding payment must be raised in writing with the Company within fourteen (14) days of the invoice date, prior to initiating any chargeback</li>
          <li>Initiating a chargeback without prior written communication shall constitute a material breach of these terms</li>
          <li>In the event of an unjustified chargeback, the Company reserves the right to recover the disputed amount in full plus applicable legal fees, administrative costs, and interest</li>
          <li>The Company will cooperate fully with payment processor investigations and may submit all relevant booking, supplier, and delivery evidence to contest fraudulent or bad-faith chargebacks</li>
        </ul>`,
      },
      {
        n: "10",
        h: "Currency & Forex Clause",
        body: `<p>All international contracts shall specify the billing currency at the time of booking confirmation. Where services are billed in USD and payments are received in INR (or vice versa), the exchange rate applied shall be the prevailing interbank rate on the date of payment confirmation. The Company shall not be liable for losses arising from currency fluctuation after invoice issuance.</p>`,
      },
      {
        n: "11",
        h: "Itinerary Changes Mid-Trip",
        body: `<p>Where on-trip modifications are requested by the Client (added nights, upgraded rooms, additional activities, route changes), the Client agrees to settle additional costs directly with the Company within seven (7) days of return. Such mid-trip modifications are non-refundable once delivered.</p>
        <p>Where on-trip modifications are required for safety, weather, or supplier reasons, the Company will substitute equivalent or superior alternatives where reasonably possible at no additional cost to the Client.</p>`,
      },
      {
        n: "12",
        h: "Dispute Resolution",
        body: `<p>All billing or refund disputes must be raised in writing within fourteen (14) days of invoice issuance or trip completion (whichever is later). Disputes raised beyond this period shall be deemed waived. The Company's billing team shall acknowledge disputes within 48 hours and seek to resolve them within fifteen (15) business days. Unresolved disputes shall be escalated in accordance with the Governing Law provisions in our Terms of Service.</p>`,
      },
    ],
  },
};
