// Fetch node: this week's matchups (starters, points, bench). Takes week
// as an explicit argument rather than looking it up itself — call
// fetch-nfl-state first and pass the result in, so this node stays
// single-purpose.

const sleeperApi = require('../lib/sleeper-api');
const freshness = require('../lib/freshness');

async function fetchMatchups(leagueId, week) {
  const data = await sleeperApi.getMatchups(leagueId, week);
  return freshness.wrap('matchups', data);
}

module.exports = fetchMatchups;
