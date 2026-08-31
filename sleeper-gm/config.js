// Single source of truth for league identity and freshness rules.
// Nothing else in this project should hardcode a league_id or a freshness
// number — everything reads it from here.

const LEAGUE_ID = process.env.SLEEPER_LEAGUE_ID || '1369936246280826880';

// TARGET_ROSTER_ID is intentionally unset until scripts/diagnostics.js
// confirms which roster_id corresponds to "team 4" in this league. Decision
// nodes must not guess at this.
const TARGET_ROSTER_ID = process.env.SLEEPER_TARGET_ROSTER_ID
  ? Number(process.env.SLEEPER_TARGET_ROSTER_ID)
  : null;

// How old fetched data is allowed to be before a decision node must refuse
// to use it and re-fetch instead. Keyed per data type since some data moves
// faster (matchups during live games) than others (rosters).
const FRESHNESS_WINDOWS_MS = {
  rosters: 5 * 60 * 1000,
  users: 60 * 60 * 1000,
  matchups: 5 * 60 * 1000,
  transactions: 5 * 60 * 1000,
  trending: 15 * 60 * 1000,
  nflState: 60 * 60 * 1000
};

module.exports = {
  LEAGUE_ID,
  TARGET_ROSTER_ID,
  FRESHNESS_WINDOWS_MS
};
