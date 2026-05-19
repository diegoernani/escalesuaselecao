import React from 'react';

function initials(name) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

export default function ShareStory({ formation, positions, lineup }) {
  return (
    <div
      style={{ width: 1080, height: 1920 }}
      className="relative overflow-hidden bg-slate-950 px-20 py-20 text-white"
    >
      <div className="absolute -left-24 -top-16 h-80 w-80 rounded-full bg-yellow-400/20 blur-3xl" />
      <div className="absolute -right-28 top-28 h-96 w-96 rounded-full bg-yellow-400/20 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-yellow-400/10 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.15),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.06)_0,transparent_35%)]" />

      <div className="relative z-10 text-center">
        <div className="mx-auto mb-6 h-2 w-28 rounded-full bg-yellow-400" />
        <h1 className="text-6xl font-black leading-tight tracking-tight">
          Minha escalação no
          <span className="block text-7xl text-yellow-400">Escale Sua Seleção</span>
          é essa:
        </h1>
      </div>

      <div className="relative z-10 mx-auto mt-16 rounded-[48px] border-4 border-yellow-400/80 bg-slate-900/95 p-10 shadow-2xl shadow-yellow-400/20">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-black">Campo</h2>
            <p className="mt-2 text-2xl text-slate-300">Minha formação {formation}</p>
          </div>
          <div className="rounded-full bg-yellow-400 px-6 py-3 text-2xl font-black text-slate-950">
            {formation}
          </div>
        </div>

        <div className="relative mx-auto aspect-[10/14] w-[760px] overflow-hidden rounded-[42px] border-4 border-white/85 bg-emerald-700 shadow-inner">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.07)_50%,transparent_50%)] bg-[length:80px_80px]" />
          <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 bg-white/85" />
          <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white/85" />
          <div className="absolute left-1/2 top-0 h-36 w-72 -translate-x-1/2 rounded-b-3xl border-x-4 border-b-4 border-white/85" />
          <div className="absolute bottom-0 left-1/2 h-36 w-72 -translate-x-1/2 rounded-t-3xl border-x-4 border-t-4 border-white/85" />

          {positions.map((position) => {
            const player = lineup[position.id];
            return (
              <div
                key={position.id}
                className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 rounded-3xl border-2 border-yellow-400 bg-slate-950 px-4 py-4 text-center shadow-xl"
                style={{ left: `${position.x}%`, top: `${position.y}%`, minWidth: 132 }}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 text-2xl font-black text-slate-950">
                  {player ? initials(player) : position.label}
                </div>
                <div className="max-w-32 truncate text-xl font-black text-white">
                  {player || position.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-14 flex max-w-[760px] items-center gap-8 rounded-[44px] bg-yellow-400 p-8 text-slate-950 shadow-2xl shadow-yellow-400/30">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-950 text-5xl text-yellow-400">
          ↗
        </div>
        <p className="text-left text-5xl font-black leading-tight">
          Faça a sua também
          <span className="block">e compartilhe.</span>
        </p>
      </div>

      <div className="relative z-10 mt-12 flex items-center justify-center gap-4 text-4xl font-black">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 text-slate-950">★</div>
        <span>Escale <span className="text-yellow-400">Sua</span> Seleção</span>
      </div>
    </div>
  );
}
