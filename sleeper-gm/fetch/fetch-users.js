// Fetch node: league users (display names, team names, avatars). Needed to
// map a roster_id to a human-readable manager/team name.

const sleeperApi = require('../lib/sleeper-api');
const freshness = require('../lib/freshness');

async function fetchUsers(leagueId) {
  const data = await sleeperApi.getUsers(leagueId);
  return freshness.wrap('users', data);
}

module.exports = fetchUsers;
