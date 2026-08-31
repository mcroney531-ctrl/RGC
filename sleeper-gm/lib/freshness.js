// Enforces the "no stale data" lesson from the prior GroupMe-bot failure.
// Every fetch node stamps its output with wrap(); every decision node must
// call assertFresh() before reading that data. This is a hard failure, not
// a hint for the model to weigh — staleness is judged by the clock, not by
// the agent's own discretion.

function wrap(dataType, data) {
  return {
    dataType: dataType,
    fetchedAt: new Date().toISOString(),
    data: data
  };
}

function isFresh(fetchedResult, windowMs) {
  const ageMs = Date.now() - new Date(fetchedResult.fetchedAt).getTime();
  return ageMs <= windowMs;
}

function assertFresh(fetchedResult, windowMs) {
  if (!isFresh(fetchedResult, windowMs)) {
    const ageMs = Date.now() - new Date(fetchedResult.fetchedAt).getTime();
    throw new Error(
      'Stale data: ' + fetchedResult.dataType + ' fetched ' + Math.round(ageMs / 1000) +
      's ago, exceeds freshness window of ' + Math.round(windowMs / 1000) + 's. Re-fetch before deciding.'
    );
  }
  return fetchedResult;
}

module.exports = { wrap, isFresh, assertFresh };
