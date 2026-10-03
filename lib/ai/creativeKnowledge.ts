/**
 * RICOZ Creative Intelligence Knowledge Base (V3.1)
 * Structured domain knowledge for creative disciplines, relationships,
 * project intents, brand maturity, audiences, and delivery taxonomy.
 */

export const RICOZ_AI_VERSION = "3.1";
export const PROMPT_VERSION = "creative-project-v3.1";

export const RICOZ_19_ROLES = [
  "Brand Strategist",
  "Creative Director",
  "Brand Identity Designer",
  "Naming & Verbal Identity Specialist",
  "Logo Designer",
  "Visual Designer",
  "Art Director",
  "UI/UX Designer",
  "Web Designer",
  "Motion Designer",
  "3D & Spatial Designer",
  "Illustrator",
  "Packaging Designer",
  "Brand Photographer",
  "Copywriter",
  "Content Strategist",
  "Consumer Research Specialist",
  "Production & Print Specialist",
  "Brand Guidelines & Design Systems Specialist"
] as const;

export type RicozRole = (typeof RICOZ_19_ROLES)[number];

// Supported Project Intents (16 canonical categories)
export const PROJECT_INTENTS = [
  "New Brand",
  "Rebrand",
  "Brand Refresh",
  "Product Launch",
  "Campaign",
  "Digital Transformation",
  "Website Redesign",
  "E-commerce Launch",
  "Market Expansion",
  "Brand Positioning",
  "Packaging Launch",
  "Product Identity",
  "Content System",
  "Visual Campaign",
  "Employer Branding",
  "Brand System Development"
] as const;

export type ProjectIntent = (typeof PROJECT_INTENTS)[number];

// Brand Maturity Spectrum
export const BRAND_MATURITY_LEVELS = [
  "New / Startup",
  "Early-stage",
  "Growing",
  "Established",
  "Enterprise",
  "Legacy Brand"
] as const;

export type BrandMaturity = (typeof BRAND_MATURITY_LEVELS)[number];

// Creative Direction Clusters
export interface CreativeDirectionCluster {
  theme: string;
  adjectives: string[];
  suggestedRoles: RicozRole[];
}

export const CREATIVE_DIRECTION_CLUSTERS: Record<string, CreativeDirectionCluster> = {
  Luxury: {
    theme: "Luxury & High-End",
    adjectives: ["premium", "refined", "sophisticated", "editorial", "high-end", "elegant", "bespoke", "haute"],
    suggestedRoles: ["Art Director", "Brand Identity Designer", "Brand Photographer", "Creative Director"]
  },
  Technology: {
    theme: "Technology & Modern Digital",
    adjectives: ["futuristic", "digital", "minimal", "precise", "intelligent", "innovative", "kinetic", "high-density"],
    suggestedRoles: ["UI/UX Designer", "Motion Designer", "Brand Guidelines & Design Systems Specialist", "Web Designer"]
  },
  Playful: {
    theme: "Playful & Youthful",
    adjectives: ["energetic", "colorful", "expressive", "youthful", "bold", "dynamic", "vibrant", "irreverent"],
    suggestedRoles: ["Illustrator", "Motion Designer", "Visual Designer", "Art Director"]
  },
  Corporate: {
    theme: "Corporate & Institutional",
    adjectives: ["trustworthy", "structured", "professional", "credible", "authoritative", "monolithic", "rigorous"],
    suggestedRoles: ["Brand Strategist", "Brand Guidelines & Design Systems Specialist", "Brand Identity Designer", "Copywriter"]
  },
  Minimal: {
    theme: "Minimal & Restrained",
    adjectives: ["clean", "restrained", "simple", "spacious", "refined", "swiss-inspired", "understated", "typographic"],
    suggestedRoles: ["Brand Identity Designer", "Web Designer", "Art Director"]
  },
  Heritage: {
    theme: "Heritage & Craft",
    adjectives: ["tactile", "artisanal", "timeless", "authentic", "provenance", "historical", "classic", "organic"],
    suggestedRoles: ["Production & Print Specialist", "Packaging Designer", "Brand Photographer", "Brand Identity Designer"]
  }
};

// Target Audience Categories & Decision-Maker Profiles
export const AUDIENCE_CATEGORIES = [
  "B2B",
  "B2C",
  "Enterprise Stakeholders",
  "Enterprise Technology Decision Makers (CTOs/VPs)",
  "Gen Z / Digital-First",
  "Millennials / Young Professionals",
  "Families & Parents",
  "High-Net-Worth / Luxury Connoisseurs",
  "Developers & Technical Audiences",
  "Healthcare Professionals & Clinicians",
  "Retail Consumers",
  "Global Travelers & Guests",
  "Retail & Institutional Investors"
] as const;

// Discipline Knowledge Specification
export interface DisciplineKnowledge {
  role: RicozRole;
  workflowPhase: "Strategy" | "Creative Direction" | "Core Identity" | "Specialized Craft" | "Digital/Physical Execution" | "Launch/Storytelling";
  workflowOrder: number; // 1 to 19 for natural collaboration pipelines
  relatedDeliverables: string[];
  relatedProjectTypes: string[];
  relatedIndustries: string[];
  collaboratesWith: RicozRole[];
}

export const DISCIPLINE_KNOWLEDGE_MAP: Record<RicozRole, DisciplineKnowledge> = {
  "Brand Strategist": {
    role: "Brand Strategist",
    workflowPhase: "Strategy",
    workflowOrder: 1,
    relatedDeliverables: [
      "Brand Positioning & Narrative Architecture",
      "Brand Architecture Framework",
      "Competitive Differentiation Matrix",
      "Category Definition & Manifesto"
    ],
    relatedProjectTypes: ["Rebrand", "Brand Refresh", "Brand Positioning", "Market Expansion"],
    relatedIndustries: ["Fintech", "Enterprise SaaS", "Health & Wellness", "Beverage & FMCG"],
    collaboratesWith: ["Creative Director", "Naming & Verbal Identity Specialist", "Consumer Research Specialist"]
  },
  "Consumer Research Specialist": {
    role: "Consumer Research Specialist",
    workflowPhase: "Strategy",
    workflowOrder: 2,
    relatedDeliverables: [
      "Consumer Ethnography & Insights",
      "User Persona & Journey Maps",
      "Audience Perception Study"
    ],
    relatedProjectTypes: ["Market Expansion", "Rebrand", "Brand Positioning"],
    relatedIndustries: ["Beverage & FMCG", "Health & Wellness", "Fintech", "E-commerce"],
    collaboratesWith: ["Brand Strategist", "UI/UX Designer", "Creative Director"]
  },
  "Naming & Verbal Identity Specialist": {
    role: "Naming & Verbal Identity Specialist",
    workflowPhase: "Strategy",
    workflowOrder: 3,
    relatedDeliverables: [
      "Brand Naming Architecture",
      "Tone of Voice Guidelines",
      "Verbal Identity & Messaging Pillars"
    ],
    relatedProjectTypes: ["New Brand", "Rebrand", "Product Launch"],
    relatedIndustries: ["Fintech", "Health & Wellness", "AI & DeepTech", "Luxury & Fashion"],
    collaboratesWith: ["Brand Strategist", "Copywriter", "Creative Director"]
  },
  "Creative Director": {
    role: "Creative Director",
    workflowPhase: "Creative Direction",
    workflowOrder: 4,
    relatedDeliverables: [
      "Creative Direction & Campaign Vision",
      "Cross-Disciplinary Concept Architecture",
      "Brand Manifesto & Creative Treatment"
    ],
    relatedProjectTypes: ["New Brand", "Rebrand", "Campaign", "Visual Campaign", "Product Launch"],
    relatedIndustries: ["Luxury & Fashion", "Health & Wellness", "Hospitality", "Automotive & Mobility", "Entertainment & Media"],
    collaboratesWith: ["Art Director", "Brand Identity Designer", "Brand Strategist", "Copywriter"]
  },
  "Art Director": {
    role: "Art Director",
    workflowPhase: "Creative Direction",
    workflowOrder: 5,
    relatedDeliverables: [
      "Cinematic Art Direction & Styling",
      "Editorial Photography Treatment",
      "Campaign Visual Language"
    ],
    relatedProjectTypes: ["Campaign", "Visual Campaign", "Product Launch", "Brand Refresh"],
    relatedIndustries: ["Luxury & Fashion", "Hospitality", "Automotive & Mobility", "Beverage & FMCG"],
    collaboratesWith: ["Creative Director", "Brand Photographer", "Motion Designer", "Visual Designer"]
  },
  "Brand Identity Designer": {
    role: "Brand Identity Designer",
    workflowPhase: "Core Identity",
    workflowOrder: 6,
    relatedDeliverables: [
      "Complete Visual Identity & Logo System",
      "Brand Guidelines & Identity Rules",
      "Color & Typography Architecture"
    ],
    relatedProjectTypes: ["New Brand", "Rebrand", "Brand Refresh", "Product Identity"],
    relatedIndustries: ["Health & Wellness", "Fintech", "Hospitality", "Enterprise SaaS", "Luxury & Fashion"],
    collaboratesWith: ["Creative Director", "Logo Designer", "Brand Guidelines & Design Systems Specialist"]
  },
  "Logo Designer": {
    role: "Logo Designer",
    workflowPhase: "Core Identity",
    workflowOrder: 7,
    relatedDeliverables: [
      "Iconic Symbol & Wordmark System",
      "Responsive Monogram Variations",
      "Vector Geometry & Trademark Lockups"
    ],
    relatedProjectTypes: ["New Brand", "Brand Refresh", "Product Identity"],
    relatedIndustries: ["Fintech", "Hospitality", "Entertainment & Media", "Real Estate"],
    collaboratesWith: ["Brand Identity Designer", "Brand Guidelines & Design Systems Specialist"]
  },
  "Brand Guidelines & Design Systems Specialist": {
    role: "Brand Guidelines & Design Systems Specialist",
    workflowPhase: "Core Identity",
    workflowOrder: 8,
    relatedDeliverables: [
      "Design Systems & Token Architecture",
      "Comprehensive Brand Bible",
      "Multi-Platform Component Specs"
    ],
    relatedProjectTypes: ["Enterprise Rebrand", "Brand System Development", "Digital Transformation"],
    relatedIndustries: ["Enterprise SaaS", "Fintech", "Health & Wellness"],
    collaboratesWith: ["Brand Identity Designer", "UI/UX Designer", "Web Designer"]
  },
  "Packaging Designer": {
    role: "Packaging Designer",
    workflowPhase: "Specialized Craft",
    workflowOrder: 9,
    relatedDeliverables: [
      "Structural Packaging & Material Specifications",
      "Unboxing Experience Engineering",
      "Custom Bottle & Label System"
    ],
    relatedProjectTypes: ["Packaging Launch", "Product Launch", "New Brand"],
    relatedIndustries: ["Beverage & FMCG", "Health & Wellness", "Luxury & Fashion"],
    collaboratesWith: ["Production & Print Specialist", "Brand Identity Designer", "Art Director"]
  },
  "Production & Print Specialist": {
    role: "Production & Print Specialist",
    workflowPhase: "Specialized Craft",
    workflowOrder: 10,
    relatedDeliverables: [
      "Print Production & Foil/Emboss Specs",
      "Sustainable Material Sourcing",
      "Physical Collateral Press Check"
    ],
    relatedProjectTypes: ["Packaging Launch", "Brand Refresh", "Hospitality Concept"],
    relatedIndustries: ["Luxury & Fashion", "Hospitality", "Beverage & FMCG"],
    collaboratesWith: ["Packaging Designer", "Brand Identity Designer"]
  },
  "3D & Spatial Designer": {
    role: "3D & Spatial Designer",
    workflowPhase: "Specialized Craft",
    workflowOrder: 11,
    relatedDeliverables: [
      "3D Spatial Visualization & Product Renders",
      "Spatial Wayfinding & Environment Mockups",
      "Photorealistic Hardware Exploded Views"
    ],
    relatedProjectTypes: ["Product Launch", "3D Brand World", "Campaign"],
    relatedIndustries: ["Automotive & Mobility", "AI & DeepTech", "Hospitality", "Consumer Electronics"],
    collaboratesWith: ["Art Director", "Motion Designer", "Creative Director"]
  },
  "Illustrator": {
    role: "Illustrator",
    workflowPhase: "Specialized Craft",
    workflowOrder: 12,
    relatedDeliverables: [
      "Bespoke Editorial Illustration System",
      "Mascot & Iconography Suite",
      "Narrative Spot Illustrations"
    ],
    relatedProjectTypes: ["New Brand", "Content System", "Product Identity"],
    relatedIndustries: ["Fintech", "Health & Wellness", "Entertainment & Media"],
    collaboratesWith: ["Brand Identity Designer", "Art Director", "Visual Designer"]
  },
  "UI/UX Designer": {
    role: "UI/UX Designer",
    workflowPhase: "Digital/Physical Execution",
    workflowOrder: 13,
    relatedDeliverables: [
      "Digital Product UX & Wireflows",
      "Interactive High-Fidelity UI Prototype",
      "E-Commerce Checkout & Funnel UX"
    ],
    relatedProjectTypes: ["E-commerce Launch", "Digital Transformation", "Product Launch"],
    relatedIndustries: ["E-commerce", "Fintech", "Enterprise SaaS", "Health & Wellness"],
    collaboratesWith: ["Web Designer", "Brand Guidelines & Design Systems Specialist"]
  },
  "Web Designer": {
    role: "Web Designer",
    workflowPhase: "Digital/Physical Execution",
    workflowOrder: 14,
    relatedDeliverables: [
      "Flagship Responsive Web Platform",
      "Interactive Marketing Experience",
      "Interactive Reservation / Booking UI"
    ],
    relatedProjectTypes: ["Website Redesign", "Digital Transformation", "E-commerce Launch"],
    relatedIndustries: ["Hospitality", "Enterprise SaaS", "Luxury & Fashion", "AI & DeepTech"],
    collaboratesWith: ["UI/UX Designer", "Motion Designer", "Brand Identity Designer"]
  },
  "Motion Designer": {
    role: "Motion Designer",
    workflowPhase: "Digital/Physical Execution",
    workflowOrder: 15,
    relatedDeliverables: [
      "Kinetic Launch Motion & Social Assets",
      "Kinetic Logo Animation & UI Micro-Interactions",
      "Digital Billboard & Broadcast Motion"
    ],
    relatedProjectTypes: ["Campaign", "Visual Campaign", "Product Launch", "New Brand"],
    relatedIndustries: ["Automotive & Mobility", "Entertainment & Media", "Fintech", "Health & Wellness"],
    collaboratesWith: ["Art Director", "3D & Spatial Designer", "Visual Designer"]
  },
  "Brand Photographer": {
    role: "Brand Photographer",
    workflowPhase: "Launch/Storytelling",
    workflowOrder: 16,
    relatedDeliverables: [
      "Commercial Campaign Stills",
      "Editorial On-Location Photography",
      "High-End Studio Product Photography"
    ],
    relatedProjectTypes: ["Campaign", "Visual Campaign", "Hospitality Concept", "Product Launch"],
    relatedIndustries: ["Luxury & Fashion", "Hospitality", "Automotive & Mobility", "Beverage & FMCG"],
    collaboratesWith: ["Art Director", "Creative Director", "Production & Print Specialist"]
  },
  "Visual Designer": {
    role: "Visual Designer",
    workflowPhase: "Launch/Storytelling",
    workflowOrder: 17,
    relatedDeliverables: [
      "Digital Advertising & Social Visual Suite",
      "Multi-Platform Marketing Collateral",
      "Investor Presentation Decks"
    ],
    relatedProjectTypes: ["Campaign", "Content System", "Visual Campaign"],
    relatedIndustries: ["Enterprise SaaS", "Fintech", "Health & Wellness"],
    collaboratesWith: ["Art Director", "Motion Designer", "Copywriter"]
  },
  "Copywriter": {
    role: "Copywriter",
    workflowPhase: "Launch/Storytelling",
    workflowOrder: 18,
    relatedDeliverables: [
      "Brand Tagline & Campaign Copy",
      "Editorial Web & Conversion Copywriting",
      "Brand Manifesto & Brand Voice"
    ],
    relatedProjectTypes: ["Campaign", "New Brand", "Content System", "Website Redesign"],
    relatedIndustries: ["Luxury & Fashion", "Fintech", "Enterprise SaaS", "Health & Wellness"],
    collaboratesWith: ["Content Strategist", "Creative Director", "Art Director"]
  },
  "Content Strategist": {
    role: "Content Strategist",
    workflowPhase: "Launch/Storytelling",
    workflowOrder: 19,
    relatedDeliverables: [
      "Multi-Channel Editorial Content Plan",
      "Thought Leadership Narrative Framework",
      "Social & Campaign Content Matrix"
    ],
    relatedProjectTypes: ["Content System", "Campaign", "Market Expansion"],
    relatedIndustries: ["Enterprise SaaS", "Fintech", "Health & Wellness"],
    collaboratesWith: ["Copywriter", "Brand Strategist", "Visual Designer"]
  }
};

// Common Indirect User Expressions mapped to Canonical Deliverables & Disciplines
export const INDIRECT_EXPRESSION_MAP: Record<string, { deliverables: string[]; roles: RicozRole[] }> = {
  "visual system": {
    deliverables: ["Visual Identity System", "Brand Guidelines"],
    roles: ["Brand Identity Designer", "Brand Guidelines & Design Systems Specialist"]
  },
  "look and feel": {
    deliverables: ["Creative Direction & Treatment", "Visual Identity System"],
    roles: ["Creative Director", "Brand Identity Designer", "Art Director"]
  },
  "online store": {
    deliverables: ["E-Commerce Digital Experience", "Digital Product UI"],
    roles: ["UI/UX Designer", "Web Designer"]
  },
  "launch content": {
    deliverables: ["Multi-Channel Content Plan", "Launch Copywriting & Visuals"],
    roles: ["Content Strategist", "Copywriter", "Art Director"]
  },
  "brand book": {
    deliverables: ["Comprehensive Brand Bible", "Design System Guidelines"],
    roles: ["Brand Guidelines & Design Systems Specialist", "Brand Identity Designer"]
  },
  "packaging system": {
    deliverables: ["Structural Packaging & Material Specifications", "Unboxing Suite"],
    roles: ["Packaging Designer", "Brand Identity Designer", "Production & Print Specialist"]
  },
  "film-style launch campaign": {
    deliverables: ["Cinematic Campaign Vision", "Motion Graphics & Commercial Stills"],
    roles: ["Creative Director", "Art Director", "Motion Designer", "Brand Photographer"]
  },
  "mobile wallet": {
    deliverables: ["High-Density Data UI", "Mobile App Product Experience"],
    roles: ["UI/UX Designer", "Brand Guidelines & Design Systems Specialist"]
  },
  "hotel retreat": {
    deliverables: ["Bespoke Visual Identity", "Editorial Photography", "Interactive Reservation Platform"],
    roles: ["Creative Director", "Brand Identity Designer", "Art Director", "Web Designer"]
  }
};

// =========================================================================
// RICOZ AI V3.1 DOMAIN TAXONOMY & DISAMBIGUATION SYSTEM
// 11 Industry Sectors, Explicit Separation between Business Industry & Talent Matching
// =========================================================================

export const SECTORS = [
  "Technology",
  "Education",
  "Healthcare & Life Sciences",
  "Consumer & Retail",
  "Industrial & Manufacturing",
  "Social & Impact",
  "Financial & Legal",
  "Travel & Hospitality",
  "Creative & Media",
  "Fashion & Lifestyle",
  "Property & Real Estate"
] as const;

export type Sector = (typeof SECTORS)[number];

export interface DomainTaxonomyEntry {
  id: string;
  name: string;
  sector: Sector;
  subIndustries: string[];
  keywords: string[];
  talentMatchingCategories: string[];
}

export const DOMAIN_TAXONOMY: DomainTaxonomyEntry[] = [
  // 1. TECHNOLOGY
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    sector: "Technology",
    subIndustries: ["Enterprise Threat Intelligence", "Zero Trust & Endpoint Defense", "Cloud Security", "Quantum-Resistant Encryption"],
    keywords: [
      "cybersecurity", "cyber security", "infosec", "network security", "zero trust", "threat intelligence",
      "soc", "penetration testing", "quantum encryption", "endpoint protection", "firewall", "siem",
      "data security", "vulnerability management", "security operations", "ransomware", "anti-phishing",
      "credential stuffing", "quantum hacking"
    ],
    talentMatchingCategories: ["Enterprise SaaS", "Developer Infrastructure"]
  },
  {
    id: "enterprise_saas",
    name: "Enterprise SaaS",
    sector: "Technology",
    subIndustries: ["B2B SaaS Platforms", "Workflow Automation", "Enterprise Cloud Software", "Developer Productivity"],
    keywords: [
      "enterprise saas", "b2b saas", "saas", "enterprise software", "b2b software", "workflow automation",
      "erp", "crm", "collaboration platform", "data pipeline", "cloud platform", "multi-tenant"
    ],
    talentMatchingCategories: ["Enterprise SaaS", "B2B SaaS"]
  },
  {
    id: "ai_deeptech",
    name: "AI & DeepTech",
    sector: "Technology",
    subIndustries: ["Foundation Models & LLMs", "Autonomous Systems", "Neural Topography", "Computer Vision & Generative AI"],
    keywords: [
      "artificial intelligence", "deeptech", "deep tech", "machine learning", "neural network",
      "llm", "foundation model", "computer vision", "generative ai", "nlp", "reinforcement learning",
      "cognitive ai", "ai research", "autonomous agent"
    ],
    talentMatchingCategories: ["AI & DeepTech", "Enterprise SaaS"]
  },
  {
    id: "developer_infrastructure",
    name: "Developer Infrastructure",
    sector: "Technology",
    subIndustries: ["DevOps & Cloud Orchestration", "API Platforms", "Distributed Systems", "Developer Tools"],
    keywords: [
      "devops", "cloud infrastructure", "kubernetes", "api", "developer tools", "sdk", "observability",
      "microservices", "database", "distributed systems", "developer infrastructure"
    ],
    talentMatchingCategories: ["Developer Infrastructure", "Enterprise SaaS"]
  },
  {
    id: "consumer_apps",
    name: "Consumer Tech & Apps",
    sector: "Technology",
    subIndustries: ["Mobile Applications", "Consumer Software", "Social Platforms"],
    keywords: [
      "consumer app", "mobile app", "mobile application", "social app", "social mobile", "ios", "android",
      "consumer tech", "dating app", "study group app"
    ],
    talentMatchingCategories: ["Consumer Electronics", "E-commerce"]
  },

  // 2. EDUCATION
  {
    id: "edtech",
    name: "Education Technology",
    sector: "Education",
    subIndustries: ["Online Learning Platforms", "K-12 EdTech", "Higher Education Tools", "Corporate Upskilling"],
    keywords: [
      "edtech", "ed-tech", "education technology", "learning platform", "elearning", "e-learning",
      "lms", "online course", "classroom app", "student portal", "tutoring platform", "stem learning",
      "curriculum platform", "learning app", "educational", "education", "teaching", "montessori",
      "classroom", "tutoring", "upskilling"
    ],
    talentMatchingCategories: ["Education", "Enterprise SaaS"]
  },
  {
    id: "higher_education",
    name: "Higher Education & Academics",
    sector: "Education",
    subIndustries: ["Universities & Colleges", "Academic Research Institutes"],
    keywords: [
      "university", "college", "higher education", "academic institution", "faculty", "campus",
      "research institute", "scholarship", "fellowship"
    ],
    talentMatchingCategories: ["Education", "Culture & Arts"]
  },

  // 3. HEALTHCARE & LIFE SCIENCES
  {
    id: "biotechnology",
    name: "Biotechnology",
    sector: "Healthcare & Life Sciences",
    subIndustries: ["Genomic Intelligence", "Therapeutics & Molecular Biology", "Clinical Stage Biotechnology"],
    keywords: [
      "biotech", "biotechnology", "genomics", "clinical trial", "therapeutics", "laboratory",
      "molecular", "gene editing", "life sciences", "diagnostics", "oncology"
    ],
    talentMatchingCategories: ["Health & Wellness", "Enterprise SaaS"]
  },
  {
    id: "digital_health",
    name: "Digital Health & MedTech",
    sector: "Healthcare & Life Sciences",
    subIndustries: ["Telehealth & Remote Care", "Clinical Software", "Medical Device Interfaces"],
    keywords: [
      "digital health", "medtech", "telehealth", "telemedicine", "medical device", "patient monitoring",
      "electronic health records", "healthtech", "clinical health"
    ],
    talentMatchingCategories: ["Health & Wellness", "Enterprise SaaS"]
  },
  {
    id: "health_wellness",
    name: "Health & Wellness",
    sector: "Healthcare & Life Sciences",
    subIndustries: ["Mental Health & Mindfulness", "Nutritional Science", "Preventative Care"],
    keywords: [
      "mental health", "wellness platform", "nutrition", "preventative care", "holistic wellness",
      "habit tracking", "mindfulness", "health & wellness", "clinic", "hospital"
    ],
    talentMatchingCategories: ["Health & Wellness", "B2B SaaS"]
  },

  // 4. CONSUMER & RETAIL
  {
    id: "consumer_electronics",
    name: "Consumer Electronics",
    sector: "Consumer & Retail",
    subIndustries: ["Smart Home & IoT", "Wearables & Audio", "Personal Hardware"],
    keywords: [
      "consumer electronics", "smart home", "audio gear", "wearables", "headphones", "iot devices",
      "hardware gadget", "smartwatch", "smart speakers", "consumer hardware", "thermostat",
      "soundbar", "ambient climate", "ambient sound"
    ],
    talentMatchingCategories: ["Consumer Electronics", "E-commerce"]
  },
  {
    id: "beverage_fmcg",
    name: "Beverage & FMCG",
    sector: "Consumer & Retail",
    subIndustries: ["Craft Spirits & Wine", "Dairy & Plant-Based Beverages", "Functional Energy & Cold-Pressed", "Packaged Goods"],
    keywords: [
      "beverage", "drink", "craft beer", "brewery", "distillery", "spirits", "wine", "whisky", "gin",
      "coffee", "tea", "dairy", "milk", "plant-based milk", "food", "snack", "confectionery",
      "fmcg", "packaged food", "cpg", "bakery", "sourdough", "bread"
    ],
    talentMatchingCategories: ["Beverage & FMCG", "E-commerce"]
  },
  {
    id: "dtc_retail",
    name: "Direct-to-Consumer & Retail",
    sector: "Consumer & Retail",
    subIndustries: ["D2C Brands", "Omnichannel Retail", "Subscription Commerce"],
    keywords: [
      "direct-to-consumer", "d2c", "e-commerce brand", "subscription box", "personal care",
      "pet care", "consumer goods", "retail chain", "home goods", "dog treats", "pet food"
    ],
    talentMatchingCategories: ["E-commerce", "Consumer Electronics"]
  },

  // 5. INDUSTRIAL & MANUFACTURING
  {
    id: "manufacturing",
    name: "Manufacturing",
    sector: "Industrial & Manufacturing",
    subIndustries: ["Precision CNC & Tooling", "Heavy Industry", "Advanced Materials", "Contract Manufacturing"],
    keywords: [
      "manufacturing", "cnc", "industrial", "fabrication", "assembly line", "machinery",
      "factory", "materials engineering", "metals", "tooling", "heavy industry",
      "industrial equipment", "manufacturing plant"
    ],
    talentMatchingCategories: ["Consumer Electronics", "Enterprise SaaS"]
  },
  {
    id: "robotics_automation",
    name: "Robotics & Automation",
    sector: "Industrial & Manufacturing",
    subIndustries: ["Industrial Robotics", "Autonomous Warehouse Systems", "Bionic Actuators"],
    keywords: [
      "robotics", "autonomous robots", "industrial automation", "warehouse robotics",
      "cobots", "actuators", "bionics", "kinetic robotics", "mobile robots"
    ],
    talentMatchingCategories: ["AI & DeepTech", "Automotive & Mobility"]
  },
  {
    id: "automotive_mobility",
    name: "Automotive & Mobility",
    sector: "Industrial & Manufacturing",
    subIndustries: ["Electric Vehicles (EV)", "Autonomous Mobility", "Aerospace & Aviation", "Fleet Logistics"],
    keywords: [
      "automotive", "electric vehicle", "ev", "autonomous vehicle", "aerospace", "aviation",
      "aircraft", "mobility platform", "fleet", "hypercar", "charging network", "supercar", "auto show"
    ],
    talentMatchingCategories: ["Automotive & Mobility", "Enterprise SaaS"]
  },

  // 6. SOCIAL & IMPACT
  {
    id: "nonprofit_conservation",
    name: "Non-profit & Conservation",
    sector: "Social & Impact",
    subIndustries: ["Ocean & Wildlife Conservation", "Philanthropic Foundations", "Global NGOs", "Charitable Trusts"],
    keywords: [
      "non-profit", "nonprofit", "ngo", "conservation", "ocean conservation", "wildlife",
      "charity", "philanthropy", "foundation", "humanitarian", "social impact", "endowment"
    ],
    talentMatchingCategories: ["Culture & Arts", "Climate Tech"]
  },
  {
    id: "sustainability_climate",
    name: "Sustainability & Climate Tech",
    sector: "Social & Impact",
    subIndustries: ["Carbon Accounting & Removal", "Renewable Energy", "Circular Materials"],
    keywords: [
      "climate tech", "clean energy", "renewable energy", "carbon capture", "solar",
      "wind power", "circular economy", "biodegradable", "esg", "sustainability",
      "direct air capture", "carbon dioxide", "sequester carbon"
    ],
    talentMatchingCategories: ["Climate Tech", "Enterprise SaaS"]
  },

  // 7. FINANCIAL & LEGAL
  {
    id: "fintech",
    name: "Fintech",
    sector: "Financial & Legal",
    subIndustries: ["Digital Banking & Neobanks", "Cross-Border Payments & FX", "Point-of-Sale Infrastructure", "Lending & Credit"],
    keywords: [
      "fintech", "payments", "mobile wallet", "neobank", "digital banking", "lending",
      "point of sale", "cross-border payments", "merchant processing", "money transfer", "financial app"
    ],
    talentMatchingCategories: ["Fintech", "B2B SaaS"]
  },
  {
    id: "wealth_investment",
    name: "Investment & Wealth Management",
    sector: "Financial & Legal",
    subIndustries: ["Private Equity & Venture Capital", "Hedge Funds & Quantitative Trading", "Private Banking & Family Offices"],
    keywords: [
      "wealth management", "hedge fund", "asset management", "private equity", "venture capital",
      "investment banking", "portfolio management", "family office", "institutional investor", "sovereign portfolio"
    ],
    talentMatchingCategories: ["Fintech", "Enterprise SaaS"]
  },
  {
    id: "legaltech",
    name: "Legal Tech & Governance",
    sector: "Financial & Legal",
    subIndustries: ["Contract AI & Automation", "Regulatory Compliance (RegTech)", "IP Management"],
    keywords: [
      "legal tech", "legaltech", "contract management", "compliance", "law firm",
      "regulatory tech", "regtech", "ip management", "legal co-pilot", "legal copilot",
      "legal", "general counsel", "in-house counsel", "contract review"
    ],
    talentMatchingCategories: ["Enterprise SaaS", "B2B SaaS"]
  },
  {
    id: "web3_crypto",
    name: "Web3 & Crypto",
    sector: "Financial & Legal",
    subIndustries: ["DeFi Protocols", "Blockchain Infrastructure", "Digital Assets"],
    keywords: [
      "web3", "crypto", "blockchain", "defi", "smart contracts", "tokenomics", "decentralized", "dao", "layer 2",
      "cross-chain bridge", "liquidity aggregator"
    ],
    talentMatchingCategories: ["Fintech", "Developer Infrastructure"]
  },

  // 8. TRAVEL & HOSPITALITY
  {
    id: "hospitality",
    name: "Hospitality",
    sector: "Travel & Hospitality",
    subIndustries: ["Luxury Resorts & Retreats", "Boutique Hotels", "Culinary & Michelin Dining", "Private Member Clubs"],
    keywords: [
      "hospitality", "luxury hotel", "boutique hotel", "resort", "retreat", "luxury hospitality",
      "private island", "safari lodge", "concierge", "fine dining", "michelin", "hotel retreat",
      "guest experience", "hotel", "spa", "resort", "alpine spa", "private members club"
    ],
    talentMatchingCategories: ["Hospitality", "Luxury & Fashion"]
  },
  {
    id: "tourism",
    name: "Travel & Tourism",
    sector: "Travel & Hospitality",
    subIndustries: ["Destination Marketing", "Expedition Travel", "Aviation & Luxury Charters"],
    keywords: [
      "tourism", "travel", "destination branding", "airline", "expedition", "hotel chain", "vacation rental", "travel guide", "safari"
    ],
    talentMatchingCategories: ["Hospitality", "Culture & Arts"]
  },

  // 9. CREATIVE & MEDIA
  {
    id: "entertainment_gaming",
    name: "Entertainment & Gaming",
    sector: "Creative & Media",
    subIndustries: ["Esports Leagues", "AAA Game Studios", "Interactive Entertainment"],
    keywords: [
      "gaming", "video games", "esports", "studio", "entertainment", "game development", "streaming", "virtual reality entertainment",
      "game studio", "rpg"
    ],
    talentMatchingCategories: ["Entertainment & Media", "Culture & Arts"]
  },
  {
    id: "publishing_media",
    name: "Publishing, Film & Audio",
    sector: "Creative & Media",
    subIndustries: ["Editorial Magazines", "Film Production & Documentaries", "Music & Podcasts"],
    keywords: [
      "publishing", "magazine", "film production", "media company", "record label", "audio", "podcast network", "cinema", "journalism", "editorial publication",
      "publication", "monograph", "press", "print edition", "journal"
    ],
    talentMatchingCategories: ["Entertainment & Media", "Culture & Arts"]
  },

  // 10. FASHION & LIFESTYLE
  {
    id: "luxury_fashion",
    name: "Luxury & Fashion",
    sector: "Fashion & Lifestyle",
    subIndustries: ["Haute Couture & Runway", "Luxury Leather Goods & Accessories", "Bespoke Horology & Fine Jewelry", "Designer Streetwear"],
    keywords: [
      "luxury fashion", "haute couture", "fashion house", "runway", "designer apparel",
      "luxury leather goods", "timepieces", "high jewelry", "atelier", "fashion brand",
      "streetwear", "apparel label", "luxury goods", "fashion", "unisex apparel", "lookbook"
    ],
    talentMatchingCategories: ["Luxury & Fashion", "E-commerce"]
  },
  {
    id: "beauty_cosmetics",
    name: "Beauty & Cosmetics",
    sector: "Fashion & Lifestyle",
    subIndustries: ["Clinical & Clean Skincare", "Luxury Fragrance & Parfumerie", "Botanical & Ayurvedic Beauty"],
    keywords: [
      "skincare", "cosmetics", "clean beauty", "fragrance", "perfume", "dermatological",
      "serum", "haircare", "ayurvedic beauty", "beauty brand", "skincare collection"
    ],
    talentMatchingCategories: ["Health & Wellness", "Luxury & Fashion"]
  },

  // 11. PROPERTY & REAL ESTATE
  {
    id: "real_estate_architecture",
    name: "Real Estate & Architecture",
    sector: "Property & Real Estate",
    subIndustries: ["Luxury Residential Developments", "Commercial Real Estate", "Architectural Studios"],
    keywords: [
      "real estate", "architecture", "residential tower", "commercial property",
      "interior architecture", "property developer", "urban planning", "sales gallery", "penthouse", "architectural firm"
    ],
    talentMatchingCategories: ["Real Estate & Architecture", "Luxury & Fashion"]
  },
  {
    id: "proptech",
    name: "PropTech",
    sector: "Property & Real Estate",
    subIndustries: ["Property Management Tech", "Tenant Experience Software"],
    keywords: [
      "proptech", "property management software", "tenant portal", "commercial leasing platform", "real estate tech"
    ],
    talentMatchingCategories: ["Real Estate & Architecture", "Enterprise SaaS"]
  }
];

export interface DomainClassificationResult {
  primaryIndustry: string;
  subIndustry?: string;
  secondaryIndustries: string[];
  sector: Sector | "Other";
  industryCategoryType: "domain" | "specialized" | "cross-domain";
  industryConfidence: number; // 0 to 100
  industryEvidence: string[];
  talentMatchingCategories: string[];
}

/**
 * Disambiguates and classifies a brief into primary business industry vs talent matching categories,
 * applying negative context rules (e.g. "serving banks" = audience, not fintech).
 */
export function classifyIndustryFromBrief(brief: string): DomainClassificationResult {
  const normalized = brief.toLowerCase();
  const evidence: string[] = [];

  // Check negative context conditions:
  // 1. Target Client is Financial (e.g. protecting banks / serving financial institutions)
  const isTargetAudienceFinancial =
    (normalized.includes("bank") || normalized.includes("financial institution") || normalized.includes("banking")) &&
    (normalized.includes("protect") ||
      normalized.includes("for bank") ||
      normalized.includes("serving") ||
      normalized.includes("target") ||
      normalized.includes("clients are") ||
      normalized.includes("customer"));

  // 2. Hotel / Resort asking for website or UX
  const isHospitalityApp =
    (normalized.includes("hotel") || normalized.includes("resort") || normalized.includes("retreat")) &&
    (normalized.includes("website") || normalized.includes("app") || normalized.includes("platform") || normalized.includes("ux"));

  // 3. Fashion / Apparel selling on Shopify / E-commerce
  const isFashionD2C =
    (normalized.includes("fashion") || normalized.includes("streetwear") || normalized.includes("apparel") || normalized.includes("jewelry") || normalized.includes("couture")) &&
    (normalized.includes("shopify") || normalized.includes("ecommerce") || normalized.includes("e-commerce") || normalized.includes("store"));

  // 4. Climate Tech mentioning manufacturing
  const isClimateTechManufacturing =
    (normalized.includes("climate tech") || normalized.includes("carbon capture") || normalized.includes("direct air capture")) &&
    normalized.includes("manufacturing");

  // Check domain entries by keyword score
  const domainScores: Array<{ entry: DomainTaxonomyEntry; score: number; matchedKeywords: string[] }> = [];

  for (const entry of DOMAIN_TAXONOMY) {
    let score = 0;
    const matchedKeywords: string[] = [];

    // Disambiguation: if target audience is financial, do NOT give points to Fintech
    if (entry.id === "fintech" && isTargetAudienceFinancial && !normalized.includes("we are a fintech")) {
      continue;
    }

    // Disambiguation: if climate tech is manufacturing modular carbon capture units, prioritize Sustainability & Climate Tech
    if (entry.id === "manufacturing" && isClimateTechManufacturing) {
      continue;
    }

    // Boost hospitality if hotel/spa/resort is asking for web/app
    if (entry.id === "hospitality" && isHospitalityApp) {
      score += 10;
    }

    // Boost fashion if fashion brand is selling on shopify
    if (entry.id === "luxury_fashion" && isFashionD2C) {
      score += 10;
    }

    for (const kw of entry.keywords) {
      // Allow plural endings s/es
      const escaped = kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp(`\\b${escaped}(s|es)?\\b`, "i");
      if (regex.test(normalized)) {
        score += kw.length > 8 ? 4 : 2;
        matchedKeywords.push(kw);
      }
    }

    if (score > 0) {
      domainScores.push({ entry, score, matchedKeywords });
    }
  }

  // Sort by score descending
  domainScores.sort((a, b) => b.score - a.score);

  if (domainScores.length > 0) {
    const top = domainScores[0];
    const secondaryList: string[] = [];

    // If target audience is financial, explicitly add Financial Services to secondary industries
    if (isTargetAudienceFinancial && !secondaryList.includes("Financial Services")) {
      secondaryList.push("Financial Services");
      evidence.push("Target clients identified as financial institutions/banks");
    }

    // Add other high scoring domains as secondary
    for (let i = 1; i < domainScores.length; i++) {
      if (domainScores[i].score >= 2 && !secondaryList.includes(domainScores[i].entry.name)) {
        secondaryList.push(domainScores[i].entry.name);
      }
    }

    // Determine subIndustry
    let subIndustry: string | undefined = undefined;
    for (const sub of top.entry.subIndustries) {
      const subWords = sub.toLowerCase().split(/\s+/);
      if (subWords.some((w) => w.length > 4 && normalized.includes(w))) {
        subIndustry = sub;
        break;
      }
    }
    if (!subIndustry && top.entry.subIndustries.length > 0) {
      subIndustry = top.entry.subIndustries[0];
    }

    evidence.push(`Matched key terms: ${top.matchedKeywords.slice(0, 4).join(", ")}`);

    return {
      primaryIndustry: top.entry.name,
      subIndustry,
      secondaryIndustries: secondaryList,
      sector: top.entry.sector,
      industryCategoryType: secondaryList.length > 0 ? "cross-domain" : "domain",
      industryConfidence: Math.min(98, 70 + top.score * 4),
      industryEvidence: evidence,
      talentMatchingCategories: top.entry.talentMatchingCategories
    };
  }

  // Fallback if no specific taxonomy entry triggered
  let fallbackName = "Creative & Consumer";
  let fallbackSector: Sector = "Consumer & Retail";
  let fallbackTalent = ["E-commerce", "Enterprise SaaS"];

  if (normalized.includes("tech") || normalized.includes("software")) {
    fallbackName = "Enterprise SaaS";
    fallbackSector = "Technology";
    fallbackTalent = ["Enterprise SaaS", "B2B SaaS"];
  }

  return {
    primaryIndustry: fallbackName,
    subIndustry: undefined,
    secondaryIndustries: [],
    sector: fallbackSector,
    industryCategoryType: "domain",
    industryConfidence: 65,
    industryEvidence: ["Inferred from general project context"],
    talentMatchingCategories: fallbackTalent
  };
}
