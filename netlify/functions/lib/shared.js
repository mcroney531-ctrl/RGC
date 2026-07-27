const crypto = require('crypto');

const SLEEPER_API = 'https://api.sleeper.app/v1';
const STORE_NAME = 'keeper-picks';
const MAX_KEEPERS = 2;
const HISTORY_LIMIT = 10;

function jsonResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(body)
  };
}

function blobKey(leagueId) {
  return 'league-' + leagueId;
}

function emptyRecord(leagueId) {
  return { leagueId: leagueId, deadline: null, picks: {} };
}

async function sleeperFetch(path) {
  const res = await fetch(SLEEPER_API + path);
  if (!res.ok) throw new Error('Sleeper API ' + res.status + ' for ' + path);
  return res.json();
}

// Verifies the caller-supplied admin token against KEEPER_ADMIN_TOKEN using
// a constant-time comparison, so response timing can't leak the real value.
function isValidAdminToken(candidate) {
  const real = process.env.KEEPER_ADMIN_TOKEN || '';
  if (!real || typeof candidate !== 'string' || !candidate) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(real);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

module.exports = {
  SLEEPER_API: SLEEPER_API,
  STORE_NAME: STORE_NAME,
  MAX_KEEPERS: MAX_KEEPERS,
  HISTORY_LIMIT: HISTORY_LIMIT,
  jsonResponse: jsonResponse,
  blobKey: blobKey,
  emptyRecord: emptyRecord,
  sleeperFetch: sleeperFetch,
  isValidAdminToken: isValidAdminToken
};
