// Raw Sleeper public API calls. Nothing in this file interprets, filters,
// or judges the data — it only fetches and returns JSON. Business logic of
// any kind belongs in a decision node, not here.

const SLEEPER_API = 'https://api.sleeper.app/v1';

async function sleeperGet(path) {
  const res = await fetch(SLEEPER_API + path);
  if (!res.ok) {
    throw new Error('Sleeper API ' + res.status + ' for ' + path);
  }
  return res.json();
}

function getLeague(leagueId) {
  return sleeperGet('/league/' + leagueId);
}

function getRosters(leagueId) {
  return sleeperGet('/league/' + leagueId + '/rosters');
}

function getUsers(leagueId) {
  return sleeperGet('/league/' + leagueId + '/users');
}

function getMatchups(leagueId, week) {
  return sleeperGet('/league/' + leagueId + '/matchups/' + week);
}

// `round` is Sleeper's term for this param but it lines up with week
// number for a standard regular-season schedule.
function getTransactions(leagueId, round) {
  return sleeperGet('/league/' + leagueId + '/transactions/' + round);
}

function getNflState() {
  return sleeperGet('/state/nfl');
}

function getTrending(type, lookbackHours, limit) {
  const params = new URLSearchParams({
    lookback_hours: String(lookbackHours || 24),
    limit: String(limit || 25)
  });
  return sleeperGet('/players/nfl/trending/' + type + '?' + params.toString());
}

module.exports = {
  getLeague,
  getRosters,
  getUsers,
  getMatchups,
  getTransactions,
  getNflState,
  getTrending
};
