const attempts = new Map();

const LIMITS = {
  login: { maxAttempts: 5, windowMs: 60000 },
  signup: { maxAttempts: 3, windowMs: 60000 },
  oauth: { maxAttempts: 10, windowMs: 60000 },
};

export function checkRateLimit(action = 'login', key = 'global') {
  const config = LIMITS[action] || LIMITS.login;
  const mapKey = `${action}:${key}`;
  const now = Date.now();

  if (!attempts.has(mapKey)) {
    attempts.set(mapKey, []);
  }

  const timestamps = attempts.get(mapKey).filter(t => now - t < config.windowMs);
  attempts.set(mapKey, timestamps);

  const remaining = config.maxAttempts - timestamps.length;
  const resetTime = timestamps.length > 0 ? timestamps[0] + config.windowMs : now + config.windowMs;

  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
    resetAt: resetTime,
    resetInMs: Math.max(0, resetTime - now),
  };
}

export function recordAttempt(action = 'login', key = 'global') {
  const mapKey = `${action}:${key}`;
  if (!attempts.has(mapKey)) {
    attempts.set(mapKey, []);
  }
  attempts.get(mapKey).push(Date.now());
}

export function resetRateLimit(action = 'login', key = 'global') {
  const mapKey = `${action}:${key}`;
  attempts.delete(mapKey);
}

export function formatResetTime(ms) {
  if (ms <= 0) return null;
  const seconds = Math.ceil(ms / 1000);
  if (seconds >= 60) {
    const mins = Math.ceil(seconds / 60);
    return `${mins} min${mins > 1 ? 's' : ''}`;
  }
  return `${seconds} sec${seconds > 1 ? 's' : ''}`;
}
