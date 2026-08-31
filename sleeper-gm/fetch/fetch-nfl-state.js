// Fetch node: current NFL week/season. Other fetch nodes (matchups,
// transactions) need "what week is it" as an input — this is where that
// comes from, so nothing downstream hardcodes a week number.

const sleeperApi = require('../lib/sleeper-api');
const freshness = require('../lib/freshness');

async function fetchNflState() {
  const data = await sleeperApi.getNflState();
  return freshness.wrap('nflState', data);
}

module.exports = fetchNflState;
