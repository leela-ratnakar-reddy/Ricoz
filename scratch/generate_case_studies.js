const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outputDir = path.join(__dirname, '../public/images/case-studies');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 1. NORTHSTAR CLOUD GLOBAL IDENTITY
// Sophisticated enterprise cloud branding, dark graphite, refined blue/cyan accents, large Northstar geometric symbol, clean typography, presentation-style composition.
const northstarSvg = `
<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="ns-glow" cx="40%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#00F0FF" stop-opacity="0.18"/>
      <stop offset="40%" stop-color="#2563EB" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#080B11" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="ns-star-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00F0FF"/>
      <stop offset="45%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </linearGradient>
    <linearGradient id="ns-card-bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#121622" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#0C0F17" stop-opacity="0.95"/>
    </linearGradient>
    <linearGradient id="ns-card-border" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00F0FF" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#2563EB" stop-opacity="0.1"/>
    </linearGradient>
    <filter id="ns-blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="30"/>
    </filter>
    <pattern id="ns-grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2563EB" stroke-opacity="0.06" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Background Base -->
  <rect width="1200" height="800" fill="#080B11"/>
  <rect width="1200" height="800" fill="url(#ns-grid)"/>
  <circle cx="450" cy="400" r="450" fill="url(#ns-glow)"/>

  <!-- Top Presentation Agency Bar -->
  <g opacity="0.6">
    <text x="70" y="65" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#00F0FF" letter-spacing="3">CASE STUDY // 01</text>
    <text x="210" y="65" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#717A8C" letter-spacing="1">CLIENT: NORTHSTAR CLOUD</text>
    <text x="500" y="65" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#717A8C" letter-spacing="1">DISCIPLINE: GLOBAL BRAND ARCHITECTURE</text>
    <text x="1050" y="65" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#00F0FF" font-weight="600" text-anchor="end">STAGE 04 / COMPLETED</text>
    <line x1="70" y1="85" x2="1130" y2="85" stroke="#2563EB" stroke-opacity="0.15" stroke-width="1"/>
  </g>

  <!-- Left Main Column: Brandmark & Typography -->
  <g transform="translate(80, 160)">
    <!-- Glowing Halo behind star -->
    <circle cx="160" cy="160" r="120" fill="#00F0FF" opacity="0.12" filter="url(#ns-blur)"/>

    <!-- Northstar 8-Point Faceted Geometric Emblem -->
    <g transform="translate(160, 160)">
      <!-- Outer Geometric Orbit Ring -->
      <circle cx="0" cy="0" r="110" fill="none" stroke="#00F0FF" stroke-width="1" stroke-opacity="0.25" stroke-dasharray="4 6"/>
      <circle cx="0" cy="0" r="85" fill="none" stroke="#2563EB" stroke-width="1" stroke-opacity="0.3"/>
      
      <!-- Primary 8-Point Star Facets -->
      <!-- Vertical Top Point -->
      <polygon points="0,-100 18,-24 0,0" fill="#00F0FF" opacity="0.95"/>
      <polygon points="0,-100 -18,-24 0,0" fill="#38BDF8" opacity="0.75"/>
      <!-- Vertical Bottom Point -->
      <polygon points="0,100 -18,24 0,0" fill="#1D4ED8" opacity="0.85"/>
      <polygon points="0,100 18,24 0,0" fill="#2563EB" opacity="0.7"/>
      <!-- Horizontal Right Point -->
      <polygon points="100,0 24,-18 0,0" fill="#00F0FF" opacity="0.85"/>
      <polygon points="100,0 24,18 0,0" fill="#0284C7" opacity="0.7"/>
      <!-- Horizontal Left Point -->
      <polygon points="-100,0 -24,18 0,0" fill="#3B82F6" opacity="0.8"/>
      <polygon points="-100,0 -24,-18 0,0" fill="#1E40AF" opacity="0.65"/>
      
      <!-- Diagonal Points -->
      <polygon points="65,-65 14,-22 0,0" fill="#38BDF8" opacity="0.85"/>
      <polygon points="65,-65 22,-14 0,0" fill="#0284C7" opacity="0.65"/>
      <polygon points="-65,65 -14,22 0,0" fill="#1D4ED8" opacity="0.8"/>
      <polygon points="-65,65 -22,14 0,0" fill="#2563EB" opacity="0.6"/>
      <polygon points="65,65 22,14 0,0" fill="#2563EB" opacity="0.75"/>
      <polygon points="65,65 14,22 0,0" fill="#1D4ED8" opacity="0.6"/>
      <polygon points="-65,-65 -22,-14 0,0" fill="#00F0FF" opacity="0.75"/>
      <polygon points="-65,-65 -14,-22 0,0" fill="#38BDF8" opacity="0.6"/>

      <!-- Center Core -->
      <circle cx="0" cy="0" r="10" fill="#FFFFFF"/>
      <circle cx="0" cy="0" r="4" fill="#00F0FF"/>
    </g>

    <!-- Typography -->
    <text x="350" y="110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="54" font-weight="900" fill="#FFFFFF" letter-spacing="-1">NORTHSTAR</text>
    <text x="350" y="148" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#00F0FF" letter-spacing="6">ENTERPRISE CLOUD ARCHITECTURE</text>
    <text x="350" y="185" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="400" fill="#94A3B8" width="450">
      Global rebrand uniting autonomous multi-cloud telemetry, zero-trust security infrastructure,
    </text>
    <text x="350" y="208" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="400" fill="#94A3B8">
      and developer experience under a monolithic design system across 48 worldwide regions.
    </text>

    <!-- Specimen Chips -->
    <g transform="translate(350, 245)">
      <rect x="0" y="0" width="130" height="34" rx="8" fill="#101726" stroke="#2563EB" stroke-width="1" stroke-opacity="0.3"/>
      <text x="14" y="21" font-family="monospace" font-size="11" fill="#38BDF8">v4.2 // TOKENS</text>

      <rect x="142" y="0" width="150" height="34" rx="8" fill="#101726" stroke="#2563EB" stroke-width="1" stroke-opacity="0.3"/>
      <text x="156" y="21" font-family="monospace" font-size="11" fill="#94A3B8">LATENCY 4.2ms</text>

      <rect x="304" y="0" width="150" height="34" rx="8" fill="#101726" stroke="#2563EB" stroke-width="1" stroke-opacity="0.3"/>
      <text x="318" y="21" font-family="monospace" font-size="11" fill="#00F0FF">+64% PERCEPTION</text>
    </g>
  </g>

  <!-- Right Presentation Cards: Interface & Brand Tokens -->
  <g transform="translate(70, 480)">
    <!-- Card 1: Cloud Telemetry Dashboard Component -->
    <g transform="translate(0, 0)">
      <rect width="480" height="230" rx="16" fill="url(#ns-card-bg)" stroke="url(#ns-card-border)" stroke-width="1"/>
      <!-- Header -->
      <circle cx="28" cy="28" r="4" fill="#EF4444"/>
      <circle cx="42" cy="28" r="4" fill="#F59E0B"/>
      <circle cx="56" cy="28" r="4" fill="#10B981"/>
      <text x="80" y="32" font-family="monospace" font-size="10" fill="#64748B">northstar.telemetry.mesh / node-cluster-08</text>
      <line x1="16" y1="48" x2="464" y2="48" stroke="#334155" stroke-opacity="0.4" stroke-width="1"/>

      <!-- Metric Blocks -->
      <g transform="translate(24, 66)">
        <text x="0" y="16" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" fill="#94A3B8">GLOBAL THROUGHPUT</text>
        <text x="0" y="44" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="26" font-weight="800" fill="#FFFFFF">14.8 PB/s</text>
        <text x="0" y="64" font-family="monospace" font-size="10" fill="#00F0FF">● 99.999% SLA UPTIME</text>
      </g>
      <g transform="translate(260, 66)">
        <text x="0" y="16" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" fill="#94A3B8">NODES ORCHESTRATED</text>
        <text x="0" y="44" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="26" font-weight="800" fill="#38BDF8">2,480,120</text>
        <text x="0" y="64" font-family="monospace" font-size="10" fill="#10B981">▲ ACTIVE SYNCHRONIZATION</text>
      </g>

      <!-- Mini Sparkline Graph -->
      <path d="M 24 190 Q 70 160 130 175 T 240 145 T 350 170 T 450 130" fill="none" stroke="#00F0FF" stroke-width="2.5"/>
      <path d="M 24 190 Q 70 160 130 175 T 240 145 T 350 170 T 450 130 L 450 200 L 24 200 Z" fill="#00F0FF" opacity="0.08"/>
    </g>

    <!-- Card 2: Color Palette Swatches -->
    <g transform="translate(506, 0)">
      <rect width="260" height="230" rx="16" fill="url(#ns-card-bg)" stroke="url(#ns-card-border)" stroke-width="1"/>
      <text x="20" y="32" font-family="monospace" font-size="10" fill="#94A3B8" letter-spacing="1">BRAND COLOR TOKENS</text>

      <!-- Swatch 1 -->
      <rect x="20" y="52" width="44" height="44" rx="10" fill="#00F0FF"/>
      <text x="76" y="70" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">Hyper Cyan</text>
      <text x="76" y="86" font-family="monospace" font-size="10" fill="#64748B">#00F0FF // Primary</text>

      <!-- Swatch 2 -->
      <rect x="20" y="108" width="44" height="44" rx="10" fill="#1E3A8A"/>
      <text x="76" y="126" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">Deep Cobalt</text>
      <text x="76" y="142" font-family="monospace" font-size="10" fill="#64748B">#1E3A8A // Foundation</text>

      <!-- Swatch 3 -->
      <rect x="20" y="164" width="44" height="44" rx="10" fill="#0A0E17" stroke="#334155" stroke-width="1"/>
      <text x="76" y="182" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">Obsidian Mesh</text>
      <text x="76" y="198" font-family="monospace" font-size="10" fill="#64748B">#0A0E17 // Surface</text>
    </g>

    <!-- Card 3: Geometric Iconography Suite -->
    <g transform="translate(790, 0)">
      <rect width="270" height="230" rx="16" fill="url(#ns-card-bg)" stroke="url(#ns-card-border)" stroke-width="1"/>
      <text x="20" y="32" font-family="monospace" font-size="10" fill="#94A3B8" letter-spacing="1">SYSTEM ICONOGRAPHY // 24PX</text>

      <g transform="translate(30, 60)">
        <!-- Icon 1: Cluster -->
        <rect x="0" y="0" width="90" height="66" rx="8" fill="#141B2D" border="1"/>
        <circle cx="30" cy="33" r="6" fill="#00F0FF"/>
        <circle cx="55" cy="22" r="5" fill="#38BDF8"/>
        <circle cx="60" cy="44" r="5" fill="#3B82F6"/>
        <line x1="30" y1="33" x2="55" y2="22" stroke="#60A5FA" stroke-width="1.5"/>
        <line x1="30" y1="33" x2="60" y2="44" stroke="#60A5FA" stroke-width="1.5"/>

        <!-- Icon 2: Encryption Shield -->
        <rect x="110" y="0" width="90" height="66" rx="8" fill="#141B2D"/>
        <path d="M 155 18 L 175 26 V 40 C 175 50 155 56 155 56 C 155 56 135 50 135 40 V 26 Z" fill="none" stroke="#00F0FF" stroke-width="2"/>
        <circle cx="155" cy="36" r="3" fill="#00F0FF"/>

        <!-- Icon 3: Pipeline Flow -->
        <rect x="0" y="80" width="90" height="66" rx="8" fill="#141B2D"/>
        <path d="M 20 113 H 70" stroke="#38BDF8" stroke-width="2" stroke-dasharray="4 2"/>
        <polygon points="70,113 62,109 62,117" fill="#38BDF8"/>
        <circle cx="35" cy="113" r="4" fill="#00F0FF"/>

        <!-- Icon 4: Node Lattice -->
        <rect x="110" y="80" width="90" height="66" rx="8" fill="#141B2D"/>
        <rect x="135" y="96" width="40" height="34" rx="4" fill="none" stroke="#00F0FF" stroke-width="1.5"/>
        <line x1="145" y1="96" x2="145" y2="130" stroke="#00F0FF" stroke-width="1"/>
        <line x1="165" y1="96" x2="165" y2="130" stroke="#00F0FF" stroke-width="1"/>
      </g>
    </g>
  </g>
</svg>
`;

// 2. SYNTHETIX GENOMIC INTELLIGENCE
// Deep dark background, violet / electric purple accents, elegant molecular or DNA-inspired visual system, data visualization, scientific visual identity.
const synthetixSvg = `
<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="syn-glow" cx="48%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#C084FC" stop-opacity="0.2"/>
      <stop offset="35%" stop-color="#8B5CF6" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#090710" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="syn-card-bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#140F24" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#0D0917" stop-opacity="0.95"/>
    </linearGradient>
    <linearGradient id="syn-violet" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E879F9"/>
      <stop offset="50%" stop-color="#A855F7"/>
      <stop offset="100%" stop-color="#7C3AED"/>
    </linearGradient>
    <filter id="syn-blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="35"/>
    </filter>
    <pattern id="syn-hex" width="60" height="52" patternUnits="userSpaceOnUse">
      <path d="M 30 0 L 60 17.3 L 60 52 L 30 34.6 L 0 52 L 0 17.3 Z" fill="none" stroke="#8B5CF6" stroke-opacity="0.04" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Background Base -->
  <rect width="1200" height="800" fill="#090710"/>
  <rect width="1200" height="800" fill="url(#syn-hex)"/>
  <circle cx="520" cy="380" r="500" fill="url(#syn-glow)"/>

  <!-- Top Agency Specimen Bar -->
  <g opacity="0.6">
    <text x="70" y="65" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#C084FC" letter-spacing="3">CASE STUDY // 02</text>
    <text x="210" y="65" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#8B869C" letter-spacing="1">CLIENT: SYNTHETIX BIO</text>
    <text x="500" y="65" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#8B869C" letter-spacing="1">DISCIPLINE: GENOMIC BRAND ARCHITECTURE</text>
    <text x="1050" y="65" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#C084FC" font-weight="600" text-anchor="end">$120M SERIES C POSITIONING</text>
    <line x1="70" y1="85" x2="1130" y2="85" stroke="#8B5CF6" stroke-opacity="0.15" stroke-width="1"/>
  </g>

  <!-- Main Hero Graphic: Molecular DNA Helical Lattice -->
  <g transform="translate(80, 150)">
    <!-- Ambient glow behind lattice -->
    <circle cx="160" cy="160" r="140" fill="#A855F7" opacity="0.15" filter="url(#syn-blur)"/>

    <!-- Central Molecular Emblem -->
    <g transform="translate(160, 160)">
      <!-- Hexagonal Rings -->
      <polygon points="0,-100 86.6,-50 86.6,50 0,100 -86.6,50 -86.6,-50" fill="none" stroke="#C084FC" stroke-width="1.5" stroke-opacity="0.4" stroke-dasharray="6 4"/>
      <polygon points="0,-75 65,-37.5 65,37.5 0,75 -65,37.5 -65,-37.5" fill="none" stroke="#8B5CF6" stroke-width="1" stroke-opacity="0.25"/>

      <!-- Helical Intersecting Arcs -->
      <path d="M -70 -70 C -20 -110, 20 110, 70 70" fill="none" stroke="url(#syn-violet)" stroke-width="3"/>
      <path d="M 70 -70 C 20 -110, -20 110, -70 70" fill="none" stroke="url(#syn-violet)" stroke-width="3"/>

      <!-- Molecular Nodes -->
      <circle cx="-70" cy="-70" r="9" fill="#E879F9"/>
      <circle cx="70" cy="-70" r="9" fill="#A855F7"/>
      <circle cx="70" cy="70" r="9" fill="#C084FC"/>
      <circle cx="-70" cy="70" r="9" fill="#7C3AED"/>
      
      <circle cx="0" cy="0" r="16" fill="#140F24" stroke="#E879F9" stroke-width="2"/>
      <circle cx="0" cy="0" r="7" fill="#E879F9"/>

      <line x1="-35" y1="-35" x2="35" y2="35" stroke="#E879F9" stroke-width="1" stroke-opacity="0.6"/>
      <line x1="35" y1="-35" x2="-35" y2="35" stroke="#C084FC" stroke-width="1" stroke-opacity="0.6"/>
    </g>

    <!-- Typography -->
    <text x="350" y="110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="54" font-weight="900" fill="#FFFFFF" letter-spacing="-1">SYNTHETIX</text>
    <text x="350" y="148" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#C084FC" letter-spacing="6">GENOMIC INTELLIGENCE SYSTEM</text>
    <text x="350" y="185" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="400" fill="#A78BFA" width="450">
      Algorithmic identity and biological design tokens establishing an institutional visual grammar
    </text>
    <text x="350" y="208" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="400" fill="#A78BFA">
      for synthetic biology therapeutics, computational sequencing tools, and scientific journals.
    </text>

    <!-- Specimen Chips -->
    <g transform="translate(350, 245)">
      <rect x="0" y="0" width="140" height="34" rx="8" fill="#1A1230" stroke="#8B5CF6" stroke-width="1" stroke-opacity="0.4"/>
      <text x="14" y="21" font-family="monospace" font-size="11" fill="#E879F9">NUCLEOTIDE // 8B</text>

      <rect x="152" y="0" width="160" height="34" rx="8" fill="#1A1230" stroke="#8B5CF6" stroke-width="1" stroke-opacity="0.4"/>
      <text x="166" y="21" font-family="monospace" font-size="11" fill="#C084FC">SERIES C // $120M</text>

      <rect x="324" y="0" width="150" height="34" rx="8" fill="#1A1230" stroke="#8B5CF6" stroke-width="1" stroke-opacity="0.4"/>
      <text x="338" y="21" font-family="monospace" font-size="11" fill="#FFFFFF">NATURE BIOTECH</text>
    </g>
  </g>

  <!-- Lower Cards: Genomic Sequence Matrix & Scientific Visual Identity -->
  <g transform="translate(70, 480)">
    <!-- Card 1: Gene Sequencing Visualizer -->
    <g transform="translate(0, 0)">
      <rect width="480" height="230" rx="16" fill="url(#syn-card-bg)" stroke="#8B5CF6" stroke-opacity="0.3" stroke-width="1"/>
      <circle cx="28" cy="28" r="4" fill="#C084FC"/>
      <text x="44" y="32" font-family="monospace" font-size="10" fill="#A78BFA">GENE SEQUENCING MATRIX // CHROMOSOME 14</text>
      <line x1="16" y1="48" x2="464" y2="48" stroke="#8B5CF6" stroke-opacity="0.2" stroke-width="1"/>

      <!-- Sequence Bars -->
      <g transform="translate(24, 70)">
        <!-- Bar rows -->
        <g transform="translate(0, 0)">
          <text x="0" y="16" font-family="monospace" font-size="11" fill="#E879F9">LOCUS 01</text>
          <rect x="80" y="6" width="35" height="14" rx="4" fill="#E879F9"/>
          <rect x="120" y="6" width="60" height="14" rx="4" fill="#8B5CF6"/>
          <rect x="185" y="6" width="90" height="14" rx="4" fill="#C084FC"/>
          <rect x="280" y="6" width="40" height="14" rx="4" fill="#7C3AED"/>
          <rect x="325" y="6" width="110" height="14" rx="4" fill="#E879F9"/>
        </g>
        <g transform="translate(0, 32)">
          <text x="0" y="16" font-family="monospace" font-size="11" fill="#A78BFA">LOCUS 02</text>
          <rect x="80" y="6" width="80" height="14" rx="4" fill="#8B5CF6"/>
          <rect x="165" y="6" width="40" height="14" rx="4" fill="#C084FC"/>
          <rect x="210" y="6" width="100" height="14" rx="4" fill="#E879F9"/>
          <rect x="315" y="6" width="55" height="14" rx="4" fill="#7C3AED"/>
          <rect x="375" y="6" width="60" height="14" rx="4" fill="#8B5CF6"/>
        </g>
        <g transform="translate(0, 64)">
          <text x="0" y="16" font-family="monospace" font-size="11" fill="#E879F9">LOCUS 03</text>
          <rect x="80" y="6" width="50" height="14" rx="4" fill="#C084FC"/>
          <rect x="135" y="6" width="75" height="14" rx="4" fill="#E879F9"/>
          <rect x="215" y="6" width="45" height="14" rx="4" fill="#7C3AED"/>
          <rect x="265" y="6" width="110" height="14" rx="4" fill="#8B5CF6"/>
          <rect x="380" y="6" width="55" height="14" rx="4" fill="#C084FC"/>
        </g>
        <g transform="translate(0, 96)">
          <text x="0" y="16" font-family="monospace" font-size="11" fill="#A78BFA">LOCUS 04</text>
          <rect x="80" y="6" width="110" height="14" rx="4" fill="#7C3AED"/>
          <rect x="195" y="6" width="40" height="14" rx="4" fill="#E879F9"/>
          <rect x="240" y="6" width="80" height="14" rx="4" fill="#8B5CF6"/>
          <rect x="325" y="6" width="70" height="14" rx="4" fill="#C084FC"/>
          <rect x="400" y="6" width="35" height="14" rx="4" fill="#7C3AED"/>
        </g>
      </g>
    </g>

    <!-- Card 2: Scientific Palette & Lab Tokens -->
    <g transform="translate(506, 0)">
      <rect width="260" height="230" rx="16" fill="url(#syn-card-bg)" stroke="#8B5CF6" stroke-opacity="0.3" stroke-width="1"/>
      <text x="20" y="32" font-family="monospace" font-size="10" fill="#A78BFA" letter-spacing="1">BIO-IDENTITY SWATCHES</text>

      <!-- Swatch 1 -->
      <rect x="20" y="52" width="44" height="44" rx="10" fill="#E879F9"/>
      <text x="76" y="70" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">Orchid Helix</text>
      <text x="76" y="86" font-family="monospace" font-size="10" fill="#8B869C">#E879F9 // Active</text>

      <!-- Swatch 2 -->
      <rect x="20" y="108" width="44" height="44" rx="10" fill="#8B5CF6"/>
      <text x="76" y="126" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">Ultraviolet Pulse</text>
      <text x="76" y="142" font-family="monospace" font-size="10" fill="#8B869C">#8B5CF6 // Structural</text>

      <!-- Swatch 3 -->
      <rect x="20" y="164" width="44" height="44" rx="10" fill="#140F24" stroke="#8B5CF6" stroke-width="1"/>
      <text x="76" y="182" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">Deep Helix Void</text>
      <text x="76" y="198" font-family="monospace" font-size="10" fill="#8B869C">#140F24 // Canvas</text>
    </g>

    <!-- Card 3: Molecular Structure Grid -->
    <g transform="translate(790, 0)">
      <rect width="270" height="230" rx="16" fill="url(#syn-card-bg)" stroke="#8B5CF6" stroke-opacity="0.3" stroke-width="1"/>
      <text x="20" y="32" font-family="monospace" font-size="10" fill="#A78BFA" letter-spacing="1">CRYSTALLOGRAPHY SYMBOLS</text>

      <g transform="translate(25, 60)">
        <polygon points="40,10 70,27 70,62 40,79 10,62 10,27" fill="#1A1230" stroke="#C084FC" stroke-width="1.5"/>
        <circle cx="40" cy="45" r="8" fill="#E879F9"/>

        <polygon points="170,10 200,27 200,62 170,79 140,62 140,27" fill="#1A1230" stroke="#8B5CF6" stroke-width="1.5"/>
        <line x1="155" y1="27" x2="185" y2="62" stroke="#E879F9" stroke-width="2"/>
        <circle cx="170" cy="45" r="5" fill="#FFFFFF"/>

        <polygon points="40,105 70,122 70,157 40,174 10,157 10,122" fill="#1A1230" stroke="#8B5CF6" stroke-width="1.5"/>
        <circle cx="25" cy="140" r="4" fill="#C084FC"/>
        <circle cx="55" cy="140" r="4" fill="#C084FC"/>

        <polygon points="170,105 200,122 200,157 170,174 140,157 140,122" fill="#1A1230" stroke="#C084FC" stroke-width="1.5"/>
        <polygon points="170,120 185,130 185,150 170,160 155,150 155,130" fill="#E879F9" opacity="0.6"/>
      </g>
    </g>
  </g>
</svg>
`;

// 3. ATELIER HOUSE HOSPITALITY TYPEFACE
// Warm black / charcoal / muted brown, elegant cream typography, sophisticated serif type, luxury hotel identity, premium stationery, signage, typography specimen.
const atelierSvg = `
<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="at-warmth" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#C89D68" stop-opacity="0.12"/>
      <stop offset="40%" stop-color="#3D3025" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#120F0D" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="at-gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EAD7BA"/>
      <stop offset="50%" stop-color="#C89D68"/>
      <stop offset="100%" stop-color="#9E7648"/>
    </linearGradient>
    <linearGradient id="at-card-bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1E1915" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#15110E" stop-opacity="0.95"/>
    </linearGradient>
    <filter id="at-blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="30"/>
    </filter>
  </defs>

  <!-- Background Base (Rich Warm Espresso / Charcoal) -->
  <rect width="1200" height="800" fill="#120F0D"/>
  <circle cx="500" cy="380" r="500" fill="url(#at-warmth)"/>

  <!-- Top Agency Specimen Bar -->
  <g opacity="0.6">
    <text x="70" y="65" font-family="Georgia, serif" font-size="11" font-weight="700" fill="#C89D68" letter-spacing="3">CASE STUDY // 03</text>
    <text x="210" y="65" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" fill="#8F8379" letter-spacing="1">CLIENT: ATELIER HOUSE HOSPITALITY</text>
    <text x="560" y="65" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" fill="#8F8379" letter-spacing="1">DISCIPLINE: BESPOKE OPTICAL VARIABLE FONT FAMILY</text>
    <text x="1050" y="65" font-family="Georgia, serif" font-size="11" fill="#C89D68" font-style="italic" text-anchor="end">6-WEIGHT SPECIMEN</text>
    <line x1="70" y1="85" x2="1130" y2="85" stroke="#C89D68" stroke-opacity="0.2" stroke-width="1"/>
  </g>

  <!-- Hero Typography Presentation Area -->
  <g transform="translate(80, 140)">
    <!-- Monogram Seal & Crest -->
    <g transform="translate(160, 150)">
      <circle cx="0" cy="0" r="100" fill="#1C1612" stroke="#C89D68" stroke-width="1.5" stroke-opacity="0.5"/>
      <circle cx="0" cy="0" r="92" fill="none" stroke="#C89D68" stroke-width="0.75" stroke-dasharray="3 3" stroke-opacity="0.4"/>
      
      <!-- Interlocked AH Monogram in Luxurious Serif -->
      <text x="-4" y="24" font-family="Georgia, 'Times New Roman', serif" font-size="76" font-weight="400" fill="url(#at-gold)" text-anchor="middle" letter-spacing="-4">AH</text>
      <text x="0" y="64" font-family="Georgia, serif" font-size="8" fill="#C89D68" letter-spacing="4" text-anchor="middle">MILANO • PARIS</text>
    </g>

    <!-- Headline Wordmark in Editorial Display Serif -->
    <text x="340" y="110" font-family="Georgia, 'Times New Roman', serif" font-size="62" font-weight="400" fill="#F4EFEA" letter-spacing="1">Atelier House</text>
    <text x="340" y="150" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#C89D68" letter-spacing="5">PROPRIETARY VARIABLE SERIF TYPEFACE</text>
    
    <text x="340" y="188" font-family="Georgia, serif" font-size="14" font-style="italic" fill="#D4C8BC" width="460">
      “Conceived as an architectural ligature between heritage Mediterranean stonework
    </text>
    <text x="340" y="210" font-family="Georgia, serif" font-size="14" font-style="italic" fill="#D4C8BC">
      and modern Parisian hospitality, scaled optically from 6pt menus to 12-foot facade bronze.”
    </text>

    <!-- Specimen Badges -->
    <g transform="translate(340, 245)">
      <rect x="0" y="0" width="130" height="34" rx="8" fill="#241E19" stroke="#C89D68" stroke-width="1" stroke-opacity="0.3"/>
      <text x="14" y="21" font-family="Georgia, serif" font-size="11" fill="#F4EFEA">Light to Black 600</text>

      <rect x="142" y="0" width="150" height="34" rx="8" fill="#241E19" stroke="#C89D68" stroke-width="1" stroke-opacity="0.3"/>
      <text x="156" y="21" font-family="Georgia, serif" font-size="11" fill="#C89D68">180+ Ligatures</text>

      <rect x="304" y="0" width="150" height="34" rx="8" fill="#241E19" stroke="#C89D68" stroke-width="1" stroke-opacity="0.3"/>
      <text x="318" y="21" font-family="Georgia, serif" font-size="11" fill="#F4EFEA">Optical Sizing</text>
    </g>
  </g>

  <!-- Lower Cards: Physical Collateral & Specimen Sheets -->
  <g transform="translate(70, 480)">
    <!-- Card 1: Debossed Linen Menu & Hotel Stationery Mockup -->
    <g transform="translate(0, 0)">
      <rect width="480" height="230" rx="16" fill="url(#at-card-bg)" stroke="#C89D68" stroke-opacity="0.25" stroke-width="1"/>
      <circle cx="28" cy="28" r="4" fill="#C89D68"/>
      <text x="44" y="32" font-family="Georgia, serif" font-size="11" fill="#C89D68" letter-spacing="1">PHYSICAL STATIONERY // BLIND-EMBOSSED LINEN</text>
      <line x1="16" y1="48" x2="464" y2="48" stroke="#C89D68" stroke-opacity="0.15" stroke-width="1"/>

      <!-- Menu Card Layout Inside Mockup -->
      <g transform="translate(30, 68)">
        <rect x="0" y="0" width="420" height="135" rx="10" fill="#F7F3E9" stroke="#E6DCCF" stroke-width="1"/>
        
        <!-- Embossed Gold Header on Paper -->
        <text x="210" y="34" font-family="Georgia, serif" font-size="18" font-weight="700" fill="#2E241B" text-anchor="middle" letter-spacing="2">LA RÉSERVE</text>
        <text x="210" y="48" font-family="Georgia, serif" font-size="8" font-style="italic" fill="#8C7A68" text-anchor="middle">ATELIER HOUSE • CÔTE D'AZUR</text>
        <line x1="130" y1="56" x2="290" y2="56" stroke="#D1C2AF" stroke-width="0.75"/>

        <!-- Menu items in high-end serif -->
        <g transform="translate(30, 75)">
          <text x="0" y="14" font-family="Georgia, serif" font-size="11" fill="#2E241B">Fleur de Courgette Farcie aux Truffes d'Été</text>
          <text x="360" y="14" font-family="Georgia, serif" font-size="11" font-weight="600" fill="#2E241B" text-anchor="end">48 €</text>

          <text x="0" y="36" font-family="Georgia, serif" font-size="11" fill="#2E241B">Turbot Sauvage Rôti à la Sauge et Agrumes</text>
          <text x="360" y="36" font-family="Georgia, serif" font-size="11" font-weight="600" fill="#2E241B" text-anchor="end">82 €</text>
        </g>
      </g>
    </g>

    <!-- Card 2: Font Glyphs Specimen Sheet -->
    <g transform="translate(506, 0)">
      <rect width="260" height="230" rx="16" fill="url(#at-card-bg)" stroke="#C89D68" stroke-opacity="0.25" stroke-width="1"/>
      <text x="20" y="32" font-family="Georgia, serif" font-size="11" fill="#C89D68" letter-spacing="1">GLYPH SPECIMEN // DISPLAY</text>

      <g transform="translate(20, 56)">
        <text x="0" y="32" font-family="Georgia, serif" font-size="34" fill="#F4EFEA" letter-spacing="4">Aa Bb Cc</text>
        <text x="0" y="74" font-family="Georgia, serif" font-size="34" font-style="italic" fill="#C89D68" letter-spacing="4">Dd Ee Ff</text>
        <text x="0" y="116" font-family="Georgia, serif" font-size="34" font-weight="700" fill="#F4EFEA" letter-spacing="4">Gg Hh Ii</text>
        <text x="0" y="152" font-family="Georgia, serif" font-size="14" fill="#8F8379" letter-spacing="2">&amp; Q W X Z 1 2 3 4 5</text>
      </g>
    </g>

    <!-- Card 3: Cast Bronze Architectural Signage Mockup -->
    <g transform="translate(790, 0)">
      <rect width="270" height="230" rx="16" fill="url(#at-card-bg)" stroke="#C89D68" stroke-opacity="0.25" stroke-width="1"/>
      <text x="20" y="32" font-family="Georgia, serif" font-size="11" fill="#C89D68" letter-spacing="1">CAST BRONZE FACADE PLAQUE</text>

      <g transform="translate(25, 58)">
        <!-- Plaque Plate -->
        <rect x="0" y="0" width="220" height="145" rx="8" fill="#2E251C" stroke="#C89D68" stroke-width="2"/>
        <circle cx="12" cy="12" r="3" fill="#C89D68"/>
        <circle cx="208" cy="12" r="3" fill="#C89D68"/>
        <circle cx="12" cy="133" r="3" fill="#C89D68"/>
        <circle cx="208" cy="133" r="3" fill="#C89D68"/>

        <!-- Engraved Typography -->
        <text x="110" y="55" font-family="Georgia, serif" font-size="16" font-weight="700" fill="url(#at-gold)" text-anchor="middle" letter-spacing="3">SUITE ROYALE</text>
        <text x="110" y="78" font-family="Georgia, serif" font-size="28" font-weight="400" fill="#FFFFFF" text-anchor="middle">N° 402</text>
        <line x1="60" y1="92" x2="160" y2="92" stroke="#C89D68" stroke-width="1" stroke-opacity="0.4"/>
        <text x="110" y="112" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="8" fill="#8F8379" text-anchor="middle" letter-spacing="2">PRIVATE SANCTUARY</text>
      </g>
    </g>
  </g>
</svg>
`;

async function buildCaseStudies() {
  console.log('Generating high-res case study visuals...');
  
  await sharp(Buffer.from(northstarSvg))
    .jpeg({ quality: 92, progressive: true })
    .toFile(path.join(outputDir, 'northstar-cloud.jpg'));
  console.log('✓ Created northstar-cloud.jpg');

  await sharp(Buffer.from(synthetixSvg))
    .jpeg({ quality: 92, progressive: true })
    .toFile(path.join(outputDir, 'synthetix-bio.jpg'));
  console.log('✓ Created synthetix-bio.jpg');

  await sharp(Buffer.from(atelierSvg))
    .jpeg({ quality: 92, progressive: true })
    .toFile(path.join(outputDir, 'atelier-house.jpg'));
  console.log('✓ Created atelier-house.jpg');

  console.log('All 3 case studies rendered successfully!');
}

buildCaseStudies().catch(err => {
  console.error(err);
  process.exit(1);
});
