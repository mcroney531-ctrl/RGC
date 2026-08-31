// Fetch node: rosters. This also carries the standings basis (wins,
// losses, points_for/against live in roster.settings) — Sleeper has no
// separate standings endpoint, so a standalone "fetch-standings" node
// would just be calling this same endpoint a second time. Decision nodes
// that need standings read them from here.

const sleeperApi = require('../lib/sleeper-api');
const freshness = require('../lib/freshness');

async function fetchRosters(leagueId) {
  const data = await sleeperApi.getRosters(leagueId);
  return freshness.wrap('rosters', data);
}

module.exports = fetchRosters;
