const { connectLambda, getStore } = require('@netlify/blobs');
const { STORE_NAME, jsonResponse, blobKey, emptyRecord } = require('./lib/shared');

exports.handler = async (event) => {
  connectLambda(event);

  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  const leagueId = (event.queryStringParameters && event.queryStringParameters.league) || '';
  if (!leagueId) {
    return jsonResponse(400, { error: 'league query param is required' });
  }

  const store = getStore(STORE_NAME);
  const record = await store.get(blobKey(leagueId), { type: 'json' });

  return jsonResponse(200, record || emptyRecord(leagueId));
};
