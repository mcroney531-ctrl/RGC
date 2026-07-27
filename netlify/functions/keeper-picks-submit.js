const { connectLambda, getStore } = require('@netlify/blobs');
const {
  STORE_NAME, MAX_KEEPERS, HISTORY_LIMIT,
  jsonResponse, blobKey, emptyRecord, sleeperFetch
} = require('./lib/shared');

exports.handler = async (event) => {
  connectLambda(event);

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  const leagueId = String(body.leagueId || '');
  const ownerId = String(body.ownerId || '');
  var playerIds = Array.isArray(body.playerIds) ? body.playerIds.map(String) : [];
  playerIds = playerIds.filter(function(pid, i){ return pid && playerIds.indexOf(pid) === i; }); // dedupe, drop falsy

  if (!leagueId || !ownerId) {
    return jsonResponse(400, { error: 'leagueId and ownerId are required' });
  }
  if (playerIds.length > MAX_KEEPERS) {
    return jsonResponse(400, { error: 'You can keep at most ' + MAX_KEEPERS + ' players' });
  }

  const store = getStore(STORE_NAME);
  const record = (await store.get(blobKey(leagueId), { type: 'json' })) || emptyRecord(leagueId);

  if (record.deadline) {
    var deadlineMs = Date.parse(record.deadline);
    if (!isNaN(deadlineMs) && Date.now() > deadlineMs) {
      return jsonResponse(403, { error: 'The keeper deadline has passed. No further changes are accepted.' });
    }
  }

  // Never trust the client's claim about who owns what - re-verify against
  // Sleeper's live roster data before accepting a submission.
  var rosters, users;
  try {
    rosters = await sleeperFetch('/league/' + leagueId + '/rosters');
    users = await sleeperFetch('/league/' + leagueId + '/users');
  } catch (e) {
    return jsonResponse(502, { error: 'Could not verify roster against Sleeper: ' + e.message });
  }

  var roster = (rosters || []).find(function(r){ return String(r.owner_id) === ownerId; });
  if (!roster) {
    return jsonResponse(404, { error: 'No roster found for that manager in this league' });
  }
  var rosterPlayers = (roster.players || []).map(String);
  var invalid = playerIds.filter(function(pid){ return rosterPlayers.indexOf(pid) === -1; });
  if (invalid.length) {
    return jsonResponse(400, { error: 'These players are not on that roster: ' + invalid.join(', ') });
  }

  var user = (users || []).find(function(u){ return String(u.user_id) === ownerId; }) || {};
  var meta = user.metadata || {};
  var managerLabel = meta.team_name || user.display_name || ('Manager ' + ownerId);

  var existing = record.picks[ownerId];
  var history = (existing && existing.history) ? existing.history.slice() : [];
  if (existing) {
    history.push({
      playerIds: existing.playerIds,
      status: existing.status,
      submittedAt: existing.submittedAt,
      reviewedAt: existing.reviewedAt || null
    });
    if (history.length > HISTORY_LIMIT) history = history.slice(history.length - HISTORY_LIMIT);
  }

  record.picks[ownerId] = {
    managerLabel: managerLabel,
    playerIds: playerIds,
    status: 'pending',
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
    history: history
  };

  await store.setJSON(blobKey(leagueId), record);

  return jsonResponse(200, record.picks[ownerId]);
};
