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
  const pitchWidth = 650;

  return (
    <div style={{ width: 1080, height: 1920 }} className="relative overflow-hidden bg-[#03123d] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#04144a_0%,#03123d_55%,#021033_100%)]" />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(115deg,transparent_0px,transparent_24px,rgba(255,255,255,0.08)_25px,transparent_26px,transparent_80px)] opacity-[0.18]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_30%),radial-gradient(circle_at_bottom,rgba(250,204,21,0.03),transparent_32%)]" />

      <div className="absolute left-[74px] top-[44px] h-[270px] w-[4px] rotate-[33deg] rounded-full bg-yellow-400/70" />
      <div className="absolute right-[-138px] top-[330px] h-[150px] w-[270px] rounded-tl-[168px] border-l-[24px] border-t-[24px] border-yellow-400/55" />
      <div className="absolute left-[-112px] bottom-[-18px] h-[210px] w-[270px] rounded-tr-[180px] border-r-[26px] border-t-[26px] border-yellow-400/55" />
      <div className="absolute right-[-24px] bottom-[-36px] h-[270px] w-[230px] rounded-tl-[220px] border-l-[5px] border-t-[5px] border-yellow-400/85" />

      <DotGrid className="absolute right-[90px] top-[72px]" />
      <DotGrid className="absolute right-[78px] bottom-[104px]" />
      <AccentSlashes className="absolute left-1/2 top-[34px] -translate-x-1/2 scale-90" />
      <AccentSlashes className="absolute left-[112px] bottom-[280px] scale-90" />
      <AccentSlashes className="absolute right-[112px] bottom-[280px] scale-90" />

      <div className="relative z-10 px-16 pt-[128px] text-center">
        <div className="mx-auto inline-flex items-center rounded-full bg-yellow-400 px-6 py-2 text-[20px] font-black uppercase tracking-[0.28em] text-slate-950">
          {team?.name || 'Sele\u00e7\u00e3o'}
        </div>
        <h1 className="mx-auto mt-8 max-w-[900px] text-[66px] font-black leading-[0.94] tracking-tight text-white">
          {'Minha escala\u00e7\u00e3o no'}
          <span className="mt-2 block text-[80px] text-yellow-400">{'Escale Sua Sele\u00e7\u00e3o'}</span>
        </h1>
        <div className="mx-auto mt-7 h-[7px] w-[290px] rounded-full bg-yellow-400 shadow-[0_0_24px_rgba(250,204,21,0.5)]" />
      </div>

      <div className="relative z-10 mx-auto mt-8 flex w-[820px] items-center justify-between rounded-[30px] border border-white/10 bg-white/5 px-8 py-6">
        <div>
          <div className="text-[18px] font-black uppercase tracking-[0.2em] text-yellow-300">Jogo selecionado</div>
          <div className="mt-3 text-[34px] font-black leading-tight">{matchLabel}</div>
        </div>
        <div className="max-w-[250px] text-right">
          <div className="text-[18px] font-black uppercase tracking-[0.2em] text-yellow-300">Data</div>
          <div className="mt-3 text-[22px] font-bold leading-tight text-slate-100">{matchDateLabel}</div>
          <div className="mt-3 text-[17px] font-bold text-slate-300">Esquema {formation}</div>
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-5 flex justify-center">
        <div style={{ width: pitchWidth }}>
          <div className="relative aspect-[10/14] overflow-hidden rounded-[38px] border-4 border-white/85 bg-emerald-700 shadow-[0_24px_44px_rgba(2,6,23,0.34),inset_0_12px_36px_rgba(255,255,255,0.08)]">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.07)_50%,transparent_50%)] bg-[length:74px_74px]" />
            <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 bg-white/85" />
            <div className="absolute left-1/2 top-1/2 h-[148px] w-[148px] -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white/85" />
            <div className="absolute left-1/2 top-0 h-[128px] w-[274px] -translate-x-1/2 rounded-b-[34px] border-x-4 border-b-4 border-white/85" />
            <div className="absolute bottom-0 left-1/2 h-[128px] w-[274px] -translate-x-1/2 rounded-t-[34px] border-x-4 border-t-4 border-white/85" />

            {positions.map((position) => {
              const player = lineup[position.id];
              return (
                <div
                  key={position.id}
                  className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-[20px] border-[2px] border-yellow-400 bg-[#04103b] px-3 py-[11px] text-center shadow-[0_16px_28px_rgba(2,6,23,0.35)]"
                  style={{ left: `${position.x}%`, top: `${position.y}%`, minWidth: 124 }}
                >
                  <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-yellow-400 text-[20px] font-black text-slate-950">
                    {player ? initials(player) : position.label}
                  </div>
                  <div className="max-w-[112px] truncate text-[14px] font-black text-white">{player || position.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-[42px] z-10 flex flex-col items-center">
        <div className="flex w-[700px] items-center gap-6 rounded-[34px] bg-yellow-400 px-8 py-6 text-slate-950 shadow-[0_0_28px_rgba(250,204,21,0.38)]">
          <div className="flex h-[84px] w-[84px] items-center justify-center rounded-full bg-[#03123d] shadow-inner">
            <ShareArrowIcon />
          </div>
          <p className="text-[38px] font-black leading-[1.02]">
            {'Fa\u00e7a a sua tamb\u00e9m'}
            <span className="block">e compartilhe.</span>
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center">
          <BrandLogo size={70} textClassName="text-[28px] font-black tracking-tight text-white" />
          <div className="mt-4 text-[18px] font-bold tracking-[0.12em] text-slate-300">www.EscaleSuaSelecao.com.br</div>
        </div>
      </div>
    </div>
  );
}
