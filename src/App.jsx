import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  LockKeyhole,
  LogIn,
  LogOut,
  MessageCircle,
  MousePointerClick,
  RotateCcw,
  Save,
  Share2,
  Trophy,
  Users,
} from 'lucide-react';

const players = {
  Goleiros: ['Alisson', 'Ederson', 'Weverton'],
  Defensores: [
    'Alex Sandro',
    'Bremer',
    'Danilo',
    'Douglas Santos',
    'Gabriel Magalhães',
    'Ibañez',
    'Léo Pereira',
    'Marquinhos',
    'Wesley',
  ],
  'Meio-campistas': ['Bruno Guimarães', 'Casemiro', 'Danilo S.', 'Fabinho', 'Lucas Paquetá'],
  Atacantes: [
    'Endrick',
    'Gabriel Martinelli',
    'Igor Thiago',
    'Luiz Henrique',
    'Matheus Cunha',
    'Neymar Jr.',
    'Raphinha',
    'Rayan',
    'Vini Jr.',
  ],
};

const formations = {
  '4-3-3': [
    { id: 'gk', label: 'GOL', x: 50, y: 91 },
    { id: 'lb', label: 'LE', x: 18, y: 72 },
    { id: 'cb1', label: 'ZAG', x: 39, y: 75 },
    { id: 'cb2', label: 'ZAG', x: 61, y: 75 },
    { id: 'rb', label: 'LD', x: 82, y: 72 },
    { id: 'cm1', label: 'MC', x: 30, y: 52 },
    { id: 'cdm', label: 'VOL', x: 50, y: 58 },
    { id: 'cm2', label: 'MC', x: 70, y: 52 },
    { id: 'lw', label: 'PE', x: 20, y: 27 },
    { id: 'st', label: 'ATA', x: 50, y: 20 },
    { id: 'rw', label: 'PD', x: 80, y: 27 },
  ],
  '4-5-1': [
    { id: 'gk', label: 'GOL', x: 50, y: 91 },
    { id: 'lb', label: 'LE', x: 18, y: 72 },
    { id: 'cb1', label: 'ZAG', x: 39, y: 75 },
    { id: 'cb2', label: 'ZAG', x: 61, y: 75 },
    { id: 'rb', label: 'LD', x: 82, y: 72 },
    { id: 'lm', label: 'ME', x: 16, y: 49 },
    { id: 'cm1', label: 'MC', x: 35, y: 52 },
    { id: 'cdm', label: 'VOL', x: 50, y: 58 },
    { id: 'cm2', label: 'MC', x: 65, y: 52 },
    { id: 'rm', label: 'MD', x: 84, y: 49 },
    { id: 'st', label: 'ATA', x: 50, y: 22 },
  ],
  '4-4-2': [
    { id: 'gk', label: 'GOL', x: 50, y: 91 },
    { id: 'lb', label: 'LE', x: 18, y: 72 },
    { id: 'cb1', label: 'ZAG', x: 39, y: 75 },
    { id: 'cb2', label: 'ZAG', x: 61, y: 75 },
    { id: 'rb', label: 'LD', x: 82, y: 72 },
    { id: 'lm', label: 'ME', x: 18, y: 50 },
    { id: 'cm1', label: 'MC', x: 41, y: 55 },
    { id: 'cm2', label: 'MC', x: 59, y: 55 },
    { id: 'rm', label: 'MD', x: 82, y: 50 },
    { id: 'st1', label: 'ATA', x: 40, y: 23 },
    { id: 'st2', label: 'ATA', x: 60, y: 23 },
  ],
  '3-5-2': [
    { id: 'gk', label: 'GOL', x: 50, y: 91 },
    { id: 'cb1', label: 'ZAG', x: 30, y: 73 },
    { id: 'cb2', label: 'ZAG', x: 50, y: 78 },
    { id: 'cb3', label: 'ZAG', x: 70, y: 73 },
    { id: 'lwb', label: 'ALA', x: 14, y: 50 },
    { id: 'cm1', label: 'MC', x: 35, y: 52 },
    { id: 'cdm', label: 'VOL', x: 50, y: 59 },
    { id: 'cm2', label: 'MC', x: 65, y: 52 },
    { id: 'rwb', label: 'ALA', x: 86, y: 50 },
    { id: 'st1', label: 'ATA', x: 40, y: 23 },
    { id: 'st2', label: 'ATA', x: 60, y: 23 },
  ],
};

const rankingMock = {
  formations: [
    { name: '4-3-3', votes: 1842 },
    { name: '4-4-2', votes: 938 },
    { name: '4-5-1', votes: 711 },
    { name: '3-5-2', votes: 524 },
  ],
  positions: {
    GOL: [
      { name: 'Alisson', votes: 1432 },
      { name: 'Ederson', votes: 881 },
      { name: 'Weverton', votes: 277 },
    ],
    LE: [
      { name: 'Alex Sandro', votes: 904 },
      { name: 'Douglas Santos', votes: 744 },
    ],
    ZAG: [
      { name: 'Marquinhos', votes: 1510 },
      { name: 'Gabriel Magalhães', votes: 1324 },
      { name: 'Bremer', votes: 993 },
    ],
    LD: [
      { name: 'Danilo', votes: 1138 },
      { name: 'Wesley', votes: 690 },
    ],
    VOL: [
      { name: 'Casemiro', votes: 1211 },
      { name: 'Bruno Guimarães', votes: 1048 },
      { name: 'Fabinho', votes: 812 },
    ],
    MC: [
      { name: 'Bruno Guimarães', votes: 1295 },
      { name: 'Lucas Paquetá', votes: 1167 },
      { name: 'Danilo S.', votes: 508 },
    ],
    PE: [
      { name: 'Vini Jr.', votes: 1710 },
      { name: 'Gabriel Martinelli', votes: 887 },
    ],
    ATA: [
      { name: 'Neymar Jr.', votes: 1520 },
      { name: 'Endrick', votes: 1403 },
      { name: 'Matheus Cunha', votes: 920 },
    ],
    PD: [
      { name: 'Raphinha', votes: 1299 },
      { name: 'Luiz Henrique', votes: 808 },
      { name: 'Rayan', votes: 477 },
    ],
  },
};

const categoryByPlayer = Object.fromEntries(
  Object.entries(players).flatMap(([category, names]) => names.map((name) => [name, category]))
);

function initials(name) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function formatVotes(votes) {
  return votes.toLocaleString('pt-BR');
}

function buildShareText(formation, positions, lineup) {
  const lines = positions.map((position) => `${position.label}: ${lineup[position.id] || 'Em aberto'}`);
  return [`Minha Seleção Oficial no esquema ${formation}:`, '', ...lines, '', 'Monte a sua também no Escale sua Seleção!'].join('\n');
}

async function copyTextSafely(text) {
  try {
    if (!navigator.clipboard?.writeText) return false;
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

async function shareOrCopy({ title, text, url }) {
  try {
    if (navigator.share) {
      await navigator.share({ title, text, url });
      return 'shared';
    }
  } catch {
    // Alguns navegadores bloqueiam navigator.share. Nesse caso, copiamos o texto.
  }
  return (await copyTextSafely(text)) ? 'copied' : 'manual';
}

function runSmokeTests() {
  const testPositions = formations['4-3-3'];
  const fullLineup = Object.fromEntries(testPositions.map((position, index) => [position.id, `Jogador ${index + 1}`]));
  console.assert(initials('Vini Jr.') === 'VJ', 'initials deve gerar VJ');
  console.assert(formatVotes(1842) === '1.842', 'formatVotes deve usar pt-BR');
  console.assert(testPositions.length === 11, '4-3-3 deve ter 11 posições');
  console.assert(buildShareText('4-3-3', testPositions, {}).includes('Em aberto'), 'deve indicar posições abertas');
  console.assert(buildShareText('4-3-3', testPositions, fullLineup).includes('Jogador 11'), 'deve incluir jogadores preenchidos');
}

if (typeof window !== 'undefined' && !window.__escaleSmokeTestsDone) {
  window.__escaleSmokeTestsDone = true;
  runSmokeTests();
}

export default function App() {
  const [page, setPage] = useState('escale');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [formation, setFormation] = useState('4-3-3');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [lineup, setLineup] = useState({});
  const [saved, setSaved] = useState(false);
  const [shareStatus, setShareStatus] = useState('');

  const positions = formations[formation];
  const selectedPlayers = useMemo(() => Object.values(lineup).filter(Boolean), [lineup]);
  const selectedPlayerSet = useMemo(() => new Set(selectedPlayers), [selectedPlayers]);
  const isComplete = selectedPlayers.length === 11;
  const shareText = useMemo(() => buildShareText(formation, positions, lineup), [formation, positions, lineup]);

  const availablePlayers = useMemo(
    () =>
      Object.entries(players).map(([category, names]) => ({
        category,
        names: names.filter((name) => !selectedPlayerSet.has(name)),
      })),
    [selectedPlayerSet]
  );

  function handlePositionClick(positionId) {
    if (!selectedPlayer) return;
    setLineup((current) => {
      const cleaned = Object.fromEntries(Object.entries(current).filter(([, player]) => player !== selectedPlayer));
      return { ...cleaned, [positionId]: selectedPlayer };
    });
    setSelectedPlayer(null);
    setSaved(false);
    setShareStatus('');
  }

  function removePlayer(positionId) {
    setLineup((current) => {
      const copy = { ...current };
      delete copy[positionId];
      return copy;
    });
    setSaved(false);
    setShareStatus('');
  }

  function changeFormation(nextFormation) {
    setFormation(nextFormation);
    setLineup({});
    setSelectedPlayer(null);
    setSaved(false);
    setShareStatus('');
  }

  function saveLineup() {
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }
    if (isComplete) setSaved(true);
  }

  function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
  }

  function shareFacebook() {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`,
      '_blank',
      'noopener,noreferrer'
    );
  }

  async function copyForInstagram() {
    const copied = await copyTextSafely(shareText);
    setShareStatus(copied ? 'Texto copiado para colar no Instagram.' : shareText);
  }

  async function nativeShare() {
    const result = await shareOrCopy({ title: 'Escale sua Seleção', text: shareText, url: window.location.href });
    if (result === 'shared') setShareStatus('Compartilhamento aberto.');
    if (result === 'copied') setShareStatus('Compartilhamento bloqueado pelo navegador. Texto copiado.');
    if (result === 'manual') setShareStatus(shareText);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/90 px-4 py-5 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-yellow-400 px-3 py-1 text-xs font-black uppercase tracking-[0.25em] text-slate-950">
              <Trophy size={14} /> Seleção Oficial
            </div>
            <h1 className="text-3xl font-black tracking-tight md:text-5xl">Escale sua Seleção</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">
              Monte sua seleção, salve seu voto e compare com os jogadores mais escalados do Brasil.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setPage('escale')} className={`rounded-2xl px-4 py-2 text-sm font-black transition ${page === 'escale' ? 'bg-yellow-400 text-slate-950' : 'bg-white/10 text-white hover:bg-white/15'}`}>Escalar</button>
              <button onClick={() => setPage('ranking')} className={`rounded-2xl px-4 py-2 text-sm font-black transition ${page === 'ranking' ? 'bg-yellow-400 text-slate-950' : 'bg-white/10 text-white hover:bg-white/15'}`}>Mais escalados</button>
              {isLoggedIn ? (
                <button onClick={() => setIsLoggedIn(false)} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-black text-slate-200 hover:bg-slate-800"><LogOut size={16} /> Sair</button>
              ) : (
                <button onClick={() => setShowLogin(true)} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-black text-slate-950 hover:bg-emerald-400"><LogIn size={16} /> Entrar</button>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 shadow-2xl">
              <div className="flex items-center gap-2 font-bold"><Users size={18} /> {selectedPlayers.length}/11 escalados</div>
              <div className="mt-1 text-xs text-slate-400">Formação atual: <strong className="text-yellow-300">{formation}</strong></div>
            </div>
          </div>
        </div>
      </header>

      {page === 'escale' ? (
        <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[370px_1fr] md:px-8">
          <aside className="space-y-5">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl">
              <h2 className="mb-3 text-lg font-black">Formação</h2>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(formations).map((item) => (
                  <button key={item} onClick={() => changeFormation(item)} className={`rounded-2xl px-4 py-3 text-sm font-black transition ${formation === item ? 'bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-400/20' : 'bg-slate-900 text-slate-200 hover:bg-slate-800'}`}>{item}</button>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black">Jogadores</h2>
                  <p className="text-xs text-slate-400">{selectedPlayer ? <span>Selecionado: <strong className="text-yellow-300">{selectedPlayer}</strong></span> : 'Clique em um jogador para escalar.'}</p>
                </div>
                <button onClick={() => { setLineup({}); setSelectedPlayer(null); setSaved(false); setShareStatus(''); }} className="rounded-xl bg-slate-900 p-2 text-slate-200 transition hover:bg-slate-800" title="Limpar escalação"><RotateCcw size={18} /></button>
              </div>

              <div className="max-h-[620px] space-y-4 overflow-auto pr-1">
                {availablePlayers.map(({ category, names }) => (
                  <div key={category}>
                    <h3 className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-yellow-300">{category}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {names.map((name) => (
                        <button key={name} onClick={() => setSelectedPlayer(name)} className={`rounded-2xl border px-3 py-2 text-left text-sm font-bold transition ${selectedPlayer === name ? 'border-yellow-300 bg-yellow-300 text-slate-950' : 'border-white/10 bg-slate-900 text-slate-100 hover:border-yellow-300/60 hover:bg-slate-800'}`}>
                          {name}<span className="mt-1 block text-[10px] font-medium opacity-70">{categoryByPlayer[name]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>

          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-2xl md:p-5">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-black">Campo</h2>
                <p className="text-sm text-slate-400">Monte seu time ideal no esquema {formation}.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300"><MousePointerClick size={16} /> Clique na posição para colocar o jogador</div>
            </div>

            <div className="relative mx-auto aspect-[10/14] max-h-[760px] overflow-hidden rounded-[2rem] border-4 border-white/80 bg-emerald-700 shadow-inner">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_50%,transparent_50%)] bg-[length:80px_80px]" />
              <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 bg-white/80" />
              <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white/80" />
              <div className="absolute left-1/2 top-0 h-28 w-56 -translate-x-1/2 rounded-b-3xl border-x-4 border-b-4 border-white/80" />
              <div className="absolute bottom-0 left-1/2 h-28 w-56 -translate-x-1/2 rounded-t-3xl border-x-4 border-t-4 border-white/80" />

              {positions.map((position) => {
                const player = lineup[position.id];
                return (
                  <button
                    key={`${formation}-${position.id}`}
                    onClick={() => (player ? removePlayer(position.id) : handlePositionClick(position.id))}
                    className={`absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-2xl border px-2 py-2 text-center shadow-xl transition-colors md:min-w-28 md:px-3 ${player ? 'border-yellow-300 bg-slate-950 text-white' : selectedPlayer ? 'border-yellow-300 bg-yellow-300 text-slate-950 hover:bg-yellow-200' : 'border-white/40 bg-white/15 text-white hover:bg-white/25'}`}
                    style={{ left: `${position.x}%`, top: `${position.y}%` }}
                    title={player ? 'Clique para remover' : 'Clique para escalar aqui'}
                  >
                    <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black md:h-12 md:w-12 ${player ? 'bg-yellow-400 text-slate-950' : 'bg-slate-950/80 text-white'}`}>{player ? initials(player) : position.label}</span>
                    <span className="max-w-24 truncate text-xs font-black md:max-w-28 md:text-sm">{player || position.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950 p-4">
              <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-black">Minha escalação</h3>
                  <p className="text-xs text-slate-400">{saved ? 'Escalação salva. Seu voto entrou no ranking.' : 'Complete os 11 jogadores para salvar e compartilhar.'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={saveLineup} disabled={!isComplete} className="inline-flex items-center gap-2 rounded-2xl bg-yellow-400 px-4 py-2 text-sm font-black text-slate-950 transition disabled:cursor-not-allowed disabled:opacity-40"><Save size={16} /> Salvar voto</button>
                  <button onClick={nativeShare} disabled={!isComplete} className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-black text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"><Share2 size={16} /> Compartilhar</button>
                </div>
              </div>

              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {positions.map((position) => (
                  <div key={position.id} className="rounded-2xl bg-white/5 px-3 py-2 text-sm"><span className="font-black text-yellow-300">{position.label}</span><span className="mx-2 text-slate-500">•</span><span className="font-bold text-slate-100">{lineup[position.id] || 'Em aberto'}</span></div>
                ))}
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-3">
                <button onClick={shareWhatsApp} disabled={!isComplete} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"><MessageCircle size={18} /> WhatsApp</button>
                <button onClick={copyForInstagram} disabled={!isComplete} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-pink-500 px-4 py-3 text-sm font-black text-white transition hover:bg-pink-400 disabled:cursor-not-allowed disabled:opacity-40"><Share2 size={18} /> Instagram</button>
                <button onClick={shareFacebook} disabled={!isComplete} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-40"><Share2 size={18} /> Facebook</button>
              </div>

              {shareStatus && <div className="mt-4 whitespace-pre-wrap rounded-2xl border border-yellow-300/30 bg-yellow-300/10 p-3 text-xs font-bold text-yellow-100">{shareStatus}</div>}
            </div>
          </section>
        </main>
      ) : (
        <RankingPage isLoggedIn={isLoggedIn} setPage={setPage} setShowLogin={setShowLogin} />
      )}

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={() => { setIsLoggedIn(true); setShowLogin(false); }} />}
    </div>
  );
}

function RankingPage({ isLoggedIn, setPage, setShowLogin }) {
  if (!isLoggedIn) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <section className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-yellow-400 text-slate-950"><LockKeyhole size={30} /></div>
          <h2 className="text-3xl font-black">Ranking bloqueado</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">Para ver os jogadores mais escalados por posição e a formação preferida da galera, faça login primeiro.</p>
          <button onClick={() => setShowLogin(true)} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-yellow-400 px-6 py-3 text-sm font-black text-slate-950 hover:bg-yellow-300"><LogIn size={18} /> Fazer login para ver ranking</button>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
      <section className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-slate-950"><BarChart3 size={14} /> Ranking liberado</div>
            <h2 className="text-3xl font-black md:text-4xl">Mais escalados</h2>
            <p className="mt-2 text-slate-300">Veja a formação mais votada e os jogadores preferidos por posição.</p>
          </div>
          <button onClick={() => setPage('escale')} className="rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-yellow-300">Montar minha seleção</button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl">
            <h3 className="mb-4 text-xl font-black">Formações mais usadas</h3>
            <div className="space-y-3">
              {rankingMock.formations.map((item, index) => {
                const max = rankingMock.formations[0].votes;
                return <RankingBar key={item.name} label={item.name} votes={item.votes} max={max} index={index} color="bg-yellow-400" />;
              })}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl">
            <h3 className="mb-4 text-xl font-black">Jogadores por posição</h3>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Object.entries(rankingMock.positions).map(([position, items]) => (
                <div key={position} className="rounded-3xl bg-slate-950 p-4">
                  <div className="mb-3 flex items-center justify-between"><h4 className="text-lg font-black text-yellow-300">{position}</h4><span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-black uppercase text-slate-400">Top 3</span></div>
                  <div className="space-y-3">
                    {items.map((item, index) => <RankingBar key={item.name} label={item.name} votes={item.votes} max={items[0].votes} index={index} compact color="bg-emerald-400" />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function RankingBar({ label, votes, max, index, compact = false, color }) {
  return (
    <div className={compact ? '' : 'rounded-3xl bg-slate-950 p-4'}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          {!compact && <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-yellow-400 font-black text-slate-950">{index + 1}</span>}
          <strong className={compact ? 'text-sm text-slate-100' : 'text-lg'}>{compact ? `${index + 1}. ${label}` : label}</strong>
        </div>
        <span className="text-xs font-black text-slate-400">{formatVotes(votes)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${(votes / max) * 100}%` }} />
      </div>
    </div>
  );
}

function LoginModal({ onClose, onLogin }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur">
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div><h2 className="text-2xl font-black">Entrar</h2><p className="mt-1 text-sm text-slate-400">Login simples para salvar voto e liberar o ranking.</p></div>
          <button onClick={onClose} className="rounded-xl bg-white/10 px-3 py-2 text-sm font-black hover:bg-white/15">X</button>
        </div>
        <div className="space-y-3">
          <input className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-yellow-300" placeholder="Seu e-mail" defaultValue="torcedor@email.com" />
          <input className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-yellow-300" placeholder="Senha" type="password" defaultValue="123456" />
          <button onClick={onLogin} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-yellow-300"><LogIn size={18} /> Entrar e continuar</button>
          <button onClick={onLogin} className="w-full rounded-2xl bg-white/10 px-5 py-3 text-sm font-black text-white hover:bg-white/15">Entrar com Google</button>
        </div>
      </motion.div>
    </div>
  );
}
