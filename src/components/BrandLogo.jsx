import React from 'react';

export function LogoMark({ size = 82 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 82 82" fill="none" aria-hidden="true">
      <circle cx="41" cy="41" r="35" fill="#FACC15" />
      <path
        d="M26.5 27.5L34 22.5H48L55.5 27.5L63 37.5L55.5 44L52.5 61H29.5L26.5 44L19 37.5L26.5 27.5Z"
        fill="#051136"
        stroke="#051136"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M34.8 23.2C36 26.4 38 28.1 41 28.1C44 28.1 46 26.4 47.2 23.2"
        stroke="#FACC15"
        strokeWidth="2.7"
        strokeLinecap="round"
      />
      <path
        d="M41 34L43.15 38.35L47.95 39.05L44.48 42.43L45.3 47.2L41 44.94L36.7 47.2L37.52 42.43L34.05 39.05L38.85 38.35L41 34Z"
        fill="#FACC15"
      />
    </svg>
  );
}

export default function BrandLogo({ size = 82, textClassName = 'text-[34px] font-black tracking-tight text-white' }) {
  return (
    <div className="flex items-center justify-center gap-5">
      <LogoMark size={size} />
      <div className={textClassName}>
        Escale <span className="text-yellow-400">Sua</span> {'Sele\u00e7\u00e3o'}
      </div>
    </div>
  );
}
