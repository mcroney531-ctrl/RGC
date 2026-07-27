const { connectLambda, getStore } = require('@netlify/blobs');
const { STORE_NAME, jsonResponse, blobKey, emptyRecord, isValidAdminToken } = require('./lib/shared');

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

  if (!isValidAdminToken(body.adminToken)) {
    return jsonResponse(401, { error: 'Invalid admin token' });
  }

  const leagueId = String(body.leagueId || '');
  const ownerId = String(body.ownerId || '');
  const action = body.action;

  if (!leagueId || !ownerId) {
    return jsonResponse(400, { error: 'leagueId and ownerId are required' });
  }
  if (action !== 'approve' && action !== 'reject') {
    return jsonResponse(400, { error: 'action must be "approve" or "reject"' });
  }

  const store = getStore(STORE_NAME);
  const record = (await store.get(blobKey(leagueId), { type: 'json' })) || emptyRecord(leagueId);

  const entry = record.picks[ownerId];
  if (!entry) {
    return jsonResponse(404, { error: 'No submission found for that manager' });
  }

  entry.status = action === 'approve' ? 'approved' : 'rejected';
  entry.reviewedAt = new Date().toISOString();

  await store.setJSON(blobKey(leagueId), record);

  return jsonResponse(200, entry);
};
