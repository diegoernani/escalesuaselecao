export const AUTO_COMPLETE_GRACE_HOURS = 6;

export function matchTimestamp(value) {
  return new Date(value).getTime();
}

export function matchAutoCompleteDeadline(match) {
  return matchTimestamp(match?.match_at) + AUTO_COMPLETE_GRACE_HOURS * 60 * 60 * 1000;
}

export function isMatchAutomaticallyFinished(match, nowMs = Date.now()) {
  if (!match?.match_at) return false;
  return match?.status === 'scheduled' && matchAutoCompleteDeadline(match) <= nowMs;
}

export function isMatchVisibleInPublicCatalog(match, nowMs = Date.now()) {
  if (!match) return false;
  if (match.status !== 'scheduled') return false;
  return !isMatchAutomaticallyFinished(match, nowMs);
}

export function matchEffectiveStatus(match, nowMs = Date.now()) {
  if (!match) return 'unknown';
  if (isMatchAutomaticallyFinished(match, nowMs)) return 'auto-completed';
  return match.status;
}

export function sortMatchesForPublicCatalog(a, b) {
  return matchTimestamp(a.match_at) - matchTimestamp(b.match_at) || Number(a.featured_rank || 0) - Number(b.featured_rank || 0);
}
