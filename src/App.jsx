import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toBlob } from 'html-to-image';
import {
  BarChart3,
  CalendarDays,
  LockKeyhole,
  LogIn,
  LogOut,
  MapPin,
  MessageCircle,
  MousePointerClick,
  RotateCcw,
  Save,
  Share2,
  Shield,
  Trophy,
  Users,
} from 'lucide-react';
import { isMatchVisibleInPublicCatalog, sortMatchesForPublicCatalog } from './lib/matchLifecycle';
import { supabase } from './lib/supabaseClient';
import AdminControl from './components/AdminControl';
import ShareStory from './components/ShareStory';

const categoryOrder = ['Goleiros', 'Defensores', 'Meio-campistas', 'Atacantes'];
const rankingPositions = ['GOL', 'LE', 'ZAG', 'LD', 'VOL', 'MC', 'PE', 'ATA', 'PD', 'ME', 'MD', 'ALA'];

const formationData = {
  '4-3-3': [[50, 91, 'GOL', 'gk'], [18, 72, 'LE', 'lb'], [39, 75, 'ZAG', 'cb1'], [61, 75, 'ZAG', 'cb2'], [82, 72, 'LD', 'rb'], [30, 52, 'MC', 'cm1'], [50, 58, 'VOL', 'cdm'], [70, 52, 'MC', 'cm2'], [20, 27, 'PE', 'lw'], [50, 20, 'ATA', 'st'], [80, 27, 'PD', 'rw']],
  '4-5-1': [[50, 91, 'GOL', 'gk'], [18, 72, 'LE', 'lb'], [39, 75, 'ZAG', 'cb1'], [61, 75, 'ZAG', 'cb2'], [82, 72, 'LD', 'rb'], [16, 49, 'ME', 'lm'], [35, 52, 'MC', 'cm1'], [50, 58, 'VOL', 'cdm'], [65, 52, 'MC', 'cm2'], [84, 49, 'MD', 'rm'], [50, 22, 'ATA', 'st']],
  '4-4-2': [[50, 91, 'GOL', 'gk'], [18, 72, 'LE', 'lb'], [39, 75, 'ZAG', 'cb1'], [61, 75, 'ZAG', 'cb2'], [82, 72, 'LD', 'rb'], [18, 50, 'ME', 'lm'], [41, 55, 'MC', 'cm1'], [59, 55, 'MC', 'cm2'], [82, 50, 'MD', 'rm'], [40, 23, 'ATA', 'st1'], [60, 23, 'ATA', 'st2']],
  '3-5-2': [[50, 91, 'GOL', 'gk'], [30, 73, 'ZAG', 'cb1'], [50, 78, 'ZAG', 'cb2'], [70, 73, 'ZAG', 'cb3'], [14, 50, 'ALA', 'lwb'], [35, 52, 'MC', 'cm1'], [50, 59, 'VOL', 'cdm'], [65, 52, 'MC', 'cm2'], [86, 50, 'ALA', 'rwb'], [40, 23, 'ATA', 'st1'], [60, 23, 'ATA', 'st2']],
};

const fallbackRankings = {
  formations: Object.keys(formationData).map((formation) => [formation, 0]),
  positions: Object.fromEntries(rankingPositions.map((position) => [position, []])),
};

const fallbackTeams = [
  { id: 'team-brazil', slug: 'brazil', name: 'Brasil', short_name: 'Brasil', fifa_code: 'BRA' },
  { id: 'team-morocco', slug: 'morocco', name: 'Marrocos', short_name: 'Marrocos', fifa_code: 'MAR' },
  { id: 'team-haiti', slug: 'haiti', name: 'Haiti', short_name: 'Haiti', fifa_code: 'HAI' },
  { id: 'team-scotland', slug: 'scotland', name: 'Escocia', short_name: 'Escocia', fifa_code: 'SCO' },
];

const fallbackPlayers = {
  'team-brazil': [
    { id: 'bra-alisson', name: 'Alisson', category: 'Goleiros' },
    { id: 'bra-ederson', name: 'Ederson', category: 'Goleiros' },
    { id: 'bra-weverton', name: 'Weverton', category: 'Goleiros' },
    { id: 'bra-alex-sandro', name: 'Alex Sandro', category: 'Defensores' },
    { id: 'bra-bremer', name: 'Bremer', category: 'Defensores' },
    { id: 'bra-danilo', name: 'Danilo', category: 'Defensores' },
    { id: 'bra-douglas-santos', name: 'Douglas Santos', category: 'Defensores' },
    { id: 'bra-gabriel-magalhaes', name: 'Gabriel Magalhaes', category: 'Defensores' },
    { id: 'bra-ibanez', name: 'Ibanez', category: 'Defensores' },
    { id: 'bra-leo-pereira', name: 'Leo Pereira', category: 'Defensores' },
    { id: 'bra-marquinhos', name: 'Marquinhos', category: 'Defensores' },
    { id: 'bra-wesley', name: 'Wesley', category: 'Defensores' },
    { id: 'bra-bruno-guimaraes', name: 'Bruno Guimaraes', category: 'Meio-campistas' },
    { id: 'bra-casemiro', name: 'Casemiro', category: 'Meio-campistas' },
    { id: 'bra-danilo-santos', name: 'Danilo Santos', category: 'Meio-campistas' },
    { id: 'bra-fabinho', name: 'Fabinho', category: 'Meio-campistas' },
    { id: 'bra-lucas-paqueta', name: 'Lucas Paqueta', category: 'Meio-campistas' },
    { id: 'bra-endrick', name: 'Endrick', category: 'Atacantes' },
    { id: 'bra-gabriel-martinelli', name: 'Gabriel Martinelli', category: 'Atacantes' },
    { id: 'bra-igor-thiago', name: 'Igor Thiago', category: 'Atacantes' },
    { id: 'bra-luiz-henrique', name: 'Luiz Henrique', category: 'Atacantes' },
    { id: 'bra-matheus-cunha', name: 'Matheus Cunha', category: 'Atacantes' },
    { id: 'bra-neymar-junior', name: 'Neymar Junior', category: 'Atacantes' },
    { id: 'bra-raphinha', name: 'Raphinha', category: 'Atacantes' },
    { id: 'bra-rayan', name: 'Rayan', category: 'Atacantes' },
    { id: 'bra-vinicius-junior', name: 'Vinicius Junior', category: 'Atacantes' },
  ],
};

const fallbackMatches = [
  {
    id: 'match-bra-mar-2026-06-13',
    slug: 'brazil-vs-morocco-2026-06-13',
    home_team_id: 'team-brazil',
    away_team_id: 'team-morocco',
    competition_name: 'FIFA World Cup 2026',
    competition_stage: 'Grupo C',
    venue_name: 'New York New Jersey Stadium',
    venue_city: 'East Rutherford, Estados Unidos',
    match_at: '2026-06-13T22:00:00Z',
    status: 'scheduled',
  },
  {
    id: 'match-bra-hai-2026-06-19',
    slug: 'brazil-vs-haiti-2026-06-19',
    home_team_id: 'team-brazil',
    away_team_id: 'team-haiti',
    competition_name: 'FIFA World Cup 2026',
    competition_stage: 'Grupo C',
    venue_name: 'Philadelphia Stadium',
    venue_city: 'Philadelphia, Estados Unidos',
    match_at: '2026-06-20T00:30:00Z',
    status: 'scheduled',
  },
  {
    id: 'match-sco-bra-2026-06-24',
    slug: 'scotland-vs-brazil-2026-06-24',
    home_team_id: 'team-scotland',
    away_team_id: 'team-brazil',
    competition_name: 'FIFA World Cup 2026',
    competition_stage: 'Grupo C',
    venue_name: 'Miami Stadium',
    venue_city: 'Miami Gardens, Estados Unidos',
    match_at: '2026-06-24T22:00:00Z',
    status: 'scheduled',
  },
];

const toPosition = ([x, y, label, id]) => ({ x, y, label, id });
const fallbackTeamSlugById = Object.fromEntries(fallbackTeams.map((team) => [team.id, team.slug]));

function buildFallbackCatalog() {
  return {
    teams: fallbackTeams,
    playersByTeam: fallbackPlayers,
    matches: fallbackMatches,
  };
}

function mapFallbackMatchesToTeams(teamRows) {
  const teamsBySlug = Object.fromEntries(teamRows.map((team) => [team.slug, team]));
  return fallbackMatches.map((match) => ({
    ...match,
    home_team_id: teamsBySlug[fallbackTeamSlugById[match.home_team_id]]?.id || match.home_team_id,
    away_team_id: teamsBySlug[fallbackTeamSlugById[match.away_team_id]]?.id || match.away_team_id,
  }));
}

function emptyPositionsRanking() {
  return Object.fromEntries(rankingPositions.map((position) => [position, []]));
}

function buildRankingData(formationRows = [], playerRows = []) {
  const formationVotes = new Map(formationRows.map((row) => [row.formation, Number(row.votes || 0)]));
  const next = {
    formations: Object.keys(formationData)
      .map((formation) => [formation, formationVotes.get(formation) || 0])
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
    positions: emptyPositionsRanking(),
  };

  playerRows.forEach((row) => {
    if (!next.positions[row.position]) next.positions[row.position] = [];
    next.positions[row.position].push([row.player_name, Number(row.votes || 0)]);
  });

  Object.keys(next.positions).forEach((position) => {
    next.positions[position] = next.positions[position]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 3);
  });

  return next;
}

function groupPlayersByTeam(playerRows = []) {
  return playerRows.reduce((accumulator, row) => {
    const teamId = row.team_id;
    if (!teamId) return accumulator;
    if (!accumulator[teamId]) accumulator[teamId] = [];
    accumulator[teamId].push({
      id: row.id,
      name: row.name,
      category: row.category,
      sort_order: row.sort_order || 0,
    });
    return accumulator;
  }, {});
}

function groupPlayersForDisplay(players = [], selectedSet) {
  return categoryOrder.map((category) => ({
    category,
    players: players
      .filter((player) => player.category === category && !selectedSet.has(player.name))
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0) || a.name.localeCompare(b.name)),
  }));
}

function initials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function userName(user) {
  return user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Torcedor';
}

function formatVotes(votes) {
  return Number(votes || 0).toLocaleString('pt-BR');
}

function formatMatchDateTime(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(value));
}

function formatShortMatchDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(value));
}

function normalizePathname(pathname) {
  const normalized = String(pathname || '').replace(/\/+$/, '');
  return normalized || '/';
}

function buildMatchLabel(match, teamsById) {
  if (!match) return 'Sem jogo selecionado';
  const home = teamsById[match.home_team_id]?.short_name || 'Mandante';
  const away = teamsById[match.away_team_id]?.short_name || 'Visitante';
  return `${home} x ${away}`;
}

function buildShareText(team, match, teamsById) {
  const teamName = team?.name || 'minha selecao';
  const matchLabel = buildMatchLabel(match, teamsById);
  return `Minha escalacao de ${teamName} para ${matchLabel} no Escale Sua Selecao: ${window.location.origin}`;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

async function shareImageOrDownload(cardElement, team, match, teamsById) {
  const text = buildShareText(team, match, teamsById);
  const blob = await toBlob(cardElement, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#020617',
  });

  if (!blob) throw new Error('Nao foi possivel gerar a imagem.');

  const file = new File([blob], 'minha-escalacao-escaleselecao.png', { type: 'image/png' });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title: 'Escale Sua Selecao',
      text,
      url: window.location.origin,
      files: [file],
    });
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
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [formation, setFormation] = useState('4-3-3');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [lineup, setLineup] = useState({});
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState('');
  const [rankingData, setRankingData] = useState(fallbackRankings);
  const [rankingStatus, setRankingStatus] = useState('');
  const [teams, setTeams] = useState(fallbackTeams);
  const [playersByTeam, setPlayersByTeam] = useState(fallbackPlayers);
  const [matches, setMatches] = useState(fallbackMatches);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [selectedTeamId, setSelectedTeamId] = useState('team-brazil');
  const [selectedMatchId, setSelectedMatchId] = useState('match-bra-mar-2026-06-13');
  const [catalogStatus, setCatalogStatus] = useState('');
  const [usingFallbackCatalog, setUsingFallbackCatalog] = useState(true);

  useEffect(() => {
    loadCatalog();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);

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

  const teamsById = useMemo(() => Object.fromEntries(teams.map((team) => [team.id, team])), [teams]);
  const currentTeam = useMemo(() => teams.find((team) => team.id === selectedTeamId) || teams[0] || null, [selectedTeamId, teams]);
  const currentPlayers = useMemo(() => playersByTeam[selectedTeamId] || [], [playersByTeam, selectedTeamId]);
  const teamMatches = useMemo(
    () =>
      matches
        .filter((match) => isMatchVisibleInPublicCatalog(match, nowMs))
        .filter((match) => match.home_team_id === selectedTeamId || match.away_team_id === selectedTeamId)
        .sort(sortMatchesForPublicCatalog),
    [matches, nowMs, selectedTeamId]
  );
  const currentMatch = useMemo(
    () => teamMatches.find((match) => match.id === selectedMatchId) || teamMatches[0] || null,
    [selectedMatchId, teamMatches]
  );
  const isControlRoute = useMemo(() => normalizePathname(window.location.pathname) === '/controle', []);
  const nextMatch = teamMatches[0] || null;
  const positions = useMemo(() => formationData[formation].map(toPosition), [formation]);
  const selectedPlayers = useMemo(() => Object.values(lineup).filter(Boolean), [lineup]);
  const selectedSet = useMemo(() => new Set(selectedPlayers), [selectedPlayers]);
  const availablePlayers = useMemo(() => groupPlayersForDisplay(currentPlayers, selectedSet), [currentPlayers, selectedSet]);
  const complete = selectedPlayers.length === 11;
  const hasRoster = currentPlayers.length > 0;
  const activeMatchLabel = buildMatchLabel(currentMatch, teamsById);

  useEffect(() => {
    if (!teamMatches.length) {
      setSelectedMatchId('');
      return;
    }

    const alreadySelected = teamMatches.some((match) => match.id === selectedMatchId);
    if (!alreadySelected) setSelectedMatchId(teamMatches[0].id);
  }, [selectedMatchId, teamMatches]);

  useEffect(() => {
    if (user && selectedTeamId && selectedMatchId) loadRankings(selectedTeamId, selectedMatchId);
    if (!selectedTeamId || !selectedMatchId) {
      setRankingData(fallbackRankings);
      setRankingStatus('');
    }
  }, [user, selectedMatchId, selectedTeamId]);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    loadOwnProfile(user.id);
  }, [user]);

  async function loadCatalog() {
    setCatalogStatus('Carregando selecoes, jogadores e jogos...');

    const [{ data: teamRows, error: teamsError }, { data: playerRows, error: playersError }, { data: matchRows, error: matchesError }] = await Promise.all([
      supabase.from('national_teams').select('id, slug, name, short_name, fifa_code').eq('is_active', true).order('name'),
      supabase.from('team_players').select('id, team_id, name, category, sort_order').eq('is_active', true).order('sort_order').order('name'),
      supabase
        .from('matches')
        .select('id, slug, home_team_id, away_team_id, competition_name, competition_stage, venue_name, venue_city, match_at, status, featured_rank')
        .order('match_at'),
    ]);

    if (teamsError || playersError || matchesError) {
      const fallbackCatalog = buildFallbackCatalog();
      setTeams(fallbackCatalog.teams);
      setPlayersByTeam(fallbackCatalog.playersByTeam);
      setMatches(fallbackCatalog.matches);
      setSelectedTeamId('team-brazil');
      setSelectedMatchId('match-bra-mar-2026-06-13');
      setUsingFallbackCatalog(true);
      setCatalogStatus('Usando dados locais de apoio. Rode o novo schema no Supabase para liberar o cadastro dinamico de selecoes e jogos.');
      return;
    }

    const teamData = teamRows?.length ? teamRows : fallbackTeams;
    const groupedPlayers = groupPlayersByTeam(playerRows || []);
    const brazilTeam = teamData.find((team) => team.slug === 'brazil');
    const usedFallbackTeams = !teamRows?.length;
    const usedFallbackMatches = !matchRows?.length;
    const usedFallbackBrazilRoster = Boolean(brazilTeam) && !groupedPlayers[brazilTeam.id]?.length;

    if (usedFallbackBrazilRoster) {
      groupedPlayers[brazilTeam.id] = fallbackPlayers['team-brazil'];
    }

    const nextMatches = matchRows?.length ? matchRows : mapFallbackMatchesToTeams(teamData);
    const visibleMatches = nextMatches.filter((match) => isMatchVisibleInPublicCatalog(match, nowMs)).sort(sortMatchesForPublicCatalog);
    const defaultTeam = teamData.find((team) => team.slug === 'brazil') || teamData[0] || null;
    const defaultMatch =
      visibleMatches.find((match) => match.home_team_id === defaultTeam?.id || match.away_team_id === defaultTeam?.id) || visibleMatches[0] || null;

    setTeams(teamData);
    setPlayersByTeam(groupedPlayers);
    setMatches(nextMatches);
    setSelectedTeamId(defaultTeam?.id || '');
    setSelectedMatchId(defaultMatch?.id || '');
    setUsingFallbackCatalog(usedFallbackTeams || usedFallbackMatches || usedFallbackBrazilRoster);
    setCatalogStatus(
      usedFallbackTeams || usedFallbackMatches || usedFallbackBrazilRoster
        ? 'Parte do catalogo foi completada com dados locais de apoio. Rode o novo schema no Supabase para centralizar selecoes, jogadores e jogos.'
        : ''
    );
  }

  async function loadOwnProfile(userId) {
    setProfileLoading(true);

    const { data, error } = await supabase.from('profiles').select('id, name, email, is_admin').eq('id', userId).maybeSingle();

    if (error) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    setProfile(data || null);
    setProfileLoading(false);
  }

  async function loadRankings(teamId, matchId) {
    setRankingStatus('Carregando ranking...');

    const [{ data: formationRows, error: formationError }, { data: playerRows, error: playerError }] = await Promise.all([
      supabase.from('ranking_formations').select('formation, votes').eq('team_id', teamId).eq('match_id', matchId),
      supabase.from('ranking_players_by_position').select('position, player_name, votes').eq('team_id', teamId).eq('match_id', matchId),
    ]);

    if (formationError || playerError) {
      setRankingData(fallbackRankings);
      setRankingStatus(`Nao foi possivel carregar o ranking: ${(formationError || playerError).message}`);
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

  function handleTeamChange(teamId) {
    setSelectedTeamId(teamId);
    setSelectedMatchId('');
    resetLineup();
  }

  function handleMatchChange(matchId) {
    setSelectedMatchId(matchId);
    resetLineup();
  }

  async function saveLineup() {
    if (!user) {
      setStatus('Faca login para salvar seu voto e compartilhar sua escalacao.');
      setAuthOpen(true);
      return;
    }

    if (!complete || !currentTeam || !currentMatch) return;

    setStatus('Salvando escalacao...');

    const { error: deleteError } = await supabase
      .from('lineups')
      .delete()
      .eq('user_id', user.id)
      .eq('team_id', currentTeam.id)
      .eq('match_id', currentMatch.id);

    if (deleteError) {
      setStatus(`Nao foi possivel atualizar seu voto anterior: ${deleteError.message}`);
      return;
    }

    const { data, error } = await supabase
      .from('lineups')
      .insert({
        user_id: user.id,
        team_id: currentTeam.id,
        match_id: currentMatch.id,
        formation,
      })
      .select('id')
      .single();

    if (error) {
      setStatus(`Erro ao salvar: ${error.message}`);
      return;
    }

    const rows = positions.map((position) => ({
      lineup_id: data.id,
      position: position.label,
      position_id: position.id,
      player_name: lineup[position.id],
    }));

    const { error: playersError } = await supabase.from('lineup_players').insert(rows);
    if (playersError) {
      setStatus(`Escalacao criada, mas os jogadores nao foram salvos: ${playersError.message}`);
      return;
    }

    setSaved(true);
    setStatus(`Escalacao salva para ${activeMatchLabel}. Seu voto entrou no ranking.`);
    await loadRankings(currentTeam.id, currentMatch.id);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSaved(false);
    setRankingData(fallbackRankings);
  }

  if (isControlRoute) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <AdminControl
          user={user}
          profile={profile}
          profileLoading={profileLoading}
          openAuth={() => setAuthOpen(true)}
          signOut={signOut}
          refreshPublicCatalog={loadCatalog}
        />
        {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onSuccess={() => setAuthOpen(false)} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header
        page={page}
        setPage={setPage}
        user={user}
        signOut={signOut}
        openAuth={() => setAuthOpen(true)}
        count={selectedPlayers.length}
        formation={formation}
        team={currentTeam}
        match={currentMatch}
        teamsById={teamsById}
      />

      {page === 'escale' ? (
        <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[370px_1fr] md:px-8">
          <aside className="space-y-5">
            <Panel title="Selecao" subtitle="Escolha qual equipe voce quer escalar.">
              <div className="space-y-3">
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2">
                  <select
                    value={selectedTeamId}
                    onChange={(event) => handleTeamChange(event.target.value)}
                    className="w-full bg-transparent text-sm font-black outline-none"
                  >
                    {teams.map((team) => {
                      const rosterCount = playersByTeam[team.id]?.length || 0;
                      return (
                        <option key={team.id} value={team.id} className="bg-slate-950 text-white">
                          {team.name}{rosterCount ? '' : ' - sem elenco'}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="rounded-2xl bg-slate-900 px-4 py-3 text-sm text-slate-200">
                  <div className="flex items-center gap-2 font-bold">
                    <Shield size={16} />
                    {currentTeam?.name || 'Selecao'}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    {hasRoster ? `${currentPlayers.length} jogadores cadastrados para escalar.` : 'Ainda nao ha jogadores cadastrados para esta selecao.'}
                  </div>
                </div>
              </div>
            </Panel>

            <Panel title="Formacao">
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(formationData).map((item) => (
                  <button
                    key={item}
                    onClick={() => resetLineup(item)}
                    className={`rounded-2xl px-4 py-3 text-sm font-black transition ${formation === item ? 'bg-yellow-400 text-slate-950' : 'bg-slate-900 text-slate-200 hover:bg-slate-800'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </Panel>

            <Panel
              title="Jogadores"
              subtitle={selectedPlayer ? `Selecionado: ${selectedPlayer}` : 'Clique em um jogador para escalar.'}
              action={
                <button onClick={() => resetLineup()} className="rounded-xl bg-slate-900 p-2 text-slate-200 hover:bg-slate-800">
                  <RotateCcw size={18} />
                </button>
              }
            >
              {!hasRoster ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">
                  Esta selecao ainda nao tem elenco cadastrado no Supabase.
                </div>
              ) : (
                <div className="max-h-[620px] space-y-4 overflow-auto pr-1">
                  {availablePlayers.map(({ category, players: categoryPlayers }) => (
                    <div key={category}>
                      <h3 className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-yellow-300">{category}</h3>
                      {categoryPlayers.length ? (
                        <div className="grid grid-cols-2 gap-2">
                          {categoryPlayers.map((player) => (
                            <button
                              key={player.id}
                              onClick={() => setSelectedPlayer(player.name)}
                              className={`rounded-2xl border px-3 py-2 text-left text-sm font-bold transition ${selectedPlayer === player.name ? 'border-yellow-300 bg-yellow-300 text-slate-950' : 'border-white/10 bg-slate-900 text-slate-100 hover:border-yellow-300/60 hover:bg-slate-800'}`}
                            >
                              {player.name}
                              <span className="mt-1 block text-[10px] font-medium opacity-70">{player.category}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">Todos os jogadores desta faixa ja estao em campo.</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <UpcomingMatchesPanel
              team={currentTeam}
              teamsById={teamsById}
              nextMatch={nextMatch}
              currentMatch={currentMatch}
              matches={teamMatches}
              onSelectMatch={handleMatchChange}
              catalogStatus={catalogStatus}
              usingFallbackCatalog={usingFallbackCatalog}
            />
          </aside>

          <div className="space-y-6">
            <Field
              team={currentTeam}
              match={currentMatch}
              teamsById={teamsById}
              positions={positions}
              lineup={lineup}
              selectedPlayer={selectedPlayer}
              formation={formation}
              clickPosition={clickPosition}
              removePlayer={removePlayer}
            />
            <LineupPanel
              team={currentTeam}
              match={currentMatch}
              teamsById={teamsById}
              positions={positions}
              lineup={lineup}
              formation={formation}
              complete={complete}
              saved={saved}
              logged={Boolean(user)}
              openAuth={() => setAuthOpen(true)}
              status={status}
              saveLineup={saveLineup}
              setStatus={setStatus}
            />
          </div>
        </main>
      ) : (
        <RankingPage
          logged={Boolean(user)}
          openAuth={() => setAuthOpen(true)}
          setPage={setPage}
          rankingData={rankingData}
          rankingStatus={rankingStatus}
          reload={() => currentTeam && currentMatch && loadRankings(currentTeam.id, currentMatch.id)}
          team={currentTeam}
          match={currentMatch}
          teamsById={teamsById}
        />
      )}

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onSuccess={() => setAuthOpen(false)} />}
    </div>
  );
}

function Header({ page, setPage, user, signOut, openAuth, count, formation, team, match, teamsById }) {
  return (
    <header className="border-b border-white/10 bg-slate-950/90 px-4 py-5 backdrop-blur md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-yellow-400 px-3 py-1 text-xs font-black uppercase tracking-[0.25em] text-slate-950">
            <Trophy size={14} />
            Selecao Oficial
          </div>
          <h1 className="text-3xl font-black tracking-tight md:text-5xl">Escale sua Selecao</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">
            Monte sua selecao para o proximo jogo, salve seu voto e compare com os jogadores mais escalados.
          </p>
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPage('escale')}
              className={`rounded-2xl px-4 py-2 text-sm font-black transition ${page === 'escale' ? 'bg-yellow-400 text-slate-950' : 'bg-white/10 text-white hover:bg-white/15'}`}
            >
              Escalar
            </button>
            <button
              onClick={() => setPage('ranking')}
              className={`rounded-2xl px-4 py-2 text-sm font-black transition ${page === 'ranking' ? 'bg-yellow-400 text-slate-950' : 'bg-white/10 text-white hover:bg-white/15'}`}
            >
              Mais escalados
            </button>
            {user ? (
              <button onClick={signOut} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-black text-slate-200 hover:bg-slate-800">
                <LogOut size={16} />
                Sair de {userName(user).split(' ')[0]}
              </button>
            ) : (
              <button onClick={openAuth} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-black text-slate-950 hover:bg-emerald-400">
                <LogIn size={16} />
                Entrar
              </button>
            )}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            <div className="flex items-center gap-2 font-bold">
              <Users size={18} />
              {count}/11 escalados
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Formacao atual: <strong className="text-yellow-300">{formation}</strong>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Time: <strong className="text-slate-100">{team?.name || 'Selecao'}</strong>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Jogo: <strong className="text-slate-100">{buildMatchLabel(match, teamsById)}</strong>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function Panel({ title, subtitle, action, children }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black">{title}</h2>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function UpcomingMatchesPanel({ team, teamsById, nextMatch, currentMatch, matches, onSelectMatch, catalogStatus, usingFallbackCatalog }) {
  if (!team) return null;

  return (
    <Panel title="Proximo jogo" subtitle="Use esta area para escolher o confronto que vai receber a sua escalacao.">
      {nextMatch ? (
        <div className="space-y-3">
          <button
            onClick={() => onSelectMatch(nextMatch.id)}
            className={`w-full rounded-[1.75rem] border px-4 py-4 text-left transition ${currentMatch?.id === nextMatch.id ? 'border-yellow-300 bg-yellow-300/10' : 'border-white/10 bg-slate-950/70 hover:border-yellow-300/50'}`}
          >
            <div className="inline-flex items-center rounded-full bg-yellow-400 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-slate-950">
              Proximo jogo
            </div>
            <div className="mt-3 text-xl font-black">{buildMatchLabel(nextMatch, teamsById)}</div>
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-300">
              <CalendarDays size={15} />
              {formatMatchDateTime(nextMatch.match_at)}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
              <MapPin size={14} />
              {nextMatch.venue_name} - {nextMatch.venue_city}
            </div>
            <div className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
              {nextMatch.competition_name} {nextMatch.competition_stage ? `- ${nextMatch.competition_stage}` : ''}
            </div>
          </button>

          {matches.length > 1 && (
            <div className="space-y-2">
              <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Outros jogos cadastrados</div>
              {matches.slice(1).map((match) => {
                return (
                  <button
                    key={match.id}
                    onClick={() => onSelectMatch(match.id)}
                    className={`w-full rounded-2xl border px-3 py-3 text-left transition ${currentMatch?.id === match.id ? 'border-yellow-300 bg-yellow-300/10' : 'border-white/10 bg-slate-950/60 hover:border-white/20 hover:bg-slate-900'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-black">{buildMatchLabel(match, teamsById)}</div>
                        <div className="mt-1 text-xs text-slate-400">{formatShortMatchDate(match.match_at)}</div>
                      </div>
                      <div className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-300">
                        {match.competition_stage || 'Agenda'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">
          Ainda nao ha jogos futuros cadastrados para {team.name}.
        </div>
      )}

      {catalogStatus && (
        <div className="mt-4 rounded-2xl border border-sky-300/20 bg-sky-300/10 p-3 text-xs font-bold text-sky-100">
          {catalogStatus}
        </div>
      )}

      {usingFallbackCatalog && (
        <div className="mt-3 text-[11px] text-slate-500">
          Os jogos exibidos aqui usam um fallback local ate o novo cadastro ser aplicado no Supabase.
        </div>
      )}
    </Panel>
  );
}

function Field({ team, match, teamsById, positions, lineup, selectedPlayer, formation, clickPosition, removePlayer }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-2xl md:p-5">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black">Campo</h2>
          <p className="text-sm text-slate-400">
            Monte {team?.name || 'sua selecao'} no esquema {formation} para {buildMatchLabel(match, teamsById)}.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300">
          <MousePointerClick size={16} />
          Clique na posicao para colocar o jogador
        </div>
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
              onClick={() => (player ? removePlayer(position.id) : clickPosition(position.id))}
              className={`absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-2xl border px-2 py-2 text-center shadow-xl transition-colors md:min-w-28 md:px-3 ${player ? 'border-yellow-300 bg-slate-950 text-white' : selectedPlayer ? 'border-yellow-300 bg-yellow-300 text-slate-950 hover:bg-yellow-200' : 'border-white/40 bg-white/15 text-white hover:bg-white/25'}`}
              style={{ left: `${position.x}%`, top: `${position.y}%` }}
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black md:h-12 md:w-12 ${player ? 'bg-yellow-400 text-slate-950' : 'bg-slate-950/80 text-white'}`}>
                {player ? initials(player) : position.label}
              </span>
              <span className="max-w-24 truncate text-xs font-black md:max-w-28 md:text-sm">{player || position.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function LineupPanel({ team, match, teamsById, positions, lineup, formation, complete, saved, logged, openAuth, status, saveLineup, setStatus }) {
  const storyRef = useRef(null);

  function requireLogin(actionLabel) {
    if (logged) return true;
    setStatus(`Faca login para ${actionLabel} sua escalacao.`);
    openAuth();
    return false;
  }

  async function handleShareStory() {
    if (!complete || !storyRef.current || !team || !match) return;
    if (!requireLogin('compartilhar')) return;
    setStatus('Gerando imagem para compartilhar...');
    try {
      setStatus(await shareImageOrDownload(storyRef.current, team, match, teamsById));
    } catch (error) {
      setStatus(`Nao foi possivel gerar a imagem: ${error.message}`);
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950 p-4">
      <div className="pointer-events-none fixed -left-[9999px] top-0 opacity-0">
        <div ref={storyRef}>
          <ShareStory
            team={team}
            formation={formation}
            positions={positions}
            lineup={lineup}
            matchLabel={buildMatchLabel(match, teamsById)}
            matchDateLabel={formatMatchDateTime(match?.match_at)}
          />
        </div>
      </div>

      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-black">Minha escalacao</h3>
          <p className="text-xs text-slate-400">
            {saved
              ? `Escalacao salva para ${buildMatchLabel(match, teamsById)}.`
              : logged
                ? 'Complete os 11 jogadores para salvar e compartilhar.'
                : 'Complete os 11 jogadores e faca login para salvar e compartilhar.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={saveLineup}
            disabled={!complete || !match || !team}
            className="inline-flex items-center gap-2 rounded-2xl bg-yellow-400 px-4 py-2 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save size={16} />
            Salvar voto
          </button>
          <button
            onClick={handleShareStory}
            disabled={!complete || !match || !team}
            className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-black text-white hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Share2 size={16} />
            Compartilhar imagem
          </button>
        </div>
      </div>

      {match && (
        <div className="mb-4 grid gap-2 rounded-3xl border border-white/10 bg-white/5 p-4 md:grid-cols-3">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Jogo</div>
            <div className="mt-1 text-sm font-bold text-slate-100">{buildMatchLabel(match, teamsById)}</div>
          </div>
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Data</div>
            <div className="mt-1 text-sm font-bold text-slate-100">{formatMatchDateTime(match.match_at)}</div>
          </div>
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Competicao</div>
            <div className="mt-1 text-sm font-bold text-slate-100">
              {match.competition_name} {match.competition_stage ? `- ${match.competition_stage}` : ''}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        {positions.map((position) => (
          <div key={position.id} className="rounded-2xl bg-white/5 px-3 py-2 text-sm">
            <span className="font-black text-yellow-300">{position.label}</span>
            <span className="mx-2 text-slate-500">•</span>
            <span className="font-bold text-slate-100">{lineup[position.id] || 'Em aberto'}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-3">
        <button
          onClick={() => {
            if (!requireLogin('compartilhar')) return;
            window.open(`https://wa.me/?text=${encodeURIComponent(buildShareText(team, match, teamsById))}`, '_blank', 'noopener,noreferrer');
          }}
          disabled={!complete || !match || !team}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-black text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <MessageCircle size={18} />
          WhatsApp
        </button>
        <button
          onClick={handleShareStory}
          disabled={!complete || !match || !team}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-pink-500 px-4 py-3 text-sm font-black text-white hover:bg-pink-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Share2 size={18} />
          Story
        </button>
        <button
          onClick={() => {
            if (!requireLogin('compartilhar')) return;
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`, '_blank', 'noopener,noreferrer');
          }}
          disabled={!complete || !match || !team}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-4 py-3 text-sm font-black text-white hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Share2 size={18} />
          Facebook
        </button>
      </div>

      {status && <div className="mt-4 whitespace-pre-wrap rounded-2xl border border-yellow-300/30 bg-yellow-300/10 p-3 text-xs font-bold text-yellow-100">{status}</div>}
    </section>
  );
}

function RankingPage({ logged, openAuth, setPage, rankingData, rankingStatus, reload, team, match, teamsById }) {
  if (!logged) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <section className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-yellow-400 text-slate-950">
            <LockKeyhole size={30} />
          </div>
          <h2 className="text-3xl font-black">Ranking bloqueado</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Para ver quem a galera mais escala em {buildMatchLabel(match, teamsById)}, faca login primeiro.
          </p>
          <button onClick={openAuth} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-yellow-400 px-6 py-3 text-sm font-black text-slate-950 hover:bg-yellow-300">
            <LogIn size={18} />
            Fazer login para ver ranking
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
      <section className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-slate-950">
              <BarChart3 size={14} />
              Ranking real
            </div>
            <h2 className="text-3xl font-black md:text-4xl">Mais escalados</h2>
            <p className="mt-2 text-slate-300">
              Ranking de {team?.name || 'uma selecao'} para {buildMatchLabel(match, teamsById)}.
            </p>
            {match && (
              <p className="mt-2 text-sm text-slate-400">
                {formatMatchDateTime(match.match_at)} - {match.venue_name}
              </p>
            )}
            {rankingStatus && <p className="mt-2 text-sm font-bold text-yellow-200">{rankingStatus}</p>}
          </div>
          <div className="flex gap-2">
            <button onClick={reload} className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-black text-white hover:bg-white/15">
              Atualizar
            </button>
            <button onClick={() => setPage('escale')} className="rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-yellow-300">
              Montar minha selecao
            </button>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl">
            <h3 className="mb-4 text-xl font-black">Formacoes mais usadas</h3>
            <div className="space-y-3">
              {rankingData.formations.map((item, index) => (
                <RankingBar
                  key={item[0]}
                  label={item[0]}
                  votes={item[1]}
                  max={Math.max(rankingData.formations[0]?.[1] || 1, 1)}
                  index={index}
                  color="bg-yellow-400"
                />
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl">
            <h3 className="mb-4 text-xl font-black">Jogadores por posicao</h3>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Object.entries(rankingData.positions).map(([position, items]) => (
                <div key={position} className="rounded-3xl bg-slate-950 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-lg font-black text-yellow-300">{position}</h4>
                    <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-black uppercase text-slate-400">Top 3</span>
                  </div>
                  <div className="space-y-3">
                    {items.length ? (
                      items.map((item, index) => (
                        <RankingBar
                          key={item[0]}
                          label={item[0]}
                          votes={item[1]}
                          max={Math.max(items[0]?.[1] || 1, 1)}
                          index={index}
                          compact
                          color="bg-emerald-400"
                        />
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">Sem votos ainda.</p>
                    )}
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
      ? await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { name: form.name }, emailRedirectTo: window.location.origin },
        })
      : await supabase.auth.signInWithPassword({ email: form.email, password: form.password });

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) setMessage(error.message);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">{register ? 'Criar cadastro' : 'Entrar'}</h2>
            <p className="mt-1 text-sm text-slate-400">
              {register ? 'Cadastre nome, e-mail e senha para salvar seus votos por jogo.' : 'Entre para salvar voto e liberar o ranking.'}
            </p>
          </div>
          <button onClick={onClose} className="rounded-xl bg-white/10 px-3 py-2 text-sm font-black hover:bg-white/15">
            X
          </button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          {register && (
            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-yellow-300"
              placeholder="Seu nome"
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
              required
            />
          )}
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-yellow-300"
            placeholder="Seu e-mail"
            type="email"
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
            required
          />
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-yellow-300"
            placeholder="Senha"
            type="password"
            value={form.password}
            onChange={(event) => update('password', event.target.value)}
            required
          />
          <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-yellow-300">
            <LogIn size={18} />
            {register ? 'Criar cadastro e entrar' : 'Entrar e continuar'}
          </button>
        </form>
        <button onClick={loginWithGoogle} className="mt-3 w-full rounded-2xl bg-white/10 px-5 py-3 text-sm font-black text-white hover:bg-white/15">
          Entrar com Google
        </button>
        <button
          onClick={() => {
            setMode(register ? 'login' : 'register');
            setMessage('');
          }}
          className="mt-4 w-full rounded-2xl border border-white/10 px-5 py-3 text-sm font-black text-slate-200 hover:bg-white/5"
        >
          {register ? 'Ja tenho conta' : 'Criar uma conta'}
        </button>
        {message && <p className="mt-4 rounded-2xl border border-yellow-300/30 bg-yellow-300/10 p-3 text-xs font-bold text-yellow-100">{message}</p>}
      </div>
    </div>
  );
}
