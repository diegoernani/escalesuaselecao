import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toBlob } from 'html-to-image';
import { BarChart3, LockKeyhole, LogIn, LogOut, MessageCircle, MousePointerClick, RotateCcw, Save, Share2, Trophy, Users } from 'lucide-react';
import { supabase } from './lib/supabaseClient';
import ShareStory from './components/ShareStory';

const players = {
  Goleiros: ['Alisson', 'Ederson', 'Weverton'],
  Defensores: ['Alex Sandro', 'Bremer', 'Danilo', 'Douglas Santos', 'Gabriel Magalhães', 'Ibañez', 'Léo Pereira', 'Marquinhos', 'Wesley'],
  'Meio-campistas': ['Bruno Guimarães', 'Casemiro', 'Danilo S.', 'Fabinho', 'Lucas Paquetá'],
  Atacantes: ['Endrick', 'Gabriel Martinelli', 'Igor Thiago', 'Luiz Henrique', 'Matheus Cunha', 'Neymar Jr.', 'Raphinha', 'Rayan', 'Vini Jr.'],
};

const formationData = {
  '4-3-3': [[50,91,'GOL','gk'],[18,72,'LE','lb'],[39,75,'ZAG','cb1'],[61,75,'ZAG','cb2'],[82,72,'LD','rb'],[30,52,'MC','cm1'],[50,58,'VOL','cdm'],[70,52,'MC','cm2'],[20,27,'PE','lw'],[50,20,'ATA','st'],[80,27,'PD','rw']],
  '4-5-1': [[50,91,'GOL','gk'],[18,72,'LE','lb'],[39,75,'ZAG','cb1'],[61,75,'ZAG','cb2'],[82,72,'LD','rb'],[16,49,'ME','lm'],[35,52,'MC','cm1'],[50,58,'VOL','cdm'],[65,52,'MC','cm2'],[84,49,'MD','rm'],[50,22,'ATA','st']],
  '4-4-2': [[50,91,'GOL','gk'],[18,72,'LE','lb'],[39,75,'ZAG','cb1'],[61,75,'ZAG','cb2'],[82,72,'LD','rb'],[18,50,'ME','lm'],[41,55,'MC','cm1'],[59,55,'MC','cm2'],[82,50,'MD','rm'],[40,23,'ATA','st1'],[60,23,'ATA','st2']],
  '3-5-2': [[50,91,'GOL','gk'],[30,73,'ZAG','cb1'],[50,78,'ZAG','cb2'],[70,73,'ZAG','cb3'],[14,50,'ALA','lwb'],[35,52,'MC','cm1'],[50,59,'VOL','cdm'],[65,52,'MC','cm2'],[86,50,'ALA','rwb'],[40,23,'ATA','st1'],[60,23,'ATA','st2']],
};

const fallbackRankings = {
  formations: [['4-3-3', 0], ['4-4-2', 0], ['4-5-1', 0], ['3-5-2', 0]],
  positions: { GOL: [], LE: [], ZAG: [], LD: [], VOL: [], MC: [], PE: [], ATA: [], PD: [], ME: [], MD: [], ALA: [] },
};

const categoryByPlayer = Object.fromEntries(Object.entries(players).flatMap(([category, names]) => names.map((name) => [name, category])));
const toPosition = ([x, y, label, id]) => ({ x, y, label, id });
const initials = (name) => name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
const userName = (user) => user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Torcedor';
const formatVotes = (votes) => Number(votes || 0).toLocaleString('pt-BR');

function buildShareText() {
  return `Minha escalação no Escale Sua Seleção é essa. Faça a sua também: ${window.location.origin}`;
}

function buildRankingData(formationRows = [], playerRows = []) {
  const formationVotes = new Map(formationRows.map((row) => [row.formation, Number(row.votes || 0)]));
  const next = {
    formations: Object.keys(formationData).map((formation) => [formation, formationVotes.get(formation) || 0]).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
    positions: { GOL: [], LE: [], ZAG: [], LD: [], VOL: [], MC: [], PE: [], ATA: [], PD: [], ME: [], MD: [], ALA: [] },
  };

  playerRows.forEach((row) => {
    if (!next.positions[row.position]) next.positions[row.position] = [];
    next.positions[row.position].push([row.player_name, Number(row.votes || 0)]);
  });

  Object.keys(next.positions).forEach((position) => {
    next.positions[position] = next.positions[position].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 3);
  });

  return next;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

async function shareImageOrDownload(cardElement) {
  const text = buildShareText();
  const blob = await toBlob(cardElement, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#020617',
  });

  if (!blob) throw new Error('Não foi possível gerar a imagem.');

  const file = new File([blob], 'minha-escalacao-escaleselecao.png', { type: 'image/png' });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ title: 'Escale Sua Seleção', text, url: window.location.origin, files: [file] });
    return 'Imagem pronta para compartilhar.';
  }

  const imageUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = 'minha-escalacao-escaleselecao.png';
  link.click();
  URL.revokeObjectURL(imageUrl);

  const copied = await copyText(text);
  return copied ? 'Imagem baixada e texto com link copiado.' : 'Imagem baixada. Copie o link do site para compartilhar junto.';
}

export default function App() {
  const [page, setPage] = useState('escale');
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [formation, setFormation] = useState('4-3-3');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [lineup, setLineup] = useState({});
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState('');
  const [rankingData, setRankingData] = useState(fallbackRankings);
  const [rankingStatus, setRankingStatus] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user || null;
      setUser(sessionUser);
      if (sessionUser) setAuthOpen(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user || null;
      setUser(sessionUser);
      if (sessionUser) setAuthOpen(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) loadRankings();
  }, [user]);

  const positions = useMemo(() => formationData[formation].map(toPosition), [formation]);
  const selectedPlayers = useMemo(() => Object.values(lineup).filter(Boolean), [lineup]);
  const selectedSet = useMemo(() => new Set(selectedPlayers), [selectedPlayers]);
  const complete = selectedPlayers.length === 11;
  const availablePlayers = useMemo(() => Object.entries(players).map(([category, names]) => ({ category, names: names.filter((name) => !selectedSet.has(name)) })), [selectedSet]);

  async function loadRankings() {
    setRankingStatus('Carregando ranking...');
    const [{ data: formationRows, error: formationError }, { data: playerRows, error: playerError }] = await Promise.all([
      supabase.from('ranking_formations').select('formation, votes'),
      supabase.from('ranking_players_by_position').select('position, player_name, votes'),
    ]);

    if (formationError || playerError) {
      setRankingStatus(`Não foi possível carregar o ranking: ${(formationError || playerError).message}`);
      return;
    }

    setRankingData(buildRankingData(formationRows || [], playerRows || []));
    setRankingStatus('');
  }

  function resetLineup(nextFormation = formation) {
    setFormation(nextFormation);
    setLineup({});
    setSelectedPlayer(null);
    setSaved(false);
    setStatus('');
  }

  function clickPosition(positionId) {
    if (!selectedPlayer) return;

    setLineup((current) => {
      const withoutRepeated = Object.fromEntries(Object.entries(current).filter(([, player]) => player !== selectedPlayer));
      return { ...withoutRepeated, [positionId]: selectedPlayer };
    });

    setSelectedPlayer(null);
    setSaved(false);
    setStatus('');
  }

  function removePlayer(positionId) {
    setLineup((current) => {
      const copy = { ...current };
      delete copy[positionId];
      return copy;
    });
    setSaved(false);
    setStatus('');
  }

  async function saveLineup() {
    if (!user) return setAuthOpen(true);
    if (!complete) return;

    setStatus('Salvando escalação...');
    const { data, error } = await supabase.from('lineups').insert({ user_id: user.id, formation }).select('id').single();
    if (error) { setStatus(`Erro ao salvar: ${error.message}`); return; }

    const rows = positions.map((position) => ({ lineup_id: data.id, position: position.label, position_id: position.id, player_name: lineup[position.id] }));
    const { error: playersError } = await supabase.from('lineup_players').insert(rows);
    if (playersError) { setStatus(`Escalação criada, mas jogadores não foram salvos: ${playersError.message}`); return; }

    setSaved(true);
    setStatus('Escalação salva no Supabase. Seu voto entrou no ranking.');
    await loadRankings();
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setSaved(false);
    setRankingData(fallbackRankings);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header page={page} setPage={setPage} user={user} signOut={signOut} openAuth={() => setAuthOpen(true)} count={selectedPlayers.length} formation={formation} />

      {page === 'escale' ? (
        <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[370px_1fr] md:px-8">
          <aside className="space-y-5">
            <Panel title="Formação">
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(formationData).map((item) => (
                  <button key={item} onClick={() => resetLineup(item)} className={`rounded-2xl px-4 py-3 text-sm font-black transition ${formation === item ? 'bg-yellow-400 text-slate-950' : 'bg-slate-900 text-slate-200 hover:bg-slate-800'}`}>
                    {item}
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title="Jogadores" subtitle={selectedPlayer ? `Selecionado: ${selectedPlayer}` : 'Clique em um jogador para escalar.'} action={<button onClick={() => resetLineup()} className="rounded-xl bg-slate-900 p-2 text-slate-200 hover:bg-slate-800"><RotateCcw size={18} /></button>}>
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
            </Panel>
          </aside>

          <Field positions={positions} lineup={lineup} selectedPlayer={selectedPlayer} formation={formation} clickPosition={clickPosition} removePlayer={removePlayer} />
          <LineupPanel positions={positions} lineup={lineup} formation={formation} complete={complete} saved={saved} status={status} saveLineup={saveLineup} setStatus={setStatus} />
        </main>
      ) : (
        <RankingPage logged={Boolean(user)} openAuth={() => setAuthOpen(true)} setPage={setPage} rankingData={rankingData} rankingStatus={rankingStatus} reload={loadRankings} />
      )}

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onSuccess={() => setAuthOpen(false)} />}
    </div>
  );
}

function Header({ page, setPage, user, signOut, openAuth, count, formation }) {
  return (
    <header className="border-b border-white/10 bg-slate-950/90 px-4 py-5 backdrop-blur md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-yellow-400 px-3 py-1 text-xs font-black uppercase tracking-[0.25em] text-slate-950"><Trophy size={14} /> Seleção Oficial</div>
          <h1 className="text-3xl font-black tracking-tight md:text-5xl">Escale sua Seleção</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">Monte sua seleção, salve seu voto e compare com os jogadores mais escalados do Brasil.</p>
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setPage('escale')} className={`rounded-2xl px-4 py-2 text-sm font-black transition ${page === 'escale' ? 'bg-yellow-400 text-slate-950' : 'bg-white/10 text-white hover:bg-white/15'}`}>Escalar</button>
            <button onClick={() => setPage('ranking')} className={`rounded-2xl px-4 py-2 text-sm font-black transition ${page === 'ranking' ? 'bg-yellow-400 text-slate-950' : 'bg-white/10 text-white hover:bg-white/15'}`}>Mais escalados</button>
            {user ? <button onClick={signOut} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-black text-slate-200 hover:bg-slate-800"><LogOut size={16} /> Sair de {userName(user).split(' ')[0]}</button> : <button onClick={openAuth} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-black text-slate-950 hover:bg-emerald-400"><LogIn size={16} /> Entrar</button>}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            <div className="flex items-center gap-2 font-bold"><Users size={18} /> {count}/11 escalados</div>
            <div className="mt-1 text-xs text-slate-400">Formação atual: <strong className="text-yellow-300">{formation}</strong></div>
          </div>
        </div>
      </div>
    </header>
  );
}

function Panel({ title, subtitle, action, children }) {
  return <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl"><div className="mb-4 flex items-start justify-between gap-3"><div><h2 className="text-lg font-black">{title}</h2>{subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}</div>{action}</div>{children}</section>;
}

function Field({ positions, lineup, selectedPlayer, formation, clickPosition, removePlayer }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-2xl md:col-start-2 md:row-span-2 md:p-5">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div><h2 className="text-2xl font-black">Campo</h2><p className="text-sm text-slate-400">Monte seu time ideal no esquema {formation}.</p></div>
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
            <button key={`${formation}-${position.id}`} onClick={() => player ? removePlayer(position.id) : clickPosition(position.id)} className={`absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-2xl border px-2 py-2 text-center shadow-xl transition-colors md:min-w-28 md:px-3 ${player ? 'border-yellow-300 bg-slate-950 text-white' : selectedPlayer ? 'border-yellow-300 bg-yellow-300 text-slate-950 hover:bg-yellow-200' : 'border-white/40 bg-white/15 text-white hover:bg-white/25'}`} style={{ left: `${position.x}%`, top: `${position.y}%` }}>
              <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black md:h-12 md:w-12 ${player ? 'bg-yellow-400 text-slate-950' : 'bg-slate-950/80 text-white'}`}>{player ? initials(player) : position.label}</span>
              <span className="max-w-24 truncate text-xs font-black md:max-w-28 md:text-sm">{player || position.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function LineupPanel({ positions, lineup, formation, complete, saved, status, saveLineup, setStatus }) {
  const storyRef = useRef(null);

  async function handleShareStory() {
    if (!complete || !storyRef.current) return;
    setStatus('Gerando imagem para compartilhar...');
    try {
      setStatus(await shareImageOrDownload(storyRef.current));
    } catch (error) {
      setStatus(`Não foi possível gerar a imagem: ${error.message}`);
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950 p-4 md:col-start-2">
      <div className="pointer-events-none fixed -left-[9999px] top-0 opacity-0">
        <div ref={storyRef}>
          <ShareStory formation={formation} positions={positions} lineup={lineup} />
        </div>
      </div>

      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div><h3 className="text-lg font-black">Minha escalação</h3><p className="text-xs text-slate-400">{saved ? 'Escalação salva. Seu voto entrou no ranking.' : 'Complete os 11 jogadores para salvar e compartilhar.'}</p></div>
        <div className="flex flex-wrap gap-2">
          <button onClick={saveLineup} disabled={!complete} className="inline-flex items-center gap-2 rounded-2xl bg-yellow-400 px-4 py-2 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"><Save size={16} /> Salvar voto</button>
          <button onClick={handleShareStory} disabled={!complete} className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-black text-white hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"><Share2 size={16} /> Compartilhar imagem</button>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        {positions.map((position) => <div key={position.id} className="rounded-2xl bg-white/5 px-3 py-2 text-sm"><span className="font-black text-yellow-300">{position.label}</span><span className="mx-2 text-slate-500">•</span><span className="font-bold text-slate-100">{lineup[position.id] || 'Em aberto'}</span></div>)}
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-3">
        <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(buildShareText())}`, '_blank', 'noopener,noreferrer')} disabled={!complete} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-black text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"><MessageCircle size={18} /> WhatsApp</button>
        <button onClick={handleShareStory} disabled={!complete} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-pink-500 px-4 py-3 text-sm font-black text-white hover:bg-pink-400 disabled:cursor-not-allowed disabled:opacity-40"><Share2 size={18} /> Story</button>
        <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`, '_blank', 'noopener,noreferrer')} disabled={!complete} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-4 py-3 text-sm font-black text-white hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-40"><Share2 size={18} /> Facebook</button>
      </div>

      {status && <div className="mt-4 whitespace-pre-wrap rounded-2xl border border-yellow-300/30 bg-yellow-300/10 p-3 text-xs font-bold text-yellow-100">{status}</div>}
    </section>
  );
}

function RankingPage({ logged, openAuth, setPage, rankingData, rankingStatus, reload }) {
  if (!logged) return <main className="mx-auto max-w-7xl px-4 py-6 md:px-8"><section className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center shadow-2xl"><div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-yellow-400 text-slate-950"><LockKeyhole size={30} /></div><h2 className="text-3xl font-black">Ranking bloqueado</h2><p className="mx-auto mt-3 max-w-xl text-slate-300">Para ver os jogadores mais escalados por posição e a formação preferida da galera, faça login primeiro.</p><button onClick={openAuth} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-yellow-400 px-6 py-3 text-sm font-black text-slate-950 hover:bg-yellow-300"><LogIn size={18} /> Fazer login para ver ranking</button></section></main>;

  return <main className="mx-auto max-w-7xl px-4 py-6 md:px-8"><section className="space-y-6"><div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between"><div><div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-slate-950"><BarChart3 size={14} /> Ranking real</div><h2 className="text-3xl font-black md:text-4xl">Mais escalados</h2><p className="mt-2 text-slate-300">Dados carregados do Supabase com base nos votos salvos.</p>{rankingStatus && <p className="mt-2 text-sm font-bold text-yellow-200">{rankingStatus}</p>}</div><div className="flex gap-2"><button onClick={reload} className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-black text-white hover:bg-white/15">Atualizar</button><button onClick={() => setPage('escale')} className="rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-yellow-300">Montar minha seleção</button></div></div><div className="grid gap-6 lg:grid-cols-[360px_1fr]"><div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl"><h3 className="mb-4 text-xl font-black">Formações mais usadas</h3><div className="space-y-3">{rankingData.formations.map((item, index) => <RankingBar key={item[0]} label={item[0]} votes={item[1]} max={Math.max(rankingData.formations[0]?.[1] || 1, 1)} index={index} color="bg-yellow-400" />)}</div></div><div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl"><h3 className="mb-4 text-xl font-black">Jogadores por posição</h3><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Object.entries(rankingData.positions).map(([position, items]) => <div key={position} className="rounded-3xl bg-slate-950 p-4"><div className="mb-3 flex items-center justify-between"><h4 className="text-lg font-black text-yellow-300">{position}</h4><span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-black uppercase text-slate-400">Top 3</span></div><div className="space-y-3">{items.length ? items.map((item, index) => <RankingBar key={item[0]} label={item[0]} votes={item[1]} max={Math.max(items[0]?.[1] || 1, 1)} index={index} compact color="bg-emerald-400" />) : <p className="text-sm text-slate-500">Sem votos ainda.</p>}</div></div>)}</div></div></div></section></main>;
}

function RankingBar({ label, votes, max, index, compact = false, color }) {
  return <div className={compact ? '' : 'rounded-3xl bg-slate-950 p-4'}><div className="mb-2 flex items-center justify-between gap-2"><div className="flex items-center gap-3">{!compact && <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-yellow-400 font-black text-slate-950">{index + 1}</span>}<strong className={compact ? 'text-sm text-slate-100' : 'text-lg'}>{compact ? `${index + 1}. ${label}` : label}</strong></div><span className="text-xs font-black text-slate-400">{formatVotes(votes)}</span></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full ${color}`} style={{ width: `${(votes / max) * 100}%` }} /></div></div>;
}

function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const register = mode === 'register';
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  async function submit(event) {
    event.preventDefault();
    setMessage(register ? 'Criando cadastro...' : 'Entrando...');
    const result = register
      ? await supabase.auth.signUp({ email: form.email, password: form.password, options: { data: { name: form.name }, emailRedirectTo: window.location.origin } })
      : await supabase.auth.signInWithPassword({ email: form.email, password: form.password });

    if (result.error) { setMessage(result.error.message); return; }

    if (register && !result.data?.session) {
      setMessage('Cadastro criado. Verifique seu e-mail para confirmar a conta antes de entrar.');
      setMode('login');
      setForm((current) => ({ ...current, password: '' }));
      return;
    }

    onSuccess();
  }

  async function loginWithGoogle() {
    setMessage('Abrindo Google...');
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
    if (error) setMessage(error.message);
  }

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur"><div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-900 p-6 shadow-2xl"><div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-2xl font-black">{register ? 'Criar cadastro' : 'Entrar'}</h2><p className="mt-1 text-sm text-slate-400">{register ? 'Cadastre nome, e-mail e senha para liberar o ranking.' : 'Entre para salvar voto e liberar o ranking.'}</p></div><button onClick={onClose} className="rounded-xl bg-white/10 px-3 py-2 text-sm font-black hover:bg-white/15">X</button></div><form onSubmit={submit} className="space-y-3">{register && <input className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-yellow-300" placeholder="Seu nome" value={form.name} onChange={(event) => update('name', event.target.value)} required />}<input className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-yellow-300" placeholder="Seu e-mail" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} required /><input className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-yellow-300" placeholder="Senha" type="password" value={form.password} onChange={(event) => update('password', event.target.value)} required /><button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-yellow-300"><LogIn size={18} /> {register ? 'Criar cadastro e entrar' : 'Entrar e continuar'}</button></form><button onClick={loginWithGoogle} className="mt-3 w-full rounded-2xl bg-white/10 px-5 py-3 text-sm font-black text-white hover:bg-white/15">Entrar com Google</button><button onClick={() => { setMode(register ? 'login' : 'register'); setMessage(''); }} className="mt-4 w-full rounded-2xl border border-white/10 px-5 py-3 text-sm font-black text-slate-200 hover:bg-white/5">{register ? 'Já tenho conta' : 'Criar uma conta'}</button>{message && <p className="mt-4 rounded-2xl border border-yellow-300/30 bg-yellow-300/10 p-3 text-xs font-bold text-yellow-100">{message}</p>}</div></div>;
}
