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
  if (!leagueId) {
    return jsonResponse(400, { error: 'leagueId is required' });
  }

  if (body.deadline !== undefined && body.deadline !== null && body.deadline !== '') {
    var ms = Date.parse(body.deadline);
    if (isNaN(ms)) {
      return jsonResponse(400, { error: 'deadline must be a valid date/time string' });
    }
  }

  const store = getStore(STORE_NAME);
  const record = (await store.get(blobKey(leagueId), { type: 'json' })) || emptyRecord(leagueId);

  record.deadline = (body.deadline === undefined || body.deadline === '') ? null : body.deadline;

  await store.setJSON(blobKey(leagueId), record);

  return jsonResponse(200, { leagueId: leagueId, deadline: record.deadline });
};
