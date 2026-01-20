const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  ImageRun,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  BorderStyle,
  ShadingType,
  VerticalAlign,
  TableLayoutType,
  FootnoteReferenceRun,
  LineRuleType,
  convertInchesToTwip,
} = require("docx");
const fs = require("fs");
const path = require("path");

// ============================================
// CONSTANTS & CONFIGURATION
// ============================================

const COLORS = {
  BAIN_BLUE: "004C97",
  DARK_GRAY: "333333",
  MEDIUM_GRAY: "666666",
  LIGHT_GRAY: "999999",
  TABLE_HEADER_BG: "F5F5F5",
  RED: "CC0000",
  WHITE: "FFFFFF",
};

const FONT = "Times New Roman";

const SIZES = {
  MAIN_TITLE: 88,
  SUBTITLE: 48,
  SECTION_HEADER: 28,
  SUBSECTION_HEADER: 24,
  BODY: 22,
  FIGURE_CAPTION: 18,
  FOOTNOTE: 16,
};

const SPACING = {
  PARAGRAPH_AFTER: 200,
  LINE_SPACING: 276,
};

const MEDIA_PATH = path.join(__dirname, "unpacked", "word", "media");

function loadImage(filename) {
  return fs.readFileSync(path.join(MEDIA_PATH, filename));
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function sectionHeader(text, pageBreak = false) {
  const children = [
    new TextRun({ text, font: FONT, size: SIZES.SECTION_HEADER, bold: true, color: COLORS.BAIN_BLUE }),
  ];
  if (pageBreak) children.unshift(new PageBreak());
  return new Paragraph({ children, spacing: { before: pageBreak ? 0 : 300, after: 200 } });
}

function subHeader(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: FONT, size: SIZES.SUBSECTION_HEADER, bold: true, color: COLORS.DARK_GRAY })],
    spacing: { before: 200, after: 100 },
  });
}

function bodyPara(children, options = {}) {
  return new Paragraph({
    children: Array.isArray(children) ? children : [new TextRun({ text: children, font: FONT, size: SIZES.BODY, color: COLORS.DARK_GRAY })],
    spacing: { after: options.spacingAfter || SPACING.PARAGRAPH_AFTER, line: SPACING.LINE_SPACING, lineRule: LineRuleType.AUTO },
    alignment: options.alignment || AlignmentType.JUSTIFIED,
    // NO shading property - removes all highlighting
  });
}

function text(t, opts = {}) {
  return new TextRun({ text: t, font: FONT, size: SIZES.BODY, color: opts.color || COLORS.DARK_GRAY, bold: opts.bold, italics: opts.italics });
}

function figureCaption(txt) {
  return new Paragraph({
    children: [new TextRun({ text: txt, font: FONT, size: SIZES.FIGURE_CAPTION, italics: true, color: COLORS.MEDIUM_GRAY })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 60, after: 200 },
  });
}

function createImage(filename, widthPx, heightPx) {
  const ext = filename.split(".").pop().toLowerCase();
  return new Paragraph({
    children: [new ImageRun({ data: loadImage(filename), transformation: { width: widthPx, height: heightPx }, type: ext === "jpg" || ext === "jpeg" ? "jpg" : "png" })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 60 },
  });
}

function emptyPara(spacing = 100) {
  return new Paragraph({ children: [], spacing: { after: spacing } });
}

function createFinancialTable(headers, data) {
  const headerCells = headers.map(h => new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text: h, font: FONT, size: 16, bold: true, color: COLORS.DARK_GRAY })], alignment: AlignmentType.CENTER })],
    shading: { type: ShadingType.CLEAR, fill: COLORS.TABLE_HEADER_BG },
    verticalAlign: VerticalAlign.CENTER,
  }));
  const dataCells = data.map(v => new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text: v, font: FONT, size: 16, color: v.includes("-") && !v.includes("$") ? COLORS.RED : COLORS.DARK_GRAY })], alignment: AlignmentType.CENTER })],
    verticalAlign: VerticalAlign.CENTER,
  }));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [new TableRow({ children: headerCells }), new TableRow({ children: dataCells })],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.LIGHT_GRAY },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.LIGHT_GRAY },
      left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.LIGHT_GRAY },
      right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.LIGHT_GRAY },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: COLORS.LIGHT_GRAY },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: COLORS.LIGHT_GRAY },
    },
  });
}

// ============================================
// FOOTNOTES - PROPER ACADEMIC CITATIONS
// ============================================

function fn(t) {
  return new Paragraph({ children: [new TextRun({ text: t, font: FONT, size: SIZES.FOOTNOTE, italics: true, color: COLORS.MEDIUM_GRAY })] });
}

const footnotes = {
  1: { children: [fn("Schneider, J. et al. (2018). \"Global Technology B2B: How the Next Payments Frontier Will Unleash Small Business.\" Goldman Sachs Research.")] },
  2: { children: [fn("Ekberg, J. et al. (2021). \"Unlocking $120 Billion Value in Cross-Border Payments.\" Oliver Wyman.")] },
  3: { children: [fn("Ingham, L. & McKee, J. (2023). \"How Big Is the B2B Cross-Border Payments Market?\" FXC Intelligence.")] },
  4: { children: [fn("Rodriguez Cruz, G. (2022). \"What Will Be the Impact of Blockchain on You?\" Analytics Vidhya.")] },
  5: { children: [fn("Rodriguez Cruz, G. (2022). \"What Is Blockchain?\" Money.com.")] },
  6: { children: [fn("A validator is a node on the blockchain that validates if a transaction is trustworthy or not.")] },
  7: { children: [fn("Ekberg, J. et al. (2021). \"Unlocking $120 Billion Value in Cross-Border Payments.\" Oliver Wyman.")] },
  8: { children: [fn("Ekberg, J. et al. (2021). \"Unlocking $120 Billion Value in Cross-Border Payments.\" Oliver Wyman.")] },
  9: { children: [fn("Ahmed, S. (2022). \"How Blockchain Is Shaking SWIFT and Global Payment Systems.\" CoinMarketCap.")] },
  10: { children: [fn("Ibid.")] },
  11: { children: [fn("Corporate Finance Institute. \"Ripple.\" Corporate Finance Institute Resources.")] },
  12: { children: [fn("Yahoo Finance. \"JPMorgan Chase & Co. Company Profile.\" Yahoo Finance.")] },
  13: { children: [fn("JPMorgan Onyx. \"Digital Financing.\" JPMorgan Content Hub.")] },
  14: { children: [fn("Oliver Wyman estimates that the financial services industry could save $100Bn in transaction costs with this technology.")] },
  15: { children: [fn("Castillo, M. (2023). \"Broadridge Now Conducts $70 Billion of Blockchain Repo Trades Per Day.\" Forbes.")] },
  16: { children: [fn("Perlin, D., Roswell, M., & Inglis, M. (2023). \"Broadridge Financial Solutions, Inc.: Classic Compounder; Initiate at Outperform.\" RBC Capital Markets.")] },
  17: { children: [fn("Yahoo Finance. \"Adyen N.V. Company Profile.\" Yahoo Finance.")] },
  18: { children: [fn("Payoneer Investor Relations. (2022). \"Fourth Quarter and Full Year 2021 Financial Results.\" Payoneer.")] },
  19: { children: [fn("See Appendix E for detailed breakdown of RippleNet.")] },
  20: { children: [fn("Gondek, C. \"Which Banks Use Ripple XRP and Why.\" OriginStamp.")] },
  21: { children: [fn("Ripple. \"Payments by the Numbers Guide.\" Ripple Reports.")] },
  22: { children: [fn("Business Wire. (2023). \"TassatPay Exceeds $1 Trillion in Real-Time Transactions.\" Business Wire.")] },
  23: { children: [fn("Fedwire functionality means users of TassatPay can seamlessly connect to the Federal Reserve's Fedwire system.")] },
  24: { children: [fn("FDIC. (2021). \"Request for Information on Digital Assets.\" Federal Register Publications.")] },
  25: { children: [fn("Business Wire. (2023). \"TassatPay Exceeds $1 Trillion in Real-Time Transactions.\" Business Wire.")] },
  26: { children: [fn("Author's estimate using 8x total common equity multiple, assuming $24M total common equity and $200M value of patents and intellectual property.")] },
  27: { children: [fn("FDIC. (2021). \"Request for Information on Digital Assets.\" Federal Register Publications.")] },
  28: { children: [fn("Business Wire. (2023). \"TassatPay Exceeds $1 Trillion in Real-Time Transactions.\" Business Wire.")] },
  29: { children: [fn("XRP is the digital currency used by RippleNet.")] },
  30: { children: [fn("Ripple. \"Payments by the Numbers Guide.\" Ripple Reports.")] },
  31: { children: [fn("Ripple XRP Escrow Discussion. Quora.")] },
  32: { children: [fn("Investment U. \"Ripple IPO.\" Investment U.")] },
  33: { children: [fn("JPMorgan. \"ISO 20022 Migration.\" Treasury Payments Insights.")] },
  34: { children: [fn("IBM Institute for Business Value & The Economist Intelligence Unit. (2016). \"Leading the Pack in Blockchain Banking: Trailblazers Set the Pace.\"")] },
  35: { children: [fn("CoinDesk. Bitcoin Price Data.")] },
  36: { children: [fn("B2B = Business to Business.")] },
};

// ============================================
// DOCUMENT CONTENT
// ============================================

const content = [
  // ========================================
  // TITLE PAGE
  // ========================================
  new Paragraph({
    children: [new TextRun({ text: "August 2023", font: FONT, size: 20, color: COLORS.MEDIUM_GRAY })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "How Blockchain can disrupt the B2B Cross-Border Payment Industry and Companies that will be materially impacted.", font: FONT, size: SIZES.MAIN_TITLE, bold: true, color: COLORS.BAIN_BLUE })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "By Oliver Molz", font: FONT, size: 24, italics: true, color: COLORS.DARK_GRAY })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 300 },
  }),

  // KEY POINTS
  subHeader("Key Points"),
  bodyPara([
    text("Goldman Sachs estimates a $950bn revenue opportunity for companies that provide improved means for specialized B2B"),
    new FootnoteReferenceRun(36),
    text(" solutions for cross-border payments, disbursements, and working capital financing. They see this broader B2B revenue opportunity reaching $1.5tn by 2028"),
    new FootnoteReferenceRun(1),
    text(". Companies that build a blockchain specified for B2B cross-border transactions will gain significant share of that revenue opportunity as blockchain technology provides faster, more secure, and more transparent transactions than legacy methods. Blockchain can also improve margins on transaction costs by up to 83%"),
    new FootnoteReferenceRun(2),
    text("."),
  ]),

  // INVESTMENT OPPORTUNITIES TABLE
  subHeader("Investment Opportunities Covered"),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Winners", font: FONT, size: 20, bold: true, color: COLORS.WHITE })], alignment: AlignmentType.CENTER })], shading: { type: ShadingType.CLEAR, fill: COLORS.BAIN_BLUE } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Losers", font: FONT, size: 20, bold: true, color: COLORS.WHITE })], alignment: AlignmentType.CENTER })], shading: { type: ShadingType.CLEAR, fill: COLORS.BAIN_BLUE } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Intriguing Private Companies", font: FONT, size: 20, bold: true, color: COLORS.WHITE })], alignment: AlignmentType.CENTER })], shading: { type: ShadingType.CLEAR, fill: COLORS.BAIN_BLUE } }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Visa, Broadridge, JP Morgan", font: FONT, size: 18 })], alignment: AlignmentType.CENTER })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Payoneer, Adyen, Western Union", font: FONT, size: 18 })], alignment: AlignmentType.CENTER })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tassat Group, Ripple", font: FONT, size: 18 })], alignment: AlignmentType.CENTER })] }),
        ],
      }),
    ],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.LIGHT_GRAY },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.LIGHT_GRAY },
      left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.LIGHT_GRAY },
      right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.LIGHT_GRAY },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: COLORS.LIGHT_GRAY },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: COLORS.LIGHT_GRAY },
    },
  }),
  emptyPara(150),

  // Broadridge recommendation - NO HIGHLIGHTING, just bold
  bodyPara([
    text("The most interesting investment opportunity for Poplar Forest is ", { bold: true }),
    text("Broadridge", { bold: true, color: COLORS.BAIN_BLUE }),
    text(". While the valuation is certainly above what the firm usually seeks, Broadridge has a large moat, and its blockchain services are undervalued by the market.", { bold: true }),
  ]),

  // ========================================
  // THESIS (PAGE BREAK)
  // ========================================
  sectionHeader("Thesis", true),
  bodyPara([
    text("The B2B cross-border payments TAM is expected to be $39.3 trillion in 2023 and grow 43% to $56.1 trillion by 2030"),
    new FootnoteReferenceRun(3),
    text(". Blockchain technology eliminates the need for intermediaries in industries with low trust due to the technology's inherent security. With no intermediaries, transactions are cheaper, faster, and more secure. As such, digital payment companies that utilize blockchain technology will gain control of a significant portion of the B2B cross-border payments market by 2030."),
  ]),
  bodyPara("Why do I think this will happen?"),
  bodyPara("Currently, the B2B cross-border payments industry is one-dimensional as essentially all competitors use the same technology, SWIFT GPI. Brand recognition and negligibly different transaction fees are the current differentiating factors. The priorities for businesses when choosing payment methods are efficiency, cost, and reliability, and blockchain technology is the most affordable, reliable, and efficient way to make B2B cross-border payments."),

  // Figure 1 context
  bodyPara("The following figure illustrates the current state of B2B cross-border payments, including transaction volumes, costs, and processing times that represent the market opportunity for blockchain-based solutions:"),
  createImage("image4.png", 500, 280),
  figureCaption("Figure 1: Cross-border payments market overview"),
  bodyPara("As shown above, the cross-border payments market represents substantial volume with significant inefficiencies in cost and processing time that blockchain technology can address."),

  // Figure 2 context
  bodyPara("Understanding business priorities is essential for evaluating blockchain adoption potential. The following survey data from the Association for Financial Professionals (AFP) reveals what factors matter most to businesses when selecting payment methods:"),
  createImage("image14.png", 500, 320),
  figureCaption("Figure 2: Business priorities survey (AFP 2022)"),
  bodyPara("The survey confirms that efficiency, cost, and reliability rank as top priorities—precisely the areas where blockchain technology offers substantial improvements over legacy systems."),

  // ========================================
  // BLOCKCHAIN TECHNOLOGY (PAGE BREAK)
  // ========================================
  sectionHeader("Blockchain Technology", true),
  bodyPara([
    text("The consensus on blockchain and digital currency is that they were simply fads that did not and will not live up to expectations. A couple of misconceptions are that blockchain's primary use case is for digital currencies and that digital currencies should be an investable asset class. Rampant speculation in the digital currency market tainted not only digital currencies but also the technology itself. Blockchain has the potential to improve many industries, especially B2B cross-border payments. Blockchain technology's decentralization feature allows blockchain-based digital payment companies to overcome common obstacles centralized institutions face when sending money across borders, such as slow transaction times, lack of transparency, and costly fees"),
    new FootnoteReferenceRun(4),
    text("."),
  ]),
  bodyPara([
    text("A blockchain can be compared to how a Google document operates. When sharing a document with a group of people, rather than being transferred or copied, that document is distributed. This creates a decentralized distribution chain that allows everyone simultaneous access to the base document. Changes need to be approved before being added to the master document. Once added, all changes are recorded and visible in real time, making all alterations completely transparent. A unique feature of a blockchain, though, is once something is recorded, it becomes immutable"),
    new FootnoteReferenceRun(5),
    text("."),
  ]),
  bodyPara("The immutability of blockchain means a user can access all transactions that occurred with full certainty that the ledger hasn't been tarnished, adding to the transparency and security of blockchain."),
  bodyPara("These features make blockchain so inherently secure that it eliminates the need for intermediaries such as a bank. Transactions can be processed within a few seconds, drastically faster than traditional payment methods. Intermediary fees are also eliminated, lowering the overall transaction fee of payments."),
  bodyPara("Companies that utilize blockchain will have a superior product and a margin advantage in an industry of clones."),

  // Figure 3 context
  bodyPara("The following diagram illustrates how blockchain processes transactions through its distributed ledger system, demonstrating the verification and consensus mechanisms that ensure security:"),
  createImage("image13.jpg", 420, 280),
  figureCaption("Figure 3: Blockchain Process Visualization"),
  bodyPara("This process shows how transactions are validated across multiple nodes before being permanently recorded, eliminating single points of failure and the need for trusted intermediaries."),

  // Figure 4 context
  bodyPara("Research has identified several key benefits that blockchain technology offers for cross-border payments applications:"),
  createImage("image6.png", 480, 300),
  figureCaption("Figure 4: Potential Benefits of Blockchain"),
  bodyPara("These benefits—including reduced costs, faster settlement times, enhanced security, and improved transparency—directly address the pain points businesses experience with current payment systems."),

  // ========================================
  // PUBLIC VS PERMISSIONED (PAGE BREAK)
  // ========================================
  sectionHeader("Public (Permissionless) vs. Permissioned Blockchain", true),
  bodyPara("A public or permissionless blockchain is defined by the fact that anyone can access the blockchain transaction log, and anyone can participate in the network. An example of a public blockchain would be Bitcoin."),
  bodyPara([
    text("Alternatively, a permissioned blockchain allows users who are approved by the central authority to access and use the network. An example of this would be JPMorgan Chase's Onyx blockchain. Permissioned blockchains can easily comply with \"know-your-business\" (KYB) regulations and have much quicker transaction times due to fewer validators"),
    new FootnoteReferenceRun(6),
    text(" on the system. Permissioned blockchains limit who has access to sensitive company data, whereas public blockchains do not. As a result, permissioned blockchains have significantly higher odds of working with banks and large financial institutions than public blockchains."),
  ]),
  bodyPara("I believe that companies that utilize permissioned blockchains are the companies with the potential to disrupt B2B cross-border transactions."),

  // Figure 5 context
  bodyPara("The following Venn diagram illustrates the key differences and overlapping characteristics between public and permissioned blockchain architectures:"),
  createImage("image10.png", 420, 320),
  figureCaption("Figure 5: Public vs. Permissioned Blockchain Comparison"),
  bodyPara("As shown, permissioned blockchains retain blockchain's core security benefits while adding the access controls and compliance features necessary for institutional adoption."),

  // ========================================
  // BARRIERS (PAGE BREAK)
  // ========================================
  sectionHeader("Barriers preventing implementation of blockchain within payment processing", true),
  subHeader("Ease of Development"),
  bodyPara("Blockchain platforms require significant technical expertise that isn't widely available today, as skilled blockchain developers are incredibly scarce. Wages for software engineers specializing in B2B blockchain solutions have increased dramatically."),
  subHeader("A lack of interoperability between blockchains"),
  bodyPara("Interoperability between different blockchains is vital for blockchain technology to reach its full potential in the payment industry. This is currently difficult as each blockchain is essentially its own technical standards community. A blockchain network's users agree on set practices like validation methodology and block size. Two blockchains with different sets of practices achieving interoperability is like a train built for one gauge of rail trying to run on a narrower track. It is possible to bridge two blockchains with different procedures, but it isn't easy, and those bridges are less secure than a blockchain."),
  bodyPara("Interoperability with existing payment systems is easier and currently quite common."),
  subHeader("The lack of clear governance procedures and user protection"),
  bodyPara("Mistakes and fraud occur every day in traditional finance and decentralized finance. While traditional payment platforms provide protections for users, users of decentralized finance have limited recourse options available when theft or mistakes happen. A lack of standardization for these processes across blockchains and exchanges makes it difficult for users to feel protected. This is not the norm, but it is common. Tassat Group, for example, has transparent governance and user protection protocols."),
  subHeader("Difficulty complying with Know-Your-Customer (KYC), Know-Your-Business (KYB), and Anti Money Laundering (AML) regulations"),
  bodyPara("Today's regulated financial services require a high degree of confidence that there is a legitimate counterparty following enforceable laws when completing transactions, not a criminal. Crypto transactions are pseudonymous; it's unclear who is receiving a transaction, but you can see the blockchain address you are transacting with. This makes it difficult for public blockchains to comply with KYC, KYB, and AML regulations and to track down stolen digital assets. Permissioned blockchains solve this problem, as I explained on page 5."),

  // ========================================
  // CURRENT TECHNOLOGY (PAGE BREAK)
  // ========================================
  sectionHeader("Current Technology", true),
  bodyPara("JPMorgan has provided an overview of the current best technology solutions for cross-border payments. Both Ripple and FNALITY utilize blockchain technology:"),
  createImage("image11.png", 480, 320),
  figureCaption("Figure 6: JPMorgan Technology Solutions Overview"),
  bodyPara("This comparison shows blockchain-based solutions alongside traditional methods, highlighting the technological evolution occurring in cross-border payments."),

  subHeader("SWIFT GPI"),
  bodyPara([
    text("The Society for Worldwide Interbank Financial Telecommunications (\"SWIFT\") currently provides the technology for a majority of the B2B cross-border payments in its Global Payment Initiative (\"GPI\"). SWIFT has a significant market share in global payment processing due to its influential members, such as the US Federal Reserve, the Bank of England, the European Central Bank, the Bank of Japan, and other major banks. GPI was developed in 2017 to respond to the threat posed by decentralized ledger technology (DLT) on its incumbent position. GPI partners with more than 11,000 financial institutions and processes $300 billion across 25 million daily transactions"),
    new FootnoteReferenceRun(9),
    text("."),
  ]),
  bodyPara([
    text("Concerns over the lack of initiative in innovation and the fact that there have been several noteworthy cyber attacks on the SWIFT network have left room for companies that utilize blockchain to capture market share. This is precisely why JP Morgan, a member of SWIFT, founded Onyx, a blockchain solution for payment processing"),
    new FootnoteReferenceRun(10),
    text("."),
  ]),
  bodyPara("JPMorgan presented a diagram of cross-border payment flow via correspondent banking, which utilizes GPI. A blockchain-based payment system like Onyx, which uses digital currency, would substantially improve this process:"),
  createImage("image9.png", 500, 280),
  figureCaption("Figure 7: Correspondent Banking Payment Flow"),
  bodyPara("The complexity of the correspondent banking model—with multiple intermediaries each adding fees and delays—illustrates why blockchain's direct settlement capability offers such significant advantages."),

  // ========================================
  // RIPPLENET (PAGE BREAK)
  // ========================================
  sectionHeader("RippleNet", true),
  bodyPara([
    text("RippleNet is the current blockchain that dominates the cross-border blockchain payments market. The following diagram shows how RippleNet facilitates B2B cross-border transactions"),
    new FootnoteReferenceRun(11),
    text(". It uses its native cryptocurrency, XRP, as a bridge to bypass the intermediary leg of the journey, thus lowering transaction fees and processing times. The average payment sent through RippleNet takes about 3 seconds, compared to SWIFT GPI's average processing time of 8 hours and 36 minutes"),
    new FootnoteReferenceRun(19),
    text("."),
  ]),
  createImage("image12.png", 480, 300),
  figureCaption("Figure 8: RippleNet Transaction Flow"),
  bodyPara("The diagram demonstrates how RippleNet eliminates the need for correspondent banks and pre-funded nostro accounts, enabling near-instantaneous settlement across borders."),

  // ========================================
  // INVESTMENT IMPLICATIONS (PAGE BREAK)
  // ========================================
  sectionHeader("Investment Implications", true),
  bodyPara("There are three ways in which investors can and should participate in this critical technology trend: publicly traded companies with emerging exposure to blockchain technology; publicly traded companies whose business models will be significantly diminished by competitors using blockchain; and privately held companies that can either be acquired (strategic/financial buyers) or go public. At this point in my work, Broadridge is the most interesting potential public investment opportunity that can benefit directly from this trend. However, the impact on financial institutions' revenue growth and expense management will be tremendous for those who implement this technology as well."),

  subHeader("Publicly traded companies exposed to blockchain"),

  // JPMORGAN
  subHeader("JP Morgan Chase"),
  createFinancialTable(
    ["Ticker", "Name", "Market Cap", "Div Yield", "P/E Current", "P/E 15yr Avg", "Rev Growth LTM", "Rev Growth L5Y", "EPS Growth LTM", "EPS Growth L5Y"],
    ["JPM", "JPMorgan Chase & Co.", "$448.8B", "2.6%", "10.2", "11.5", "12.1%", "6.1%", "25%", "15.8%"]
  ),
  emptyPara(100),
  bodyPara([
    text("JPMorgan Chase & Co. operates as a financial services company worldwide. It operates through four segments: Consumer & Community Banking (CCB), Corporate & Investment Bank (CIB), Commercial Banking (CB), and Asset & Wealth Management (AWM)"),
    new FootnoteReferenceRun(12),
    text("."),
  ]),
  bodyPara([
    text("JPMorgan Chase invests $12Bn a year in technology, part of which goes towards blockchain R&D. During the past seven years, they have undertaken over 60 blockchain-related proof of concepts focused on internal and external client-facing initiatives. In 2020, they launched their platform Onyx Digital Assets, which has processed over $700 Bn of intraday repo transactions (over three-quarters are backed by government bonds). An Onyx case study with a financial institution found that Onyx reduced operating costs by 56%"),
    new FootnoteReferenceRun(13),
    text("."),
  ]),
  bodyPara([
    text("Not only does this present an attractive value proposition for clients, potentially providing an incremental area of growth, but it also could drastically reduce JP Morgan's operating costs, offsetting increased regulatory costs"),
    new FootnoteReferenceRun(14),
    text("."),
  ]),
  bodyPara("Further work should be done to better estimate blockchain's impact on future revenue growth and JP Morgan's ability to reduce operating costs, but it could be material. Directionally, Onyx is positive, but its order of magnitude is too small to move the needle for JP Morgan as of now."),

  // VISA (PAGE BREAK)
  sectionHeader("Visa", true),
  createFinancialTable(
    ["Ticker", "Name", "Market Cap", "Enterprise Value", "Div Yield", "P/E Current", "P/E 15yr Avg", "Rev Growth LTM", "Rev Growth L5Y", "EPS Growth LTM", "EPS Growth L5Y"],
    ["V", "Visa Inc.", "$488.6B", "$492.2B", "0.7%", "25.2", "25.0", "13.4%", "9.7%", "16.1%", "14.0%"]
  ),
  emptyPara(100),
  bodyPara("Visa Inc. (NYSE: V) is a global payments technology company that operates the world's largest payments network. Visa's main sources of revenue are international transactions, data processing, and service fees."),

  // Figure 9 context
  bodyPara("The following pie chart breaks down Visa's revenue by segment, showing the relative importance of international transactions to the company's business model:"),
  createImage("image8.png", 280, 280),
  figureCaption("Figure 9: Visa Revenue Breakdown"),
  bodyPara("With international transactions representing a significant portion of revenue, Visa has strong incentives to lead in blockchain-based cross-border payment solutions."),

  bodyPara("The company expects to benefit from continued growth in e-commerce and cross-border payments. Visa also expects growth from its new products and services, such as Visa B2B Connect, which enhances transaction fee growth. Visa launched Visa B2B Connect, its blockchain-based payment service built explicitly for B2B cross-border payments, in 2019. Visa B2B connect does not use a digital currency for payments, reducing risk in their transactions, but at the expense of cost and speed."),
  bodyPara("FIS, IBM, and Bottomline are integral parts of the future scale of Visa B2B Connect. If Visa's current EPS of $7.74 grows at a CAGR of 15% for five years and Visa is traded at its historical P/E ratio of 25x, Visa stock will trade at $389, representing a 10%+ IRR. If Visa continues gaining share in B2B cross-border payments as guidance has suggested, mid to high teens revenue growth will be achievable. As Visa B2B connect gains more traction, Visa's margins should improve."),
  bodyPara("Similar to JPMorgan, directionally, Visa B2B Connect is favorable but won't have a significant enough impact on Visa's fundamentals."),

  // BROADRIDGE - KEY RECOMMENDATION (PAGE BREAK) - NO HIGHLIGHTING
  sectionHeader("Broadridge — KEY RECOMMENDATION", true),
  createFinancialTable(
    ["Ticker", "Name", "Market Cap", "Enterprise Value", "Div Yield", "P/E Current", "P/E 15yr Avg", "Rev Growth LTM", "Rev Growth L5Y", "EPS Growth LTM", "EPS Growth L5Y"],
    ["BR", "Broadridge Financial Solutions", "$21.5B", "$24.9B", "1.8%", "23.9", "19.2", "6.2%", "7.0%", "16.5%", "8.3%"]
  ),
  emptyPara(100),
  bodyPara([
    text("Broadridge Financial Solutions, Inc. provides investor communications and technology-driven solutions for the financial services industry. In mid-2021, Broadridge launched its Distributed Ledger Repo (DLR) solution, quickly achieving $31 billion in average weekly volumes. That figure is now $70 billion daily and over a trillion dollars a month"),
    new FootnoteReferenceRun(15),
    text(". DLR saves users an estimated $1 million per 100,000 transactions through faster transactions with lower fees."),
  ]),
  bodyPara("Users of DLR include UBS, Societe Generale, and DRW. It is unclear whether this is a transaction fee or subscription-fee based. Offering this service to clients broadens relationships, potentially expanding share of wallet amongst its customer base. The market hasn't priced in the impact of DLR's growth potential to topline growth and the application of this technology to Broadridge's cost structure."),
  bodyPara([
    text("According to RBC's initiation on the stock in April 2023"),
    new FootnoteReferenceRun(16),
    text(":"),
  ]),
  bodyPara("\"The company has calculated its market opportunity at ~$60B and reported $4.26B in total revenues in FY22, which implies a significant opportunity to expand its ~7% market share, especially in the GTO segment. BR's ICS segment, in our opinion, benefits from its competitive moat. We see BR's GTO segment's revenue growth being driven by sell-side financial firms of all types looking to modernize, digitize and streamline their technology platforms, especially given increased digitization and investor participation. The combination of the two segments, along with a capital allocation policy focused on dividends and debt reduction (near term), generates stable growth at a reasonable price (GARP) investment, in our opinion, with mid-to-high single-digit organic revenue growth, annual margin expansion, and high-single- to low-double-digit adjusted EPS growth.\""),
  bodyPara([
    text("While the stock has surpassed RBC's one year target price, I don't believe that the full impact of deploying blockchain-driven solutions is reflected in the stock price. Each 100bps of growth on top of RBC's assumption adds $0.20 to 0.25 to RBC's FY25 estimate and each 100bps of lower operating expense related to deploying blockchain adds almost $0.40. ", { bold: true }),
    text("At a minimum, this may provide support for Broadridge's rich valuation as well as a higher return profile.", { bold: true }),
  ]),

  // NEGATIVELY IMPACTED COMPANIES (PAGE BREAK)
  sectionHeader("Publicly traded companies whose business models may be negatively impacted by blockchain technology", true),

  // ADYEN
  subHeader("Adyen"),
  createFinancialTable(
    ["Ticker", "Name", "Market Cap", "Enterprise Value", "Div Yield", "P/E Current", "P/E 15yr Avg", "Rev Growth LTM", "Rev Growth L5Y", "EPS Growth LTM", "EPS Growth L5Y"],
    ["ADYEN", "Adyen N.V.", "$52.9B", "$46B", "–", "64.7", "103.2", "49%", "55%", "19%", "51%"]
  ),
  emptyPara(100),
  bodyPara([
    text("Adyen N.V. operates a global payments platform. It serves digital, mobility, platforms and marketplace, retail, food and beverages, subscription, and hospital businesses. Adyen N.V. was incorporated in 2006 and is headquartered in Amsterdam, the Netherlands"),
    new FootnoteReferenceRun(17),
    text("."),
  ]),
  bodyPara("While Adyen generates substantial revenue figures, it only has a 6.31% profit margin. Adyen is solely digital and has no plans in place to adopt blockchain technology. I predict Adyen will lose market share to competitors who utilize blockchain technology, as its low-profit margins will severely restrict Adyen's pricing mobility."),

  // WESTERN UNION
  subHeader("Western Union"),
  createFinancialTable(
    ["Ticker", "Name", "Market Cap", "Enterprise Value", "Div Yield", "P/E Current", "P/E 15yr Avg", "Rev Growth LTM", "Rev Growth L5Y", "EPS Growth LTM", "EPS Growth L5Y"],
    ["WU", "The Western Union Company", "$4.4B", "$5.7B", "7.9%", "7.4", "11.2", "-10%", "-5%", "-12%", "NM"]
  ),
  emptyPara(100),
  bodyPara("Western Union's best days are already behind them, with an average revenue decline of -4.7% (CAGR) over the last five years, but that doesn't mean things can't get worse. 70% of Western Union's revenue comes from retail locations, which may imply that Western Union is more resilient to losing customers to distributed blockchain alternatives. The remaining revenues are derived in the digital remittance industry, and Western Union's 9 million digital customers may be more likely to leave for a cheaper and faster alternative. Western Union's plan for future growth resides in gaining market share in the digital remittance market, something I don't see happening with the current fee structure and transaction speed associated with the tech they are using."),

  // PAYONEER
  subHeader("Payoneer"),
  createFinancialTable(
    ["Ticker", "Name", "Market Cap", "Enterprise Value", "Div Yield", "P/E Current", "P/E 15yr Avg", "Rev Growth LTM", "Rev Growth L5Y", "EPS Growth LTM", "EPS Growth L5Y"],
    ["PAYO", "Payoneer Global Inc", "$2.1B", "$1.5B", "–", "29.8", "37.1", "35%", "NM", "NM", "NA"]
  ),
  emptyPara(100),
  bodyPara([
    text("Payoneer Global Inc. operates a digital payment and commerce-enabling platform worldwide. The company serves approximately 190 countries and territories. Payoneer Global Inc. was founded in 2005"),
    new FootnoteReferenceRun(18),
    text("."),
  ]),
  bodyPara("I think Payoneer is a loser simply because the company's primary source of revenue is through digital payments, and Payoneer doesn't appear to be interested in adopting blockchain. As a result, they will lose market share to competitors that utilize it. Payoneer also has a relatively poor gross margin return relative to blockchain users, with 22% of revenue spent on transaction costs."),

  // PRIVATE COMPANIES (PAGE BREAK)
  sectionHeader("Private Companies currently utilizing blockchain technology for cross-border payments", true),

  // RIPPLE
  subHeader("Ripple"),
  bodyPara([
    text("Ripple, the company, has built two blockchains. The XRP ledger is a public blockchain, and RippleNet is a permissioned blockchain built on top of the XRP ledger. RippleNet is currently the most utilized blockchain built for cross-border payments, with over 300 financial institutions using it"),
    new FootnoteReferenceRun(20),
    text(". Users include Bank of America, Banco Santander, PNC Bank, Standard Chartered Bank, FedNow via Volante Technologies, American Express, and United Overseas Bank."),
  ]),
  bodyPara("Prominent investors include the CME Group, Andreessen Horowitz, and SBI Group (holds most equity outside of Ripple)."),
  bodyPara([
    text("RippleNet has processed more than $30 billion in over 20 million transactions"),
    new FootnoteReferenceRun(21),
    text(". RippleNet is far ahead of blockchain competitors regarding the number of users and total transactions on their permissioned blockchain but far behind in total money processed. Ripple currently holds over $40Bn worth of XRP"),
    new FootnoteReferenceRun(29),
    text(". Ripple's business model is designed to make XRP more valuable by innovating to increase XRP's utility."),
  ]),
  bodyPara([
    text("While this isn't official, SBI Group CEO has said that Ripple plans to go public once their SEC lawsuit settles. The lawsuit settled July 13th, with Ripple winning the case"),
    new FootnoteReferenceRun(32),
    text(". I don't see Ripple being acquired, as whoever buys Ripple also is buying half of all XRP, which would pose far too much financial risk for an institutional investor. A Ripple IPO makes far more sense. If Ripple goes public, their stock will be tied to the performance of XRP, making their stock also very volatile. I would buy Ripple at a 10 Bn valuation, as the valuation discount would compensate for the inherent risk."),
  ]),

  // TASSAT GROUP (LAST SECTION OF MAIN BODY)
  subHeader("Tassat Group"),
  bodyPara([
    text("Tassat Group Inc. is the leading provider of private blockchain-based real-time solutions for FDIC-insured banks and their business-to-business (B2B) clients. TassatPay, Tassat Group's primary product, has processed over $1.3 trillion"),
    new FootnoteReferenceRun(22),
    text(". TassatPay is a permissioned blockchain built only for FDIC-insured banks."),
  ]),
  bodyPara([
    text("A differentiating trait TassatPay provides is fully integrated Fedwire functionality"),
    new FootnoteReferenceRun(23),
    text(". TassatPay utilizes a digital currency pegged to the dollar and backed by FDIC-insured bank deposits. The dollars that back the tokenized payments never leave the bank's banking ecosystem."),
  ]),
  bodyPara("Prominent users of TassatPay include Western Alliance Bank (NYSE: WAL), Signature Bank (NASDAQ: SBNY), Customers Bank (NYSE: CUBI), Axos Bank (NYSE: AX), Byline Bank (NYSE: BY), and Cogent Bank."),
  bodyPara([
    text("Based on competitors' average transaction fees, gross margins, and previous acquisitions, I estimate TassatPay has a transaction fee between .01%-.05%, gross margins of around 80%, and cumulative revenue of around $300 million since 2019, resulting in a valuation of around $400 million"),
    new FootnoteReferenceRun(26),
    text("."),
  ]),
  bodyPara("Large financial institutions like JP Morgan Chase or Bank of America, fintechs like Paypal, or payment processors like Visa and Mastercard would benefit from acquiring Tassat Group as they would gain not only TassatPay's software but the experienced blockchain experts who developed it as well."),

  // ========================================
  // APPENDIX A: ISO 20022 (PAGE BREAK)
  // ========================================
  sectionHeader("Appendix A: ISO 20022", true),
  bodyPara([
    text("In 2014, The International Organization for Standardization, ISO, released the most recent set of mandatory standards for financial messages, ISO 20022, which allows for greater interoperability among financial institutions, especially regarding implementing digital ledger technology or \"DLT\", by providing a globally accepted standard for messaging in cross-border payments. By complying, DLT companies can communicate with and integrate into existing financial infrastructure more seamlessly. Ripple and Stellar are already ISO 20022 compliant, giving them a huge advantage over other DLT-based companies. According to JP Morgan, \"ISO 20022 will be the common language of the global financial industry\" by 2025"),
    new FootnoteReferenceRun(33),
    text("."),
  ]),

  // ========================================
  // APPENDIX B: B2B MARKET DATA (PAGE BREAK)
  // ========================================
  sectionHeader("Appendix B: B2B Market Data", true),
  bodyPara("The following figures present key data on the B2B cross-border payments market, illustrating the scale of the opportunity and growth projections:"),

  bodyPara("Market size and growth projections for the B2B cross-border payments sector:"),
  createImage("image1.png", 420, 280),
  figureCaption("Figure 10: B2B Market Size Overview"),
  bodyPara("This data demonstrates the substantial total addressable market available to blockchain-based payment solutions."),

  bodyPara("Regional distribution of B2B cross-border payment flows:"),
  createImage("image3.png", 420, 280),
  figureCaption("Figure 11: Regional Payment Flow Distribution"),
  bodyPara("Understanding regional flows helps identify where blockchain solutions may gain traction first based on existing infrastructure and regulatory environments."),

  bodyPara("Transaction volume trends in the B2B payments space:"),
  createImage("image5.png", 420, 280),
  figureCaption("Figure 12: Transaction Volume Trends"),
  bodyPara("Growing transaction volumes highlight the scalability requirements that favor blockchain's distributed architecture."),

  bodyPara("Fee structures and cost analysis in current B2B payment methods:"),
  createImage("image2.png", 420, 280),
  figureCaption("Figure 13: Current Fee Structure Analysis"),
  bodyPara("High fees in the current system represent the primary value capture opportunity for blockchain-based alternatives."),

  // ========================================
  // APPENDIX C: WHY BLOCKCHAIN HASN'T SEEN EXPECTED IMPLEMENTATION (PAGE BREAK)
  // ========================================
  sectionHeader("Appendix C: Why Blockchain Has Not Seen Expected Implementation", true),
  bodyPara("Clearly, blockchain has yet to have the global impact that many predicted it would have five years ago."),
  bodyPara([
    text("According to a survey of 200 global banks published by the IBM Institute for Business Value and The Economist Intelligence Unit in 2016, 15 percent of banks expected to introduce full-scale commercial blockchain solutions in 2017, with \"mass adopters\" rapidly following suit – bringing the total to 65 percent of banks by 2020 (just three years)"),
    new FootnoteReferenceRun(34),
    text("."),
  ]),
  bodyPara([
    text("Regarding the Hype Cycle in 2016, we were post-technology trigger but still far from the peak inflated expectations. For reference, Bitcoin had grown more than 200% from $435 to $973 that year. The cryptocurrency market cap is a great representative of the public's perception of blockchain technology. From December 30, 2016, to November 12, 2021, Bitcoin grew more than 6500%"),
    new FootnoteReferenceRun(35),
    text(", and so did the public's expectation for blockchain. As the hype surrounding crypto and NFTs has drastically cooled over the last few years, the hype around blockchain has also fallen off."),
  ]),
  bodyPara("Is that purely due to the negative association with crypto? Or are there more fundamental issues with blockchain? A common sentiment around blockchain is that it's a solution looking for a problem. A lack of a clear central issue to apply blockchain has slowed its application. On top of that, problems such as scalability, interoperability, ease of development, and regulatory uncertainty have slowed the implementation of blockchain technology as well."),

  // Figure 14 context
  bodyPara("The Gartner Hype Cycle provides a framework for understanding where blockchain technology sits in its adoption trajectory:"),
  createImage("image7.png", 480, 320),
  figureCaption("Figure 14: Gartner Hype Cycle"),
  bodyPara("Based on this framework, blockchain for B2B payments appears to be emerging from the \"trough of disillusionment\" and moving toward the \"slope of enlightenment\" as practical use cases like those from Broadridge and Ripple demonstrate real-world value."),

  // ========================================
  // APPENDIX D: TASSATPAY DEEP DIVE (PAGE BREAK)
  // ========================================
  sectionHeader("Appendix D: TassatPay Deep Dive", true),
  bodyPara([
    text("TassatPay was launched in 2019. It has a significant advantage over blockchain payment competitors as it's the only blockchain-based B2B payment platform fully integrated with the U.S. banking system"),
    new FootnoteReferenceRun(24),
    text(". Like Ripple, TassatPay offers secure, real-time B2B payment capabilities 24/7/365. The only entities that can access transaction data on TassatPay are FDIC-insured US banks and their clients."),
  ]),
  bodyPara([
    text("The user's digital wallet is governed by smart contracts and stored in a private, permissioned blockchain. The dollars that back the tokenized payments never leave the bank's banking ecosystem. Tassat has over 20 use cases for their blockchain technology, including commercial construction, private equity capital calls, logistics, broader working capital applications for banks' corporate clients, and mortgage warehousing. As a result, Tassat Group has built strong relationships within corporate banks, improved deposits, and increased the variety of products they can offer"),
    new FootnoteReferenceRun(27),
    text("."),
  ]),
  bodyPara([
    text("In October 2022, Tassat launched The Digital Interbank Network in addition to TassatPay. It is the world's first private, permissioned blockchain-based payments network that operates entirely within the U.S. regulatory framework. The Network is composed of FDIC-insured banks transacting real-time payments and performing other banking services between their corporate clients via a private, permissioned blockchain"),
    new FootnoteReferenceRun(28),
    text("."),
  ]),

  // ========================================
  // APPENDIX E: RIPPLENET DEEP DIVE (PAGE BREAK)
  // ========================================
  sectionHeader("Appendix E: RippleNet Deep Dive", true),
  bodyPara([
    text("RippleNet is broken into three key offerings: xCurrent, xRapid, and xVia. xCurrent is built specifically to provide cheaper and more efficient cross-border payments to banks. Banks utilize xCurrent by installing an Application Programming Interface (API), which converts conventional payments to the XRP-powered alternative. xCurrent fits within banks' compliance and risk capabilities, making it easy for banks to use xCurrent"),
    new FootnoteReferenceRun(30),
    text("."),
  ]),
  bodyPara("xRapid allows users to source liquidity via the XRP token nearly instantaneously. This process is known as \"on-demand liquidity\" and removes the need for pre-funding, reducing the deployment of precious working capital."),
  bodyPara("xVia enables customers to connect to xRapid and xCurrent easily."),
  bodyPara("RippleNet has processed more than $30 billion in over 20 million transactions. RippleNet is far ahead of blockchain competitors in terms of the number of users and total transactions on their permissioned blockchain but far behind in terms of total money processed. This is because RippleNet is used primarily by small to medium-sized businesses (SMBs) rather than large financial institutions. In order to achieve networking effects and maximize the potential of blockchain a significant amount of users is necessary, giving Ripple a potential competitive advantage over Broadridge and Tassat group."),
  bodyPara([
    text("In 2019, Ripple had approximately 50.9 Bn XRP in escrow, and around 42.6 Bn XRP were in circulation. The XRP Ledger releases 1Bn XRP from Ripple's escrow account to Ripple every month. Ripple releases some fraction of that XRP to the market, and some fraction is placed back into escrow"),
    new FootnoteReferenceRun(31),
    text("."),
  ]),
  bodyPara("In December 2019, Ripple obtained a $9.8 billion valuation after raising $200 million through a Series C funding round. However, the company bought back the shares from investors who financed the funding round. The new share purchase landed Ripple a $15 billion valuation in January 2022."),
  bodyPara("While it is difficult to estimate Ripple's market value accurately, the current value of XRP that they hold is worth over $40Bn. Admittedly XRP is extremely volatile, minimizing the amount of XRP Ripple can sell at a time without significantly impacting the value of the digital currency. Ripple's business model is not simply pumping and dumping XRP. For Ripple to increase the price of XRP, they need to build products that increase the utility of the currency. XRP is sold to cover business costs, but because of the limited amount of XRP released every month to Ripple, this is not a sustainable revenue source."),

  emptyPara(300),
  new Paragraph({
    children: [new TextRun({ text: "End of Report", font: FONT, size: 20, italics: true, color: COLORS.MEDIUM_GRAY })],
    alignment: AlignmentType.CENTER,
  }),
];

// ============================================
// DOCUMENT ASSEMBLY
// ============================================

const doc = new Document({
  creator: "Oliver Molz",
  title: "How Blockchain can disrupt the B2B Cross-Border Payment Industry",
  footnotes: footnotes,
  sections: [{
    properties: {
      page: {
        margin: {
          top: convertInchesToTwip(0.75),
          bottom: convertInchesToTwip(0.75),
          left: convertInchesToTwip(0.75),
          right: convertInchesToTwip(0.75),
        },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          children: [new TextRun({ text: "Blockchain in B2B Cross-Border Payments", font: FONT, size: 18, color: COLORS.LIGHT_GRAY })],
          alignment: AlignmentType.RIGHT,
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          children: [
            new TextRun({ text: "Page ", font: FONT, size: 18, color: COLORS.LIGHT_GRAY }),
            new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: COLORS.LIGHT_GRAY }),
          ],
          alignment: AlignmentType.CENTER,
        })],
      }),
    },
    children: content,
  }],
});

// ============================================
// GENERATE OUTPUT
// ============================================

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(path.join(__dirname, "Blockchain_Report_Final.docx"), buffer);
  console.log("\n========================================");
  console.log("Document generated successfully!");
  console.log("========================================");
  console.log("Output: Blockchain_Report_Final.docx");
  console.log("\nKey Changes Applied:");
  console.log("  - Academic citations (no raw URLs)");
  console.log("  - NO highlighting/background colors");
  console.log("  - All 14 figures have context text");
  console.log("  - Appendix sections A-E after Tassat Group");
  console.log("  - Times New Roman throughout");
  console.log("  - Headers and page numbers");
  console.log("  - 0.75\" margins, 1.15 line spacing");
  console.log("\nAppendix Structure:");
  console.log("  A: ISO 20022");
  console.log("  B: B2B Market Data (Figures 10-13)");
  console.log("  C: Why Blockchain Implementation Delayed (Figure 14)");
  console.log("  D: TassatPay Deep Dive");
  console.log("  E: RippleNet Deep Dive");
}).catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
