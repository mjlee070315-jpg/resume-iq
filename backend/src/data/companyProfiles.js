// Curated company profiles compiled from general public knowledge (company
// websites, public job postings, widely known facts). This is NOT LinkedIn data:
// LinkedIn's terms prohibit scraping. Sizes and details are approximate and can be
// out of date, so treat them as orientation, not facts to quote.
//
// Each profile pairs descriptive info with a scoring preset (keywords + emphasis
// over the four verb categories) so any company here works as an analysis target.

const T = {
  bigtech: {
    industry: "Big Tech",
    keywords: ["algorithms", "data structures", "system design", "distributed systems", "python", "testing", "code review", "scalability"],
    emphasize: { Technical: 0.5, Leadership: 0.15, Management: 0.1, Communication: 0.25 },
    tips: ["Show shipped work with scale numbers (users, requests, latency)", "Prepare for data-structures/algorithms and system-design interviews", "Highlight collaboration: code review, cross-team projects"],
  },
  saas: {
    industry: "Software / Cloud",
    keywords: ["api design", "cloud", "typescript", "sql", "microservices", "ci/cd", "testing", "agile"],
    emphasize: { Technical: 0.45, Leadership: 0.15, Management: 0.1, Communication: 0.3 },
    tips: ["Product impact and customer outcomes matter as much as code", "Show ownership of a feature from idea to release", "Clear written communication stands out"],
  },
  ai: {
    industry: "AI / Data",
    keywords: ["machine learning", "python", "pytorch", "deep learning", "data pipelines", "research", "statistics", "evaluation"],
    emphasize: { Technical: 0.6, Leadership: 0.1, Management: 0.05, Communication: 0.25 },
    tips: ["Research or applied ML projects with measurable results", "Open-source, papers, or benchmarks are strong signals", "Show you can communicate technical tradeoffs clearly"],
  },
  semis: {
    industry: "Semiconductors / Hardware",
    keywords: ["c++", "embedded systems", "verilog", "computer architecture", "performance optimization", "linux", "debugging", "testing"],
    emphasize: { Technical: 0.65, Leadership: 0.1, Management: 0.05, Communication: 0.2 },
    tips: ["Low-level or hardware-adjacent projects (embedded, FPGA, architecture)", "Quantify performance, power, or yield improvements", "Lab and design-team experience counts"],
  },
  auto: {
    industry: "Automotive / Aerospace / Industrial",
    keywords: ["cad", "manufacturing", "systems engineering", "prototyping", "root cause analysis", "matlab", "safety", "testing"],
    emphasize: { Technical: 0.45, Leadership: 0.2, Management: 0.15, Communication: 0.2 },
    tips: ["Hands-on build experience: design teams, co-ops, internships", "Process-improvement results with numbers (cost, time, defect rate)", "Safety and quality awareness"],
  },
  finance: {
    industry: "Finance",
    keywords: ["financial modeling", "python", "sql", "excel", "risk", "quantitative", "data analysis", "markets"],
    emphasize: { Technical: 0.35, Leadership: 0.25, Management: 0.15, Communication: 0.25 },
    tips: ["Quantitative rigor plus clear business impact", "Leadership in competitive, high-pressure settings", "Show interest in markets (coursework, clubs, competitions)"],
  },
  quant: {
    industry: "Quant / Trading",
    keywords: ["probability", "statistics", "algorithms", "python", "c++", "optimization", "trading", "competitions"],
    emphasize: { Technical: 0.65, Leadership: 0.1, Management: 0.05, Communication: 0.2 },
    tips: ["Math/CS competition results and rigorous coursework", "Projects that show probabilistic thinking and speed", "Concise, precise resume with no fluff"],
  },
  consulting: {
    industry: "Consulting",
    keywords: ["problem solving", "data analysis", "stakeholder management", "strategy", "presentation", "excel", "client", "case study"],
    emphasize: { Technical: 0.15, Leadership: 0.35, Management: 0.2, Communication: 0.3 },
    tips: ["Structured problem solving and top-line impact", "Leadership with results, not just titles", "Practice case interviews early"],
  },
  health: {
    industry: "Healthcare / Pharma",
    keywords: ["data analysis", "regulatory", "quality", "process improvement", "lean", "six sigma", "research", "project management"],
    emphasize: { Technical: 0.4, Leadership: 0.2, Management: 0.2, Communication: 0.2 },
    tips: ["Quality, compliance, and process-improvement experience", "Research or lab experience for technical roles", "Clear communication across technical and non-technical teams"],
  },
  consumer: {
    industry: "Consumer / Retail",
    keywords: ["supply chain", "data analysis", "operations", "forecasting", "sql", "excel", "project management", "optimization"],
    emphasize: { Technical: 0.3, Leadership: 0.25, Management: 0.25, Communication: 0.2 },
    tips: ["Operations, logistics, and analytics projects with numbers", "Leadership in teams and student organizations", "Cross-functional communication"],
  },
};

// [name, template, size, hq, extraKeywords, presetId?]
const RAW = [
  // Big tech & software
  ["Google", "bigtech", "Large (100,000+)", "Mountain View, CA", [], "google-swe"],
  ["Meta", "bigtech", "Large (50,000+)", "Menlo Park, CA", [], "meta-swe"],
  ["Amazon", "bigtech", "Large (1,000,000+)", "Seattle, WA", [], "amazon-swe"],
  ["Apple", "bigtech", "Large (100,000+)", "Cupertino, CA", [], "apple-swe"],
  ["Microsoft", "bigtech", "Large (200,000+)", "Redmond, WA", [], "microsoft-swe"],
  ["Netflix", "bigtech", "Mid-size (10,000+)", "Los Gatos, CA", [], "netflix-swe"],
  ["Salesforce", "saas", "Large (50,000+)", "San Francisco, CA", ["crm", "apex"]],
  ["Adobe", "saas", "Large (20,000+)", "San Jose, CA", ["design tools", "javascript"]],
  ["Oracle", "saas", "Large (100,000+)", "Austin, TX", ["java", "databases"]],
  ["IBM", "saas", "Large (200,000+)", "Armonk, NY", ["hybrid cloud", "consulting"]],
  ["Cisco", "saas", "Large (80,000+)", "San Jose, CA", ["networking", "security"]],
  ["Uber", "bigtech", "Large (20,000+)", "San Francisco, CA", ["real-time systems", "marketplace"]],
  ["Airbnb", "saas", "Mid-size (5,000+)", "San Francisco, CA", ["experimentation", "react"]],
  ["LinkedIn", "bigtech", "Large (20,000+)", "Sunnyvale, CA", ["data", "recommendation systems"]],
  ["Palantir", "saas", "Mid-size (3,000+)", "Denver, CO", ["data integration", "forward deployed"]],
  ["Databricks", "saas", "Mid-size (5,000+)", "San Francisco, CA", ["spark", "data engineering"]],
  ["Shopify", "saas", "Mid-size (8,000+)", "Ottawa, Canada", ["ruby", "e-commerce"]],
  ["Spotify", "saas", "Mid-size (8,000+)", "Stockholm, Sweden", ["recommendation systems", "backend"]],
  ["Dropbox", "saas", "Mid-size (2,000+)", "San Francisco, CA", ["storage", "python"]],
  ["Atlassian", "saas", "Large (10,000+)", "Sydney, Australia", ["java", "collaboration tools"]],
  ["Twilio", "saas", "Mid-size (5,000+)", "San Francisco, CA", ["apis", "communications"]],
  ["Cloudflare", "saas", "Mid-size (4,000+)", "San Francisco, CA", ["networking", "security", "rust"]],
  ["Datadog", "saas", "Mid-size (6,000+)", "New York, NY", ["observability", "go"]],
  ["Stripe", "saas", "Mid-size (7,000+)", "San Francisco, CA", ["payments", "reliability"], "stripe-swe"],
  ["OpenAI", "ai", "Mid-size (1,000+)", "San Francisco, CA", ["transformers", "reinforcement learning"]],
  ["Anthropic", "ai", "Mid-size (1,000+)", "San Francisco, CA", ["alignment", "interpretability"]],
  ["Scale AI", "ai", "Mid-size (1,000+)", "San Francisco, CA", ["data labeling", "evaluation"]],
  // Semiconductors & hardware
  ["NVIDIA", "semis", "Large (30,000+)", "Santa Clara, CA", ["cuda", "gpu"], "nvidia-swe"],
  ["Intel", "semis", "Large (100,000+)", "Santa Clara, CA", ["fabrication", "x86"]],
  ["AMD", "semis", "Large (20,000+)", "Santa Clara, CA", ["gpu", "cpu design"]],
  ["Qualcomm", "semis", "Large (40,000+)", "San Diego, CA", ["wireless", "mobile soc"]],
  ["Texas Instruments", "semis", "Large (30,000+)", "Dallas, TX", ["analog", "manufacturing"]],
  ["Micron", "semis", "Large (40,000+)", "Boise, ID", ["memory", "process engineering"]],
  ["Samsung Electronics", "semis", "Large (200,000+)", "Suwon, South Korea", ["memory", "mobile"]],
  ["SK hynix", "semis", "Large (30,000+)", "Icheon, South Korea", ["dram", "nand"]],
  // Automotive, aerospace, industrial
  ["Tesla", "auto", "Large (100,000+)", "Austin, TX", ["battery", "embedded systems"], "tesla-eng"],
  ["SpaceX", "auto", "Large (10,000+)", "Hawthorne, CA", ["propulsion", "rapid prototyping"]],
  ["Boeing", "auto", "Large (100,000+)", "Arlington, VA", ["aerospace", "systems engineering"]],
  ["Lockheed Martin", "auto", "Large (100,000+)", "Bethesda, MD", ["defense", "systems engineering"]],
  ["Ford", "auto", "Large (150,000+)", "Dearborn, MI", ["vehicle engineering", "manufacturing"]],
  ["General Motors", "auto", "Large (150,000+)", "Detroit, MI", ["ev", "software defined vehicle"]],
  ["Rivian", "auto", "Large (10,000+)", "Irvine, CA", ["ev", "embedded systems"]],
  ["Caterpillar", "auto", "Large (100,000+)", "Irving, TX", ["heavy equipment", "supply chain"]],
  ["Cummins", "auto", "Large (50,000+)", "Columbus, IN", ["engines", "powertrain"]],
  ["Hyundai Motor", "auto", "Large (70,000+)", "Seoul, South Korea", ["ev", "autonomous driving"]],
  // Finance & quant
  ["Goldman Sachs", "finance", "Large (40,000+)", "New York, NY", [], "goldman-analyst"],
  ["JPMorgan Chase", "finance", "Large (300,000+)", "New York, NY", ["risk", "technology"]],
  ["Morgan Stanley", "finance", "Large (70,000+)", "New York, NY", ["wealth management", "trading"]],
  ["BlackRock", "finance", "Large (15,000+)", "New York, NY", ["portfolio analytics", "risk"]],
  ["Capital One", "finance", "Large (50,000+)", "McLean, VA", ["machine learning", "cloud"]],
  ["Visa", "finance", "Large (25,000+)", "San Francisco, CA", ["payments", "fraud detection"]],
  ["Mastercard", "finance", "Large (30,000+)", "Purchase, NY", ["payments", "analytics"]],
  ["PayPal", "finance", "Large (25,000+)", "San Jose, CA", ["payments", "risk"]],
  ["Robinhood", "finance", "Mid-size (2,000+)", "Menlo Park, CA", ["fintech", "backend"]],
  ["Citadel", "quant", "Mid-size (3,000+)", "Miami, FL", ["low latency", "research"]],
  ["Jane Street", "quant", "Mid-size (2,000+)", "New York, NY", ["ocaml", "market making"]],
  ["Two Sigma", "quant", "Mid-size (2,000+)", "New York, NY", ["machine learning", "data"]],
  // Consulting
  ["McKinsey & Company", "consulting", "Large (40,000+)", "New York, NY", [], "mckinsey-consultant"],
  ["Boston Consulting Group", "consulting", "Large (30,000+)", "Boston, MA", ["strategy", "transformation"]],
  ["Bain & Company", "consulting", "Large (15,000+)", "Boston, MA", ["strategy", "private equity"]],
  ["Deloitte", "consulting", "Large (400,000+)", "", ["audit", "technology consulting"]],
  ["Accenture", "consulting", "Large (700,000+)", "Dublin, Ireland", ["digital transformation", "cloud"]],
  // Health & pharma
  ["Eli Lilly", "health", "Large (40,000+)", "Indianapolis, IN", ["pharmaceutical", "manufacturing"]],
  ["Pfizer", "health", "Large (80,000+)", "New York, NY", ["clinical", "manufacturing"]],
  ["Johnson & Johnson", "health", "Large (130,000+)", "New Brunswick, NJ", ["medical devices", "quality"]],
  ["UnitedHealth Group", "health", "Large (400,000+)", "Minnetonka, MN", ["healthcare analytics", "operations"]],
  // Consumer & retail
  ["Procter & Gamble", "consumer", "Large (100,000+)", "Cincinnati, OH", ["brand", "manufacturing"]],
  ["Walmart", "consumer", "Large (2,000,000+)", "Bentonville, AR", ["supply chain", "retail analytics"]],
  ["Nike", "consumer", "Large (80,000+)", "Beaverton, OR", ["apparel", "supply chain"]],
  ["Target", "consumer", "Large (400,000+)", "Minneapolis, MN", ["retail", "merchandising"]],
  ["Coupang", "consumer", "Large (70,000+)", "Seattle, WA", ["logistics", "e-commerce"]],
  // Korea tech
  ["LG Electronics", "semis", "Large (70,000+)", "Seoul, South Korea", ["appliances", "embedded systems"]],
  ["Naver", "saas", "Large (5,000+)", "Seongnam, South Korea", ["search", "ai"]],
  ["Kakao", "saas", "Large (5,000+)", "", ["messaging", "platform"]],
];

const slug = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const COMPANY_PROFILES = RAW.map(([name, tpl, size, hq, extra, presetId]) => {
  const t = T[tpl];
  return {
    id: `co-${slug(name)}`,
    name,
    industry: t.industry,
    size,
    hq,
    presetId: presetId ?? null,
    keywords: [...new Set([...extra, ...t.keywords])],
    emphasize: t.emphasize,
    tips: t.tips,
  };
});

export const INDUSTRIES = [...new Set(COMPANY_PROFILES.map((c) => c.industry))];

/** Presets for the companies that don't already have a hand-written one. */
export const COMPANY_PRESETS = Object.fromEntries(
  COMPANY_PROFILES.filter((c) => !c.presetId).map((c) => [
    c.id,
    {
      id: c.id,
      label: `${c.name} — General`,
      type: "company",
      keywords: c.keywords,
      emphasize: c.emphasize,
      focusAreas: c.tips,
    },
  ])
);
