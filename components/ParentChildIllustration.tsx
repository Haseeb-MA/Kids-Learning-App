export default function ParentChildIllustration() {
  return (
    <svg
      viewBox="0 0 480 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', maxWidth: '440px', display: 'block' }}
    >
      {/* Background circles */}
      <circle cx="240" cy="265" r="205" fill="#EEEDFE" />
      <circle cx="215" cy="235" r="135" fill="#CECBF6" fillOpacity="0.45" />

      {/* Decorative dots */}
      <circle cx="55"  cy="130" r="9"  fill="#7F77DD" fillOpacity="0.25" />
      <circle cx="422" cy="105" r="13" fill="#AFA9EC" fillOpacity="0.35" />
      <circle cx="44"  cy="362" r="6"  fill="#534AB7" fillOpacity="0.22" />
      <circle cx="438" cy="355" r="10" fill="#7F77DD" fillOpacity="0.2"  />
      <circle cx="398" cy="198" r="5"  fill="#534AB7" fillOpacity="0.3"  />

      {/* ── MOTHER (left, taller) ── */}
      {/* Hair */}
      <path d="M118 122 Q126 74 165 72 Q204 74 212 122" fill="#26215C" />
      {/* Head */}
      <circle cx="165" cy="128" r="44" fill="#7F77DD" />
      {/* Ears */}
      <circle cx="121" cy="135" r="7" fill="#6B63CC" />
      <circle cx="209" cy="135" r="7" fill="#6B63CC" />
      {/* Neck */}
      <rect x="152" y="170" width="26" height="20" rx="8" fill="#7F77DD" />
      {/* Body */}
      <rect x="117" y="188" width="96" height="96" rx="22" fill="#534AB7" />
      {/* Skirt */}
      <path d="M106 256 Q165 298 224 256 L234 400 L96 400 Z" fill="#7F77DD" />
      {/* Left arm */}
      <path d="M117 210 Q88 237 100 272" stroke="#534AB7" strokeWidth="24" strokeLinecap="round" />
      {/* Right arm reaching toward tablet */}
      <path d="M213 216 Q242 244 234 276" stroke="#534AB7" strokeWidth="24" strokeLinecap="round" />

      {/* ── CHILD (right, shorter) ── */}
      {/* Hair */}
      <path d="M278 180 Q286 152 316 150 Q346 152 354 180" fill="#534AB7" />
      {/* Head */}
      <circle cx="316" cy="186" r="34" fill="#AFA9EC" />
      {/* Neck */}
      <rect x="304" y="218" width="24" height="16" rx="6" fill="#AFA9EC" />
      {/* Body */}
      <rect x="282" y="232" width="68" height="78" rx="18" fill="#CECBF6" />
      {/* Left leg */}
      <rect x="285" y="304" width="24" height="72" rx="12" fill="#CECBF6" />
      {/* Right leg */}
      <rect x="323" y="304" width="24" height="72" rx="12" fill="#CECBF6" />
      {/* Shoes */}
      <ellipse cx="297" cy="377" rx="18" ry="10" fill="#7F77DD" />
      <ellipse cx="335" cy="377" rx="18" ry="10" fill="#7F77DD" />
      {/* Left arm toward tablet */}
      <path d="M282 252 Q258 267 263 292" stroke="#CECBF6" strokeWidth="22" strokeLinecap="round" />
      {/* Right arm */}
      <path d="M350 252 Q374 267 368 292" stroke="#CECBF6" strokeWidth="22" strokeLinecap="round" />

      {/* ── TABLET (shared between them) ── */}
      <rect x="214" y="260" width="86" height="64" rx="12" fill="#26215C" />
      <rect x="221" y="267" width="72" height="50" rx="8"  fill="#EEEDFE" />
      {/* Star icon on screen */}
      <circle cx="257" cy="281" r="9" fill="#CECBF6" />
      <text x="251" y="286" fontSize="11" fill="#7F77DD" fontFamily="system-ui">★</text>
      {/* Progress bar */}
      <rect x="229" y="297" width="54" height="5" rx="2.5" fill="#D3D1C7" />
      <rect x="229" y="297" width="38" height="5" rx="2.5" fill="#7F77DD" />
      {/* Text line */}
      <rect x="229" y="307" width="42" height="3" rx="1.5" fill="#AFA9EC" fillOpacity="0.5" />

      {/* ── FLOATING BADGES ── */}

      {/* Grade badge — top right */}
      <rect x="338" y="86" width="104" height="38" rx="19" fill="white" />
      <rect x="347" y="95" width="20" height="20" rx="5" fill="#EEEDFE" />
      <text x="351" y="110" fontSize="12" fill="#534AB7" fontFamily="system-ui">✦</text>
      <text x="373" y="110" fontSize="12" fill="#26215C" fontFamily="system-ui" fontWeight="600">Grade 4</text>

      {/* Score badge — left */}
      <rect x="44" y="296" width="100" height="38" rx="19" fill="white" />
      <text x="62" y="320" fontSize="13" fill="#085041" fontFamily="system-ui" fontWeight="600">★ 100%</text>

      {/* Badge earned — bottom right */}
      <rect x="342" y="300" width="104" height="38" rx="19" fill="white" />
      <text x="358" y="316" fontSize="11" fill="#412402" fontFamily="system-ui">★ </text>
      <text x="372" y="316" fontSize="12" fill="#412402" fontFamily="system-ui" fontWeight="600">Badge!</text>

    </svg>
  )
}
