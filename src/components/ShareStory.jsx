import React from 'react';

function initials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function AccentSlashes({ className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="block h-2 w-10 -skew-x-[35deg] rounded-full bg-yellow-400" />
      <span className="block h-2 w-10 -skew-x-[35deg] rounded-full bg-yellow-400" />
      <span className="block h-2 w-10 -skew-x-[35deg] rounded-full bg-yellow-400" />
    </div>
  );
}

function DotGrid({ className = '' }) {
  return (
    <div className={`grid grid-cols-6 gap-3 ${className}`}>
      {Array.from({ length: 24 }).map((_, index) => (
        <span key={index} className="h-1.5 w-1.5 rounded-full bg-yellow-300/85" />
      ))}
    </div>
  );
}

function ShareArrowIcon() {
  return (
    <svg width="58" height="58" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path
        d="M19 45C19 31.7 28.3 24 42 24H46"
        stroke="#FACC15"
        strokeWidth="4.4"
        strokeLinecap="round"
      />
      <path
        d="M35 14L47 24L35 34"
        stroke="#FACC15"
        strokeWidth="4.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LogoMark() {
  return (
    <svg width="82" height="82" viewBox="0 0 82 82" fill="none" aria-hidden="true">
      <circle cx="41" cy="41" r="35" fill="#FACC15" />
      <path
        d="M23 28.5L31 23H51L59 28.5L54.5 59H27.5L23 28.5Z"
        fill="#051136"
        stroke="#051136"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M33 24.5C33.8 27.2 36.8 29 41 29C45.2 29 48.2 27.2 49 24.5" stroke="#FACC15" strokeWidth="2.4" strokeLinecap="round" />
      <path
        d="M41 34L42.9 37.9L47.2 38.5L44.1 41.5L44.9 45.8L41 43.8L37.1 45.8L37.9 41.5L34.8 38.5L39.1 37.9L41 34Z"
        fill="#FACC15"
      />
    </svg>
  );
}

export default function ShareStory({ formation, positions, lineup }) {
  return (
    <div style={{ width: 1080, height: 1920 }} className="relative overflow-hidden bg-[#03123d] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#04144a_0%,#03123d_55%,#021033_100%)]" />
      <div className="absolute inset-0 opacity-[0.18] bg-[repeating-linear-gradient(115deg,transparent_0px,transparent_24px,rgba(255,255,255,0.08)_25px,transparent_26px,transparent_80px)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_30%),radial-gradient(circle_at_bottom,rgba(250,204,21,0.03),transparent_32%)]" />

      <div className="absolute left-[74px] top-[44px] h-[270px] w-[4px] rotate-[33deg] rounded-full bg-yellow-400/70" />
      <div className="absolute right-[-120px] top-[318px] h-[178px] w-[330px] rounded-tl-[180px] border-l-[28px] border-t-[28px] border-yellow-400/55" />
      <div className="absolute left-[-112px] bottom-[-18px] h-[210px] w-[270px] rounded-tr-[180px] border-r-[26px] border-t-[26px] border-yellow-400/55" />
      <div className="absolute right-[-24px] bottom-[-36px] h-[270px] w-[230px] rounded-tl-[220px] border-l-[5px] border-t-[5px] border-yellow-400/85" />

      <DotGrid className="absolute right-[90px] top-[72px]" />
      <DotGrid className="absolute right-[78px] bottom-[104px]" />
      <AccentSlashes className="absolute left-1/2 top-[34px] -translate-x-1/2 scale-90" />
      <AccentSlashes className="absolute left-[112px] bottom-[280px] scale-90" />
      <AccentSlashes className="absolute right-[112px] bottom-[280px] scale-90" />

      <div className="relative z-10 px-16 pt-[82px] text-center">
        <h1 className="mx-auto max-w-[980px] text-[84px] font-black leading-[0.96] tracking-tight text-white">
          Minha escalação no
          <span className="mt-2 block text-[92px] text-yellow-400">Escale Sua Seleção</span>
          <span className="mt-2 block">é essa:</span>
        </h1>
        <div className="mx-auto mt-8 h-[7px] w-[320px] rounded-full bg-yellow-400 shadow-[0_0_24px_rgba(250,204,21,0.5)]" />
      </div>

      <div
        className="relative z-10 border-2 border-yellow-400 bg-[linear-gradient(180deg,rgba(6,18,61,0.98),rgba(4,14,47,0.98))] shadow-[0_0_38px_rgba(250,204,21,0.3)]"
        style={{ width: 860, height: 1030, marginTop: 40, marginLeft: 110, marginRight: 110, borderRadius: 44, padding: 28 }}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[32px] font-black leading-none">Campo</h2>
            <p className="mt-3 text-[15px] text-slate-300">Monte seu time ideal no esquema {formation}.</p>
          </div>
          <div className="rounded-full bg-[#081942] px-5 py-3 text-[14px] font-bold text-slate-100">
            Clique na posição para colocar o jogador
          </div>
        </div>

        <div className="flex h-[900px] items-center justify-center">
          <div style={{ width: 680 }}>
            <div className="relative aspect-[10/14] overflow-hidden rounded-[36px] border-4 border-white/85 bg-emerald-700 shadow-inner">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.07)_50%,transparent_50%)] bg-[length:78px_78px]" />
              <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 bg-white/85" />
              <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white/85" />
              <div className="absolute left-1/2 top-0 h-[120px] w-64 -translate-x-1/2 rounded-b-3xl border-x-4 border-b-4 border-white/85" />
              <div className="absolute bottom-0 left-1/2 h-[120px] w-64 -translate-x-1/2 rounded-t-3xl border-x-4 border-t-4 border-white/85" />

              {positions.map((position) => {
                const player = lineup[position.id];
                return (
                  <div
                    key={position.id}
                    className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-[20px] border-[2px] border-yellow-400 bg-[#04103b] px-3 py-3 text-center shadow-lg shadow-black/35"
                    style={{ left: `${position.x}%`, top: `${position.y}%`, minWidth: 126 }}
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-400 text-[22px] font-black text-slate-950">
                      {player ? initials(player) : position.label}
                    </div>
                    <div className="max-w-[114px] truncate text-[13px] font-black text-white">
                      {player || position.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-[44px] flex w-[742px] items-center gap-8 rounded-[38px] bg-yellow-400 px-9 py-7 text-slate-950 shadow-[0_0_28px_rgba(250,204,21,0.38)]">
        <div className="flex h-[96px] w-[96px] items-center justify-center rounded-full bg-[#03123d] shadow-inner">
          <ShareArrowIcon />
        </div>
        <p className="text-[44px] font-black leading-[1.02]">
          Faça a sua também
          <span className="block">e compartilhe.</span>
        </p>
      </div>

      <div className="relative z-10 mt-[44px] flex items-center justify-center gap-5">
        <LogoMark />
        <div className="text-[34px] font-black tracking-tight text-white">
          Escale <span className="text-yellow-400">Sua</span> Seleção
        </div>
      </div>
    </div>
  );
}
