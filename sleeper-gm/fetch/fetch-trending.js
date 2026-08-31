// Fetch node: trending adds/drops league-wide on Sleeper (not scoped to
// this league — it's a global signal used as one input to waiver logic).

const sleeperApi = require('../lib/sleeper-api');
const freshness = require('../lib/freshness');

async function fetchTrending(type, lookbackHours, limit) {
  const data = await sleeperApi.getTrending(type, lookbackHours, limit);
  return freshness.wrap('trending', data);
}

module.exports = fetchTrending;
