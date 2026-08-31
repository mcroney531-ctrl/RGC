// Fetch node: waiver/free-agent/trade transactions for a given round
// (== week for a standard regular season). Same pattern as matchups — week
// is passed in, not looked up here.

const sleeperApi = require('../lib/sleeper-api');
const freshness = require('../lib/freshness');

async function fetchTransactions(leagueId, round) {
  const data = await sleeperApi.getTransactions(leagueId, round);
  return freshness.wrap('transactions', data);
}

module.exports = fetchTransactions;
