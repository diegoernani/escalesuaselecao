import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, LogIn, LogOut, RefreshCcw, Save, ShieldAlert, ShieldCheck, Users } from 'lucide-react';
import { AUTO_COMPLETE_GRACE_HOURS, isMatchAutomaticallyFinished, matchEffectiveStatus } from '../lib/matchLifecycle';
import { supabase } from '../lib/supabaseClient';

const playerCategories = ['Goleiros', 'Defensores', 'Meio-campistas', 'Atacantes'];
const matchStatuses = ['scheduled', 'completed', 'postponed', 'cancelled'];

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatDateTime(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(value));
}

function matchLabel(match, teamsById) {
  const home = teamsById[match.home_team_id]?.short_name || 'Mandante';
  const away = teamsById[match.away_team_id]?.short_name || 'Visitante';
  return `${home} x ${away}`;
}

function AdminCard({ title, subtitle, children, action }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-black">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyGate({ title, body, action }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-4 py-10">
      <section className="w-full rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-yellow-400 text-slate-950">
          <ShieldAlert size={30} />
        </div>
        <h1 className="text-3xl font-black">{title}</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-300">{body}</p>
        {action}
      </section>
    </main>
  );
}

export default function AdminControl({ user, profile, profileLoading, openAuth, signOut, refreshPublicCatalog }) {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [teamForm, setTeamForm] = useState({ name: '', short_name: '', slug: '', fifa_code: '' });
  const [playerForm, setPlayerForm] = useState({ team_id: '', name: '', category: 'Goleiros', sort_order: '1' });
  const [matchForm, setMatchForm] = useState({
    home_team_id: '',
    away_team_id: '',
    competition_name: '',
    competition_stage: '',
    venue_name: '',
    venue_city: '',
    match_at: '',
    status: 'scheduled',
    featured_rank: '0',
  });

  const teamsById = useMemo(() => Object.fromEntries(teams.map((team) => [team.id, team])), [teams]);
  const isAdmin = Boolean(profile?.is_admin);
  const selectedTeamPlayers = useMemo(
    () =>
      players
        .filter((player) => player.team_id === selectedTeamId)
        .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)),
    [players, selectedTeamId]
  );

  useEffect(() => {
    if (user && isAdmin) loadAdminCatalog();
  }, [user?.id, isAdmin]);

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!teams.length) return;

    setSelectedTeamId((current) => current || teams[0].id);
    setPlayerForm((current) => ({ ...current, team_id: current.team_id || teams[0].id }));

    const brazil = teams.find((team) => team.slug === 'brazil') || teams[0];
    const firstOpponent = teams.find((team) => team.id !== brazil.id) || teams[0];

    setMatchForm((current) => ({
      ...current,
      home_team_id: current.home_team_id || brazil.id,
      away_team_id: current.away_team_id || firstOpponent.id,
    }));
  }, [teams]);

  async function loadAdminCatalog() {
    setLoading(true);
    setMessage('');

    const [{ data: teamRows, error: teamsError }, { data: playerRows, error: playersError }, { data: matchRows, error: matchesError }] = await Promise.all([
      supabase.from('national_teams').select('id, slug, name, short_name, fifa_code, is_active').order('name'),
      supabase.from('team_players').select('id, team_id, name, category, sort_order, is_active').order('sort_order').order('name'),
      supabase
        .from('matches')
        .select('id, slug, home_team_id, away_team_id, competition_name, competition_stage, venue_name, venue_city, match_at, status, featured_rank')
        .order('match_at'),
    ]);

    if (teamsError || playersError || matchesError) {
      setMessage(`Nao foi possivel carregar o painel: ${(teamsError || playersError || matchesError).message}`);
      setLoading(false);
      return;
    }

    setTeams(teamRows || []);
    setPlayers(playerRows || []);
    setMatches(matchRows || []);
    setLoading(false);
  }

  async function refreshEverything(successMessage) {
    await loadAdminCatalog();
    if (refreshPublicCatalog) await refreshPublicCatalog();
    setMessage(successMessage);
  }

  async function createTeam(event) {
    event.preventDefault();
    const slug = slugify(teamForm.slug || teamForm.name);

    if (!slug) {
      setMessage('Informe um nome valido para gerar o slug da selecao.');
      return;
    }

    const { error } = await supabase.from('national_teams').insert({
      slug,
      name: teamForm.name.trim(),
      short_name: teamForm.short_name.trim() || teamForm.name.trim(),
      fifa_code: teamForm.fifa_code.trim().toUpperCase() || null,
    });

    if (error) {
      setMessage(`Nao foi possivel cadastrar a selecao: ${error.message}`);
      return;
    }

    setTeamForm({ name: '', short_name: '', slug: '', fifa_code: '' });
    await refreshEverything('Selecao cadastrada com sucesso.');
  }

  async function createPlayer(event) {
    event.preventDefault();

    if (!playerForm.team_id) {
      setMessage('Escolha uma selecao para cadastrar o jogador.');
      return;
    }

    const { error } = await supabase.from('team_players').insert({
      team_id: playerForm.team_id,
      name: playerForm.name.trim(),
      category: playerForm.category,
      sort_order: Number(playerForm.sort_order || 0),
    });

    if (error) {
      setMessage(`Nao foi possivel cadastrar o jogador: ${error.message}`);
      return;
    }

    setPlayerForm((current) => ({ ...current, name: '', sort_order: String(Number(current.sort_order || 0) + 1) }));
    setSelectedTeamId(playerForm.team_id);
    await refreshEverything('Jogador cadastrado com sucesso.');
  }

  async function createMatch(event) {
    event.preventDefault();

    if (!matchForm.home_team_id || !matchForm.away_team_id) {
      setMessage('Escolha as duas selecoes do jogo.');
      return;
    }

    if (matchForm.home_team_id === matchForm.away_team_id) {
      setMessage('Mandante e visitante precisam ser selecoes diferentes.');
      return;
    }

    const homeSlug = teamsById[matchForm.home_team_id]?.slug;
    const awaySlug = teamsById[matchForm.away_team_id]?.slug;
    const matchDate = matchForm.match_at ? matchForm.match_at.slice(0, 10) : '';
    const generatedSlug = slugify(`${homeSlug}-vs-${awaySlug}-${matchDate}`);

    const { error } = await supabase.from('matches').insert({
      slug: generatedSlug,
      home_team_id: matchForm.home_team_id,
      away_team_id: matchForm.away_team_id,
      competition_name: matchForm.competition_name.trim(),
      competition_stage: matchForm.competition_stage.trim() || null,
      venue_name: matchForm.venue_name.trim() || null,
      venue_city: matchForm.venue_city.trim() || null,
      match_at: new Date(matchForm.match_at).toISOString(),
      status: matchForm.status,
      featured_rank: Number(matchForm.featured_rank || 0),
    });

    if (error) {
      setMessage(`Nao foi possivel cadastrar o jogo: ${error.message}`);
      return;
    }

    setMatchForm((current) => ({
      ...current,
      competition_name: '',
      competition_stage: '',
      venue_name: '',
      venue_city: '',
      match_at: '',
      featured_rank: '0',
      status: 'scheduled',
    }));
    await refreshEverything('Jogo cadastrado com sucesso.');
  }

  async function toggleTeamActive(team) {
    const { error } = await supabase.from('national_teams').update({ is_active: !team.is_active }).eq('id', team.id);
    if (error) {
      setMessage(`Nao foi possivel atualizar a selecao: ${error.message}`);
      return;
    }

    await refreshEverything(`Selecao ${team.is_active ? 'desativada' : 'ativada'} com sucesso.`);
  }

  async function togglePlayerActive(player) {
    const { error } = await supabase.from('team_players').update({ is_active: !player.is_active }).eq('id', player.id);
    if (error) {
      setMessage(`Nao foi possivel atualizar o jogador: ${error.message}`);
      return;
    }

    await refreshEverything(`Jogador ${player.is_active ? 'desativado' : 'ativado'} com sucesso.`);
  }

  async function updateMatchStatus(matchId, status) {
    const { error } = await supabase.from('matches').update({ status }).eq('id', matchId);
    if (error) {
      setMessage(`Nao foi possivel atualizar o jogo: ${error.message}`);
      return;
    }

    await refreshEverything('Status do jogo atualizado com sucesso.');
  }

  if (!user) {
    return (
      <EmptyGate
        title="Pagina indisponivel"
        body="Entre com sua conta para continuar."
        action={
          <button onClick={openAuth} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-yellow-400 px-6 py-3 text-sm font-black text-slate-950 hover:bg-yellow-300">
            <LogIn size={18} />
            Entrar
          </button>
        }
      />
    );
  }

  if (profileLoading) {
    return <EmptyGate title="Carregando" body="Validando o acesso a esta pagina." />;
  }

  if (!isAdmin) {
    return <EmptyGate title="Pagina indisponivel" body="Este endereco nao esta disponivel para a conta atual." />;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
      <section className="space-y-6">
        <header className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-3 py-1 text-xs font-black uppercase tracking-[0.24em] text-slate-950">
                <ShieldCheck size={14} />
                Controle interno
              </div>
              <h1 className="mt-4 text-3xl font-black md:text-4xl">Cadastro de selecoes, jogadores e jogos</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-300">
                Esta tela existe apenas na rota digitada manualmente. O acesso real depende do campo <code>profiles.is_admin</code> no Supabase.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
                <div className="font-bold">{profile?.name || user.email}</div>
                <div className="mt-1 text-xs text-slate-400">{user.email}</div>
              </div>
              <div className="flex gap-2">
                <a href="/" className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-black text-white hover:bg-white/15">
                  Voltar ao site
                </a>
                <button onClick={() => loadAdminCatalog()} className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-black text-white hover:bg-white/15">
                  <RefreshCcw size={16} />
                  Atualizar
                </button>
                <button onClick={signOut} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-black text-slate-200 hover:bg-slate-800">
                  <LogOut size={16} />
                  Sair
                </button>
              </div>
            </div>
          </div>
          {message && <div className="mt-4 rounded-2xl border border-yellow-300/30 bg-yellow-300/10 p-3 text-sm font-bold text-yellow-100">{message}</div>}
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <AdminCard title="Nova selecao" subtitle="Cadastre selecoes que podem ser escaladas no app.">
            <form onSubmit={createTeam} className="grid gap-3">
              <input
                className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-yellow-300"
                placeholder="Nome da selecao"
                value={teamForm.name}
                onChange={(event) => setTeamForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-yellow-300"
                  placeholder="Nome curto"
                  value={teamForm.short_name}
                  onChange={(event) => setTeamForm((current) => ({ ...current, short_name: event.target.value }))}
                />
                <input
                  className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-yellow-300"
                  placeholder="Codigo FIFA"
                  maxLength={3}
                  value={teamForm.fifa_code}
                  onChange={(event) => setTeamForm((current) => ({ ...current, fifa_code: event.target.value.toUpperCase() }))}
                />
              </div>
              <input
                className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-yellow-300"
                placeholder="Slug opcional"
                value={teamForm.slug}
                onChange={(event) => setTeamForm((current) => ({ ...current, slug: event.target.value }))}
              />
              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-yellow-300">
                <Save size={16} />
                Cadastrar selecao
              </button>
            </form>
          </AdminCard>

          <AdminCard title="Novo jogador" subtitle="Cadastre os jogadores de uma selecao especifica.">
            <form onSubmit={createPlayer} className="grid gap-3">
              <select
                value={playerForm.team_id}
                onChange={(event) => setPlayerForm((current) => ({ ...current, team_id: event.target.value }))}
                className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-yellow-300"
                required
              >
                <option value="" className="bg-slate-950 text-white">
                  Escolha a selecao
                </option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id} className="bg-slate-950 text-white">
                    {team.name}
                  </option>
                ))}
              </select>
              <input
                className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-yellow-300"
                placeholder="Nome do jogador"
                value={playerForm.name}
                onChange={(event) => setPlayerForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
              <div className="grid gap-3 md:grid-cols-2">
                <select
                  value={playerForm.category}
                  onChange={(event) => setPlayerForm((current) => ({ ...current, category: event.target.value }))}
                  className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-yellow-300"
                >
                  {playerCategories.map((category) => (
                    <option key={category} value={category} className="bg-slate-950 text-white">
                      {category}
                    </option>
                  ))}
                </select>
                <input
                  className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-yellow-300"
                  placeholder="Ordem"
                  type="number"
                  value={playerForm.sort_order}
                  onChange={(event) => setPlayerForm((current) => ({ ...current, sort_order: event.target.value }))}
                />
              </div>
              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-yellow-300">
                <Users size={16} />
                Cadastrar jogador
              </button>
            </form>
          </AdminCard>
        </div>

        <AdminCard title="Novo jogo" subtitle="Cadastre confrontos futuros para aparecerem no painel do site.">
          <form onSubmit={createMatch} className="grid gap-3">
            <div className="grid gap-3 md:grid-cols-2">
              <select
                value={matchForm.home_team_id}
                onChange={(event) => setMatchForm((current) => ({ ...current, home_team_id: event.target.value }))}
                className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-yellow-300"
                required
              >
                <option value="" className="bg-slate-950 text-white">
                  Mandante
                </option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id} className="bg-slate-950 text-white">
                    {team.name}
                  </option>
                ))}
              </select>
              <select
                value={matchForm.away_team_id}
                onChange={(event) => setMatchForm((current) => ({ ...current, away_team_id: event.target.value }))}
                className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-yellow-300"
                required
              >
                <option value="" className="bg-slate-950 text-white">
                  Visitante
                </option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id} className="bg-slate-950 text-white">
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-yellow-300"
                placeholder="Competicao"
                value={matchForm.competition_name}
                onChange={(event) => setMatchForm((current) => ({ ...current, competition_name: event.target.value }))}
                required
              />
              <input
                className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-yellow-300"
                placeholder="Fase ou grupo"
                value={matchForm.competition_stage}
                onChange={(event) => setMatchForm((current) => ({ ...current, competition_stage: event.target.value }))}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-yellow-300"
                placeholder="Estadio"
                value={matchForm.venue_name}
                onChange={(event) => setMatchForm((current) => ({ ...current, venue_name: event.target.value }))}
              />
              <input
                className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-yellow-300"
                placeholder="Cidade"
                value={matchForm.venue_city}
                onChange={(event) => setMatchForm((current) => ({ ...current, venue_city: event.target.value }))}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <input
                className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-yellow-300"
                type="datetime-local"
                value={matchForm.match_at}
                onChange={(event) => setMatchForm((current) => ({ ...current, match_at: event.target.value }))}
                required
              />
              <select
                value={matchForm.status}
                onChange={(event) => setMatchForm((current) => ({ ...current, status: event.target.value }))}
                className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-yellow-300"
              >
                {matchStatuses.map((status) => (
                  <option key={status} value={status} className="bg-slate-950 text-white">
                    {status}
                  </option>
                ))}
              </select>
              <input
                className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-yellow-300"
                type="number"
                placeholder="Ordem de destaque"
                value={matchForm.featured_rank}
                onChange={(event) => setMatchForm((current) => ({ ...current, featured_rank: event.target.value }))}
              />
            </div>
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-yellow-300">
              <CalendarDays size={16} />
              Cadastrar jogo
            </button>
          </form>
        </AdminCard>

        <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
          <AdminCard title="Selecoes cadastradas" subtitle="Ative ou desative quais selecoes aparecem no site." action={loading ? <span className="text-xs text-slate-400">Carregando...</span> : null}>
            <div className="space-y-3">
              {teams.map((team) => (
                <div key={team.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-black">{team.name}</div>
                      <div className="mt-1 text-xs text-slate-400">
                        {team.slug} {team.fifa_code ? `- ${team.fifa_code}` : ''}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleTeamActive(team)}
                      className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${team.is_active ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-slate-200'}`}
                    >
                      {team.is_active ? 'Ativa' : 'Inativa'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>

          <AdminCard title="Jogadores cadastrados" subtitle="Gerencie o elenco de cada selecao sem expor isso no menu publico.">
            <div className="mb-4 rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2">
              <select
                value={selectedTeamId}
                onChange={(event) => setSelectedTeamId(event.target.value)}
                className="w-full bg-transparent text-sm font-black outline-none"
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id} className="bg-slate-950 text-white">
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {selectedTeamPlayers.map((player) => (
                <div key={player.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-black">{player.name}</div>
                      <div className="mt-1 text-xs text-slate-400">
                        {player.category} - ordem {player.sort_order}
                      </div>
                    </div>
                    <button
                      onClick={() => togglePlayerActive(player)}
                      className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${player.is_active ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-slate-200'}`}
                    >
                      {player.is_active ? 'Ativo' : 'Inativo'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        </div>

        <AdminCard title="Jogos cadastrados" subtitle={`O site oculta automaticamente jogos em status scheduled ${AUTO_COMPLETE_GRACE_HOURS} horas depois do horario marcado.`}>
          <div className="space-y-3">
            {matches.map((match) => (
              <div key={match.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-base font-black">{matchLabel(match, teamsById)}</div>
                    <div className="mt-1 text-sm text-slate-300">
                      {match.competition_name} {match.competition_stage ? `- ${match.competition_stage}` : ''}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      {formatDateTime(match.match_at)} {match.venue_name ? `- ${match.venue_name}` : ''}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-slate-200">
                        banco: {match.status}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${matchEffectiveStatus(match, nowMs) === 'auto-completed' ? 'bg-amber-400 text-slate-950' : 'bg-emerald-500 text-slate-950'}`}>
                        site: {matchEffectiveStatus(match, nowMs) === 'auto-completed' ? 'encerrado automatico' : matchEffectiveStatus(match, nowMs)}
                      </span>
                    </div>
                    {isMatchAutomaticallyFinished(match, nowMs) && (
                      <div className="mt-2 text-xs text-amber-200">
                        Esse jogo ja saiu sozinho do bloco publico de proximo jogo. Se quiser manter o banco consistente, troque o status para <code>completed</code>.
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-slate-300">
                      destaque {match.featured_rank}
                    </div>
                    <select
                      value={match.status}
                      onChange={(event) => updateMatchStatus(match.id, event.target.value)}
                      className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-2 text-sm outline-none focus:border-yellow-300"
                    >
                      {matchStatuses.map((status) => (
                        <option key={status} value={status} className="bg-slate-950 text-white">
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      </section>
    </main>
  );
}
