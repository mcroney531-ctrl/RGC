// One-shot verification script — not part of the eventual DAG. Run this
// once (via the GitHub Actions workflow, since this dev sandbox can't
// reach api.sleeper.app) to prove Phase 1 fetch nodes work against the
// real league, confirm polling stays cheap, and print a roster_id ->
// owner_id -> team name table so we can pin down the target roster.

const config = require('../config');
const fetchNflState = require('../fetch/fetch-nfl-state');
const fetchRosters = require('../fetch/fetch-rosters');
const fetchUsers = require('../fetch/fetch-users');
const fetchMatchups = require('../fetch/fetch-matchups');
const fetchTransactions = require('../fetch/fetch-transactions');
const fetchTrending = require('../fetch/fetch-trending');

function line() {
  console.log('-'.repeat(70));
}

async function main() {
  console.log('Sleeper GM — Phase 1 diagnostics');
  console.log('league_id:', config.LEAGUE_ID);
  line();

  const nflState = await fetchNflState();
  console.log('NFL state:', nflState.data.season, 'week', nflState.data.week, nflState.data.season_type);

  const week = nflState.data.week || 1;

  const [rosters, users, matchups, transactions, trendingAdds] = await Promise.all([
    fetchRosters(config.LEAGUE_ID),
    fetchUsers(config.LEAGUE_ID),
    fetchMatchups(config.LEAGUE_ID, week),
    fetchTransactions(config.LEAGUE_ID, week),
    fetchTrending('add', 24, 10)
  ]);

  line();
  console.log('Roster map (roster_id -> owner_id -> team/display name):');
  const usersById = {};
  for (const u of users.data) usersById[u.user_id] = u;

  const rows = rosters.data
    .map((r) => {
      const u = usersById[r.owner_id] || {};
      const teamName = (u.metadata && u.metadata.team_name) || u.display_name || '(unknown)';
      return {
        roster_id: r.roster_id,
        owner_id: r.owner_id,
        team_name: teamName,
        wins: r.settings ? r.settings.wins : undefined,
        losses: r.settings ? r.settings.losses : undefined
      };
    })
    .sort((a, b) => a.roster_id - b.roster_id);

  console.table(rows);

  line();
  console.log('Fetch summary:');
  console.log('  rosters:', rosters.data.length, 'fetched_at', rosters.fetchedAt);
  console.log('  users:', users.data.length, 'fetched_at', users.fetchedAt);
  console.log('  matchups (week ' + week + '):', matchups.data.length, 'fetched_at', matchups.fetchedAt);
  console.log('  transactions (round ' + week + '):', transactions.data.length, 'fetched_at', transactions.fetchedAt);
  console.log('  trending adds:', trendingAdds.data.length, 'fetched_at', trendingAdds.fetchedAt);
  line();
  console.log('6 Sleeper API calls made in this run — well under any reasonable rate limit.');
  console.log('Done. Find "team 4" in the table above and note its roster_id/owner_id.');
}

main().catch((err) => {
  console.error('Diagnostics failed:', err.message);
  process.exit(1);
});
