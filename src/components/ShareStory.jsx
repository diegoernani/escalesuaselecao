import React from 'react';

function initials(name) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function MiniStripes({ className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="block h-2 w-8 -skew-x-[32deg] rounded-full bg-yellow-400" />
      <span className="block h-2 w-8 -skew-x-[32deg] rounded-full bg-yellow-400" />
      <span className="block h-2 w-8 -skew-x-[32deg] rounded-full bg-yellow-400" />
    </div>
  );
}

function Dots({ className = '' }) {
  return (
    <div className={`grid grid-cols-6 gap-3 opacity-70 ${className}`}>
      {Array.from({ length: 24 }).map((_, index) => (
        <span key={index} className="h-1.5 w-1.5 rounded-full bg-yellow-300" />
      ))}
    </div>
  );
}

function BrandMark() {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-400/30">
      <div className="relative h-8 w-8 rounded-[10px] border-[3px] border-slate-950">
        <div className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-[52%] rounded-full border-[3px] border-slate-950" />
        <div className="absolute left-1/2 top-1/2 h-0.5 w-6 -translate-x-1/2 -translate-y-1/2 bg-slate-950" />
      </div>
    </div>
  );
}

export default function ShareStory({ formation, positions, lineup }) {
  return (
    <div style={{ width: 1080, height: 1920 }} className="relative overflow-hidden bg-[#03123d] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(7,31,94,0.85),transparent_55%),linear-gradient(180deg,#04103b_0%,#020c2d_100%)]" />
      <div className="absolute inset-0 opacity-[0.16] bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.1)_8%,transparent_16%,transparent_32%,rgba(255,255,255,0.08)_39%,transparent_46%,transparent_64%,rgba(255,255,255,0.08)_72%,transparent_78%)] bg-[length:420px_420px]" />
      <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_bottom_left,rgba(250,204,21,0.08),transparent_24%),radial-gradient(circle_at_top_right,rgba(250,204,21,0.05),transparent_22%)]" />

      <div className="absolute -left-24 top-12 h-[520px] w-[240px] rotate-[22deg] border-r-4 border-yellow-400/40" />
      <div className="absolute right-[-150px] top-[330px] h-[220px] w-[520px] rounded-full border-[30px] border-yellow-400/50 border-l-0 border-b-0 opacity-80" />
      <div className="absolute -left-40 bottom-[-40px] h-[280px] w-[400px] rounded-full border-[28px] border-yellow-400/45 border-r-0 border-t-0 opacity-85" />
      <div className="absolute right-[-70px] bottom-[-70px] h-[290px] w-[280px] rounded-full border-l-4 border-t-4 border-yellow-400/75" />

      <Dots className="absolute right-16 top-16" />
      <Dots className="absolute bottom-20 right-10 scale-90" />
      <MiniStripes className="absolute left-1/2 top-14 -translate-x-1/2" />
      <MiniStripes className="absolute left-[120px] bottom-[315px]" />
      <MiniStripes className="absolute right-[120px] bottom-[315px]" />

      <div className="relative z-10 px-24 pt-28 text-center">
        <h1 className="mx-auto max-w-[900px] text-[78px] font-black leading-[0.95] tracking-tight text-white">
          Minha escalação no
          <span className="mt-3 block text-[92px] text-yellow-400">Escale Sua Seleção</span>
          <span className="mt-3 block">é essa:</span>
        </h1>
        <div className="mx-auto mt-8 h-2 w-72 rounded-full bg-yellow-400 shadow-[0_0_28px_rgba(250,204,21,0.55)]" />
      </div>

      <div className="relative z-10 mx-auto mt-12 w-[860px] rounded-[46px] border-2 border-yellow-400 bg-[linear-gradient(180deg,rgba(9,24,67,0.98),rgba(5,14,44,0.98))] p-8 shadow-[0_0_34px_rgba(250,204,21,0.34)]">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-[28px] font-black">Campo</h2>
            <p className="mt-1 text-[16px] text-slate-300">Monte seu time ideal no esquema {formation}.</p>
          </div>
          <div className="rounded-full bg-[#081942] px-6 py-3 text-[15px] font-bold text-slate-200">
            Clique na posição para colocar o jogador
          </div>
        </div>

        <div className="relative mx-auto aspect-[10/14] w-[650px] overflow-hidden rounded-[38px] border-4 border-white/85 bg-emerald-700 shadow-inner">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.06)_50%,transparent_50%)] bg-[length:78px_78px]" />
          <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 bg-white/85" />
          <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white/85" />
          <div className="absolute left-1/2 top-0 h-30 w-64 -translate-x-1/2 rounded-b-3xl border-x-4 border-b-4 border-white/85" />
          <div className="absolute bottom-0 left-1/2 h-30 w-64 -translate-x-1/2 rounded-t-3xl border-x-4 border-t-4 border-white/85" />

          {positions.map((position) => {
            const player = lineup[position.id];
            return (
              <div
                key={position.id}
                className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 rounded-[22px] border-[2px] border-yellow-400 bg-[#051136] px-3 py-3 text-center shadow-lg"
                style={{ left: `${position.x}%`, top: `${position.y}%`, minWidth: 130 }}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-400 text-xl font-black text-slate-950">
                  {player ? initials(player) : position.label}
                </div>
                <div className="max-w-[116px] truncate text-[13px] font-black text-white">
                  {player || position.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-12 flex w-[760px] items-center gap-8 rounded-[40px] bg-yellow-400 px-9 py-7 text-slate-950 shadow-[0_0_28px_rgba(250,204,21,0.38)]">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#04103b] text-yellow-400 shadow-inner">
          <span className="text-[62px] font-black leading-none">↗</span>
        </div>
        <p className="text-[42px] font-black leading-[1.02]">
          Faça a sua também
          <span className="block">e compartilhe.</span>
        </p>
      </div>

      <div className="relative z-10 mt-16 flex items-center justify-center gap-5">
        <BrandMark />
        <div className="text-[34px] font-black tracking-tight text-white">
          Escale <span className="text-yellow-400">Sua</span> Seleção
        </div>
      </div>
    </div>
  );
}
