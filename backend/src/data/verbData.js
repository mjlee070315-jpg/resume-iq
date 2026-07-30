// Verb reference data — hand-curated, used by rule-based analysis (no AI).

export const WEAK_VERBS = {
  made: ["Created", "Produced", "Generated", "Established"],
  did: ["Executed", "Performed", "Conducted", "Completed"],
  did_not: ["Executed", "Performed", "Conducted"],
  helped: ["Assisted", "Supported", "Facilitated", "Contributed to"],
  worked: ["Built", "Designed", "Developed", "Implemented", "Optimized"],
  "worked on": ["Built", "Designed", "Developed", "Implemented", "Optimized"],
  used: ["Applied", "Leveraged", "Utilized", "Employed"],
  got: ["Achieved", "Secured", "Obtained", "Earned"],
  went: ["Advanced", "Progressed", "Transitioned"],
  handled: ["Managed", "Resolved", "Oversaw", "Administered"],
  "responsible for": ["Directed", "Owned", "Led", "Managed"],
  "was responsible for": ["Directed", "Owned", "Led", "Managed"],
  "in charge of": ["Directed", "Managed", "Oversaw"],
};

// Common but generic verbs — not "wrong", but flagged as overused when
// they dominate a resume without more specific alternatives.
export const OVERUSED_VERBS = {
  led: ["Directed", "Managed", "Coordinated", "Spearheaded"],
  managed: ["Directed", "Oversaw", "Coordinated", "Administered"],
};

// Strong verb categories, used for the Action Verb Heatmap (Phase 2)
// and for scoring signal in Phase 1.
export const STRONG_VERB_CATEGORIES = {
  Leadership: [
    "led",
    "directed",
    "spearheaded",
    "mentored",
    "supervised",
    "chaired",
    "founded",
    "initiated",
    "championed",
  ],
  Technical: [
    "built",
    "developed",
    "designed",
    "implemented",
    "architected",
    "optimized",
    "automated",
    "engineered",
    "programmed",
    "deployed",
    "debugged",
    "integrated",
  ],
  Communication: [
    "presented",
    "authored",
    "published",
    "negotiated",
    "persuaded",
    "facilitated",
    "documented",
    "communicated",
  ],
  Management: [
    "managed",
    "oversaw",
    "administered",
    "budgeted",
    "planned",
    "streamlined",
    "delegated",
    "coordinated",
    "organized",
  ],
};

// Common irregular past participles used for passive-voice detection
export const IRREGULAR_PARTICIPLES = [
  "done",
  "made",
  "given",
  "taken",
  "written",
  "seen",
  "known",
  "shown",
  "built",
  "led",
  "sent",
  "held",
  "chosen",
  "spoken",
  "driven",
  "grown",
  "broken",
];
