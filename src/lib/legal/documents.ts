/**
 * Legal documents shown at /legal/*.
 *
 * DRAFT — written from the business rules in src/agents/business.md. Must be
 * reviewed by a qualified lawyer (Indonesia, plus Malaysia/Singapore if we sell
 * there) before launch. Replace every [BRACKETED] placeholder.
 */

export type LegalBlock = string | { list: string[] };

export type LegalSection = {
  id: string;
  title: string;
  body: LegalBlock[];
};

export type LegalDoc = {
  slug: LegalSlug;
  title: string;
  navLabel: string;
  summary: string;
  updated: string; // ISO date
  sections: LegalSection[];
};

export const LEGAL_SLUGS = ["terms", "privacy", "intellectual-property"] as const;
export type LegalSlug = (typeof LEGAL_SLUGS)[number];

const COMPANY = "[PT Company Name]";
const SUPPORT_EMAIL = "support@example.com";
const LEGAL_EMAIL = "legal@example.com";
const PRIVACY_EMAIL = "privacy@example.com";
const UPDATED = "2026-11-14";

export const LEGAL_CONTACT = { company: COMPANY, support: SUPPORT_EMAIL, legal: LEGAL_EMAIL, privacy: PRIVACY_EMAIL };

const terms: LegalDoc = {
  slug: "terms",
  title: "Terms of Service",
  navLabel: "Terms of Service",
  summary:
    "The agreement between you and printexo when you create an account, design products, connect shops, fund your wallet and have orders produced through the platform.",
  updated: UPDATED,
  sections: [
    {
      id: "acceptance",
      title: "1. Acceptance of these terms",
      body: [
        `These Terms of Service ("Terms") are an agreement between you and ${COMPANY} ("printexo", "we", "us"). By creating an account, ticking the box at signup, or using the platform, you agree to these Terms, our Privacy Policy and our Intellectual Property Policy.`,
        "If you use printexo on behalf of a business, you confirm you are authorised to bind that business, and \"you\" means that business.",
        "You must be at least 18 years old, or the age of legal majority where you live, to use printexo.",
      ],
    },
    {
      id: "service",
      title: "2. What printexo does",
      body: [
        "printexo is a print-on-demand fulfilment service. We let you design custom products, map them to listings in your own online shops, and have orders from those shops produced and shipped by our production partners.",
        "You are the seller. You set your own retail prices, sell to your customers through your shops on TikTok Shop, Shopee, Shopify or other channels, and receive payment from those marketplaces. We do not sell to your customers and never handle your retail revenue.",
        "We charge you a production charge per order, paid from your prepaid wallet.",
      ],
    },
    {
      id: "account",
      title: "3. Your account and shops",
      body: [
        {
          list: [
            "Give accurate, current information at signup and keep it up to date.",
            "Keep your login details secure. You are responsible for everything done through your account.",
            "One account can connect any number of shops, including several on the same marketplace. You must be authorised to operate every shop you connect.",
            "You must follow the rules of each marketplace you sell on. We are not responsible for actions a marketplace takes against your shop.",
            `Tell us at ${SUPPORT_EMAIL} straight away if you suspect unauthorised access.`,
          ],
        },
      ],
    },
    {
      id: "designs",
      title: "4. Designs and review",
      body: [
        "You can upload images and create designs in the Design Studio. Every submitted design version is reviewed by our team before it can be produced.",
        {
          list: [
            "A submitted design version is locked. Editing it creates a new version that is reviewed again. Orders always print the exact version that was approved when the SKU was mapped.",
            "We may reject a design for low print quality, artwork outside the print area, prohibited content or suspected infringement, and will tell you why.",
            "Approval only means a design meets our production requirements. It is not a legal clearance, and you remain fully responsible for the rights to your artwork (see the Intellectual Property Policy).",
            "On-screen previews and mockups are approximations. Small variations in colour, placement and finish are normal in printing and are not defects.",
          ],
        },
      ],
    },
    {
      id: "orders",
      title: "5. Orders and production",
      body: [
        "Orders from your connected shops are matched to your SKUs by SKU code. An order may be held if the SKU is unknown or inactive, the design is not yet approved, the print file is not ready, or your wallet balance is too low. Held orders are re-checked automatically once the issue is fixed.",
        "Every order is reviewed by us before it is sent to production. We may refuse or cancel an order that breaks these Terms or the law.",
        "Production times shown on the site are estimates in business days and are not guaranteed. Delivery times depend on the courier.",
        "You are responsible for the accuracy of the shipping address and recipient details passed from your shop.",
      ],
    },
    {
      id: "payments",
      title: "6. Pricing, wallet and payments",
      body: [
        "Prices are in Indonesian Rupiah (IDR) unless stated otherwise. The production charge for an order is the product cost, print fees, fulfilment fee and, where applicable, shipping, as shown in your dashboard at the time the order is approved.",
        {
          list: [
            "You pay through a prepaid wallet topped up via our payment providers. We do not store your full card details.",
            "When we approve an order, its charge is reserved from your available balance. When the order is sent to production, the reserved amount is captured and becomes non-refundable, except as described in section 8.",
            "If an approved order is cancelled or put on hold before production, the reserved amount is released back to your wallet.",
            "Marketplace fees, margins and suggested retail prices shown on the site are estimates to help you plan. We are not responsible for your pricing decisions or profitability.",
            "Prices may change. Changes never affect orders that have already been approved.",
            "You are responsible for any taxes on your own sales. Our charges include or exclude applicable taxes as shown on your invoice.",
          ],
        },
        "[Confirm: minimum top-up amount and whether unused wallet balances can be withdrawn as cash.]",
      ],
    },
    {
      id: "cancellations",
      title: "7. Cancellations",
      body: [
        "You can cancel an order at any time before it is sent to production, at no cost. Once an order has been sent to production the item is being made to order and cannot be cancelled for a refund.",
      ],
    },
    {
      id: "returns",
      title: "8. Defects, returns and refunds",
      body: [
        {
          list: [
            "Misprinted or damaged items: report them within 7 days of delivery with a clear photo. If we confirm the defect, we will reprint the item or refund its production cost to your wallet, at our choice.",
            "Change-of-mind returns from your customers are handled by your shop under your own return policy, because every item is custom-made.",
            "We do not refund defects caused by artwork you supplied (for example low resolution or content in the safe zone after a warning), an incorrect address, or a failed delivery the recipient caused.",
          ],
        },
      ],
    },
    {
      id: "acceptable-use",
      title: "9. Acceptable use",
      body: [
        "You must not use printexo to create, list or sell products that:",
        {
          list: [
            "infringe anyone's copyright, trademark, design, publicity or other rights;",
            "are illegal, or promote violence, terrorism, hatred or discrimination;",
            "contain sexual content involving minors, or explicit adult content;",
            "are defamatory, harassing, or reveal someone's private information;",
            "are fraudulent or misleading, including counterfeit goods.",
          ],
        },
        "You must also not interfere with the platform, attempt to access other users' data, scrape it, or reverse-engineer it.",
      ],
    },
    {
      id: "suspension",
      title: "10. Suspension and termination",
      body: [
        "You can close your account at any time by contacting support. Any orders already sent to production will still be completed and charged.",
        "We may suspend or close your account, reject designs or hold orders if you break these Terms, repeatedly infringe intellectual property, fail to pay, or if required by law or a marketplace. Where reasonable, we will tell you first and give you a chance to fix the problem.",
        "[Confirm: what happens to any remaining wallet balance on closure.]",
      ],
    },
    {
      id: "liability",
      title: "11. Disclaimers and liability",
      body: [
        "The platform is provided \"as is\". We work to keep it available and accurate, but we do not guarantee it will be uninterrupted or error-free, or that marketplace integrations will always be available.",
        "To the extent permitted by law, we are not liable for indirect or consequential losses, including lost profits, lost sales or damage to your shop's reputation. Our total liability for any claim relating to an order is limited to the production charge you paid for that order, and in all other cases to the total production charges you paid us in the 3 months before the claim.",
        "Nothing in these Terms limits liability that cannot be limited under applicable law.",
      ],
    },
    {
      id: "indemnity",
      title: "12. Indemnity",
      body: [
        "You agree to compensate us for claims, losses and costs (including reasonable legal fees) that arise from your designs, your products, your shops, your dealings with your customers, or your breach of these Terms or the rights of others.",
      ],
    },
    {
      id: "changes",
      title: "13. Changes to these terms",
      body: [
        "We may update these Terms. We will show the date of the latest version at the top of this page and, for material changes, notify you by email or in your dashboard at least 14 days before they take effect. Continuing to use printexo after that means you accept the updated Terms.",
      ],
    },
    {
      id: "law",
      title: "14. Governing law and disputes",
      body: [
        "These Terms are governed by the laws of the Republic of Indonesia. We will first try to resolve any dispute with you in good faith. If that fails within 30 days, the dispute will be settled by [the District Court of South Jakarta / BANI arbitration — confirm].",
      ],
    },
    {
      id: "contact",
      title: "15. Contact",
      body: [`${COMPANY}, [registered address]. Email ${SUPPORT_EMAIL} for support or ${LEGAL_EMAIL} for legal matters.`],
    },
  ],
};

const privacy: LegalDoc = {
  slug: "privacy",
  title: "Privacy Policy",
  navLabel: "Privacy Policy",
  summary:
    "What personal data printexo collects, why we use it, who we share it with, and the rights you have over it.",
  updated: UPDATED,
  sections: [
    {
      id: "scope",
      title: "1. Who we are and what this covers",
      body: [
        `${COMPANY} ("printexo", "we") is the controller of the personal data described in this policy. It applies to our website, the user workspace and our services.`,
        "We follow Indonesia's Personal Data Protection Law (Law No. 27 of 2022) and, where they apply, Malaysia's Personal Data Protection Act 2010 and Singapore's Personal Data Protection Act 2012.",
        "For the shipping details of your customers that we receive from your shops, you are the controller and we process that data on your behalf, only to produce and deliver orders.",
      ],
    },
    {
      id: "data-we-collect",
      title: "2. Data we collect",
      body: [
        {
          list: [
            "Account data: name, email address, WhatsApp/phone number, country, and the marketplace you sell on most.",
            "Shop data: the shops you connect, shop names, and the access tokens needed to sync orders (stored encrypted).",
            "Design data: images you upload, text and layouts you create, and the print files we generate from them.",
            "Order data: SKU, quantity, and the recipient name, phone number and shipping address passed from your shops.",
            "Payment data: wallet top-ups, charges and refunds. Card and bank details are handled by our payment providers; we receive only confirmation and limited details such as the last four digits.",
            "Usage data: IP address, device and browser type, pages visited, and log data for security and troubleshooting.",
            "Support data: messages you send us.",
          ],
        },
      ],
    },
    {
      id: "how-we-use",
      title: "3. How we use your data",
      body: [
        {
          list: [
            "To create and run your account, and to sync and fulfil orders (performance of our contract with you).",
            "To review designs, prevent fraud and infringement, and keep the platform secure (our legitimate interests).",
            "To process payments, keep accounting records and meet tax and legal obligations (legal obligation).",
            "To send you service messages about orders, designs, your wallet and changes to our terms.",
            "To send product news and offers, only if you agree. You can unsubscribe at any time (consent).",
            "To improve the platform using aggregated or de-identified usage data.",
          ],
        },
        "We do not sell your personal data, and we do not use your designs to train AI models without your explicit consent.",
      ],
    },
    {
      id: "sharing",
      title: "4. Who we share it with",
      body: [
        {
          list: [
            "Production partners (such as our supplier MQC), who receive print files, product details and recipient shipping details to produce and ship orders.",
            "Couriers, who receive the recipient's name, phone number and address.",
            "Marketplaces you connect (TikTok Shop, Shopee, Shopify), to sync orders, statuses and tracking numbers.",
            "Payment providers (such as Midtrans, Xendit or Stripe) to process top-ups.",
            "Service providers who host our infrastructure, store files, send email, or provide analytics and support tools, under contracts that require them to protect your data.",
            "Authorities or other parties where required by law, or to protect our rights, users or the public — for example in response to a valid infringement claim.",
            "A buyer or successor if our business is merged, sold or restructured.",
          ],
        },
      ],
    },
    {
      id: "transfers",
      title: "5. International transfers",
      body: [
        "Some of our service providers may store or process data outside your country. When that happens we use providers that offer a level of protection at least equivalent to the law that applies to you, and appropriate contractual safeguards.",
      ],
    },
    {
      id: "retention",
      title: "6. How long we keep it",
      body: [
        {
          list: [
            "Account and design data: while your account is open, then up to [12] months after closure unless you ask us to delete it sooner.",
            "Orders, invoices and wallet ledger records: for as long as tax and accounting law requires (typically 10 years in Indonesia).",
            "Recipient shipping details: up to [6] months after delivery, to handle defect claims and delivery issues.",
            "Logs: up to [12] months.",
          ],
        },
      ],
    },
    {
      id: "security",
      title: "7. Security",
      body: [
        "Uploaded artwork and print files are stored privately and served only through time-limited signed links. Marketplace credentials and payment data are encrypted. Access to data is restricted by account, and admin actions on designs, orders and money are logged.",
        "No system is perfectly secure. If a data breach affects you, we will notify you and the relevant authority as the law requires.",
      ],
    },
    {
      id: "your-rights",
      title: "8. Your rights",
      body: [
        "Depending on where you live, you can ask us to:",
        {
          list: [
            "tell you what personal data we hold and give you a copy;",
            "correct inaccurate or incomplete data;",
            "delete your data or close your account;",
            "restrict or object to certain uses;",
            "move your data to another service in a common format;",
            "withdraw consent you have given, such as for marketing.",
          ],
        },
        `Email ${PRIVACY_EMAIL}. We will reply within the time the law requires (generally 3 × 24 hours to acknowledge under Indonesian law). You can also complain to the data protection authority in your country.`,
      ],
    },
    {
      id: "cookies",
      title: "9. Cookies and local storage",
      body: [
        "We use cookies and browser storage that are necessary to keep you signed in and remember your settings, and, with your consent, analytics cookies to understand how the site is used. You can block cookies in your browser, but parts of the platform may not work.",
      ],
    },
    {
      id: "children",
      title: "10. Children",
      body: ["printexo is for businesses and adults. We do not knowingly collect data from anyone under 18."],
    },
    {
      id: "changes",
      title: "11. Changes",
      body: [
        "We will post any update on this page with a new date, and notify you of significant changes by email or in your dashboard.",
      ],
    },
    {
      id: "contact",
      title: "12. Contact",
      body: [`Data protection contact: ${PRIVACY_EMAIL}, ${COMPANY}, [registered address].`],
    },
  ],
};

const ip: LegalDoc = {
  slug: "intellectual-property",
  title: "Intellectual Property Policy",
  navLabel: "Intellectual Property",
  summary:
    "Who owns what on printexo, what you may upload and print, and how to report artwork that infringes your rights.",
  updated: UPDATED,
  sections: [
    {
      id: "your-content",
      title: "1. You own your designs",
      body: [
        "You keep ownership of the artwork, text and designs you upload or create on printexo (\"Your Content\"). We do not claim ownership of it.",
      ],
    },
    {
      id: "licence",
      title: "2. Licence you give us",
      body: [
        "So we can run the service, you give printexo a non-exclusive, worldwide, royalty-free licence to store, copy, resize, convert into print files, print, and reproduce Your Content on products you order, and to show it to you and to our reviewers and production partners.",
        "We will not use Your Content in our own marketing or show it publicly without your permission. The licence ends when you delete the design or close your account, except for orders already in production and copies we must keep for legal records.",
      ],
    },
    {
      id: "your-promise",
      title: "3. Your responsibility for rights",
      body: [
        "When you sign up and each time you upload or submit a design, you confirm that:",
        {
          list: [
            "you created the artwork yourself, or you hold a licence that allows it to be printed on products and sold commercially;",
            "it does not infringe any copyright, trademark, industrial design, right of publicity or other right of any person;",
            "you have permission from any identifiable person shown in it.",
          ],
        },
        "Our design review checks print quality and obvious violations. It is not a legal clearance, and approval does not move responsibility for rights to us.",
      ],
    },
    {
      id: "not-allowed",
      title: "4. What is not allowed",
      body: [
        "Unless you have a licence from the owner, do not upload:",
        {
          list: [
            "brand names, logos or trademarks, including sports teams, bands, games and fashion labels;",
            "characters, scenes or artwork from films, TV, anime, comics or games;",
            "images, illustrations, photos or fonts copied from the internet without a commercial licence;",
            "song lyrics, book passages or quotes protected by copyright;",
            "the name, face or signature of a celebrity or other real person;",
            "designs that imitate a protected product or are made to look like official merchandise.",
          ],
        },
        "Free-to-download does not mean free to sell. Check the licence of any stock image, font or template you use.",
      ],
    },
    {
      id: "our-ip",
      title: "5. printexo's own intellectual property",
      body: [
        "The printexo name, logo, website, software, Design Studio, templates, mockups and product photos belong to us or our licensors. You may use our templates and mockups only to create and promote products fulfilled through printexo. You may not copy, resell or reuse our platform or brand without written permission.",
      ],
    },
    {
      id: "reporting",
      title: "6. Reporting infringement",
      body: [
        `If you believe a product made through printexo infringes your rights, email ${LEGAL_EMAIL} with:`,
        {
          list: [
            "your name, contact details, and the name of the rights owner if you act for them;",
            "a description of the work or trademark you own, with registration numbers if available;",
            "where the infringing product appears (shop and listing link, or SKU code);",
            "a statement that you believe in good faith the use is not authorised, and that the information you give is accurate.",
          ],
        },
        "We will review the report, may remove or block the design and pause related SKUs, and will tell the user concerned.",
      ],
    },
    {
      id: "counter-notice",
      title: "7. If your design is reported",
      body: [
        `If your design is removed after a report and you believe this was a mistake, or you have a licence, reply to our notice or email ${LEGAL_EMAIL} with your explanation and any proof. We may share it with the person who reported you and may restore the design if the issue is resolved.`,
      ],
    },
    {
      id: "repeat",
      title: "8. Repeat infringement",
      body: [
        "We reject infringing designs. Users who repeatedly upload infringing content will have their accounts suspended or closed. Orders for removed designs may be cancelled, and any reserved amounts are released to your wallet.",
      ],
    },
    {
      id: "contact",
      title: "9. Contact",
      body: [`Intellectual property matters: ${LEGAL_EMAIL}, ${COMPANY}, [registered address].`],
    },
  ],
};

export const LEGAL_DOCS: Record<LegalSlug, LegalDoc> = {
  terms,
  privacy,
  "intellectual-property": ip,
};

export const legalHref = (slug: LegalSlug) => `/legal/${slug}`;
