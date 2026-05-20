import React from 'react';
import BrandLogo from './BrandLogo';

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
      <path d="M19 45C19 31.7 28.3 24 42 24H46" stroke="#FACC15" strokeWidth="4.4" strokeLinecap="round" />
      <path d="M35 14L47 24L35 34" stroke="#FACC15" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ShareStory({ team, formation, positions, lineup, matchLabel, matchDateLabel }) {
  const fieldCardWidth = 860;
  const fieldCardHeight = 840;
  const pitchWidth = 470;

  return (
    <div style={{ width: 1080, height: 1920 }} className="relative overflow-hidden bg-[#03123d] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#04144a_0%,#03123d_55%,#021033_100%)]" />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(115deg,transparent_0px,transparent_24px,rgba(255,255,255,0.08)_25px,transparent_26px,transparent_80px)] opacity-[0.18]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_30%),radial-gradient(circle_at_bottom,rgba(250,204,21,0.03),transparent_32%)]" />

      <div className="absolute left-[74px] top-[44px] h-[270px] w-[4px] rotate-[33deg] rounded-full bg-yellow-400/70" />
      <div className="absolute right-[-124px] top-[356px] h-[152px] w-[286px] rounded-tl-[168px] border-l-[24px] border-t-[24px] border-yellow-400/55" />
      <div className="absolute left-[-112px] bottom-[-18px] h-[210px] w-[270px] rounded-tr-[180px] border-r-[26px] border-t-[26px] border-yellow-400/55" />
      <div className="absolute right-[-24px] bottom-[-36px] h-[270px] w-[230px] rounded-tl-[220px] border-l-[5px] border-t-[5px] border-yellow-400/85" />

      <DotGrid className="absolute right-[90px] top-[72px]" />
      <DotGrid className="absolute right-[78px] bottom-[104px]" />
      <AccentSlashes className="absolute left-1/2 top-[34px] -translate-x-1/2 scale-90" />
      <AccentSlashes className="absolute left-[112px] bottom-[280px] scale-90" />
      <AccentSlashes className="absolute right-[112px] bottom-[280px] scale-90" />

      <div className="relative z-10 px-16 pt-[72px] text-center">
        <div className="mx-auto inline-flex items-center rounded-full bg-yellow-400 px-6 py-2 text-[20px] font-black uppercase tracking-[0.28em] text-slate-950">
          {team?.name || 'Selecao'}
        </div>
        <h1 className="mx-auto mt-8 max-w-[980px] text-[78px] font-black leading-[0.96] tracking-tight text-white">
          Minha escalacao no
          <span className="mt-2 block text-[88px] text-yellow-400">Escale Sua Selecao</span>
        </h1>
        <div className="mx-auto mt-8 h-[7px] w-[320px] rounded-full bg-yellow-400 shadow-[0_0_24px_rgba(250,204,21,0.5)]" />
      </div>

      <div className="relative z-10 mx-auto mt-9 flex w-[860px] items-center justify-between rounded-[32px] border border-white/10 bg-white/5 px-8 py-7">
        <div>
          <div className="text-[18px] font-black uppercase tracking-[0.2em] text-yellow-300">Jogo selecionado</div>
          <div className="mt-3 text-[38px] font-black leading-tight">{matchLabel}</div>
        </div>
        <div className="max-w-[280px] text-right">
          <div className="text-[18px] font-black uppercase tracking-[0.2em] text-yellow-300">Data</div>
          <div className="mt-3 text-[24px] font-bold leading-tight text-slate-100">{matchDateLabel}</div>
          <div className="mt-3 text-[18px] font-bold text-slate-300">Esquema {formation}</div>
        </div>
      </div>

      <div
        className="relative z-10 border-2 border-yellow-400 bg-[linear-gradient(180deg,rgba(6,18,61,0.98),rgba(4,14,47,0.98))] shadow-[0_0_38px_rgba(250,204,21,0.3)]"
        style={{
          width: fieldCardWidth,
          height: fieldCardHeight,
          marginTop: 32,
          marginLeft: 110,
          marginRight: 110,
          borderRadius: 44,
          padding: 30,
        }}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[32px] font-black leading-none">Campo</h2>
            <p className="mt-3 text-[15px] text-slate-300">Time montado no esquema {formation} para este confronto.</p>
          </div>
          <div className="rounded-full bg-[#081942] px-5 py-3 text-[14px] font-bold text-slate-100">Escalacao pronta para compartilhar</div>
        </div>

        <div className="flex items-center justify-center rounded-[34px] border border-white/8 bg-[#02113a]/65 px-8 py-6" style={{ height: 684 }}>
          <div style={{ width: pitchWidth }}>
            <div className="relative aspect-[10/14] overflow-hidden rounded-[34px] border-4 border-white/85 bg-emerald-700 shadow-[inset_0_12px_36px_rgba(255,255,255,0.08)]">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.07)_50%,transparent_50%)] bg-[length:60px_60px]" />
              <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 bg-white/85" />
              <div className="absolute left-1/2 top-1/2 h-[120px] w-[120px] -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white/85" />
              <div className="absolute left-1/2 top-0 h-[100px] w-56 -translate-x-1/2 rounded-b-[30px] border-x-4 border-b-4 border-white/85" />
              <div className="absolute bottom-0 left-1/2 h-[100px] w-56 -translate-x-1/2 rounded-t-[30px] border-x-4 border-t-4 border-white/85" />

              {positions.map((position) => {
                const player = lineup[position.id];
                return (
                  <div
                    key={position.id}
                    className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-[18px] border-[2px] border-yellow-400 bg-[#04103b] px-3 py-[10px] text-center shadow-[0_14px_26px_rgba(2,6,23,0.35)]"
                    style={{ left: `${position.x}%`, top: `${position.y}%`, minWidth: 96 }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 text-[17px] font-black text-slate-950">
                      {player ? initials(player) : position.label}
                    </div>
                    <div className="max-w-[88px] truncate text-[11px] font-black text-white">{player || position.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-[34px] flex w-[720px] items-center gap-7 rounded-[36px] bg-yellow-400 px-8 py-6 text-slate-950 shadow-[0_0_28px_rgba(250,204,21,0.38)]">
        <div className="flex h-[92px] w-[92px] items-center justify-center rounded-full bg-[#03123d] shadow-inner">
          <ShareArrowIcon />
        </div>
        <p className="text-[40px] font-black leading-[1.02]">
          Faca a sua tambem
          <span className="block">e compartilhe.</span>
        </p>
      </div>

      <div className="relative z-10 mt-[34px] flex items-center justify-center">
        <BrandLogo size={82} />
      </div>
    </div>
  );
}
