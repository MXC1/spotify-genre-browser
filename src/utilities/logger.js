import { getCachedEntry, setCachedEntry } from './indexedDb';
import { v4 as uuidv4 } from 'uuid';

let sessionID;

async function fetchOrGenerateSessionID() {
  const cachedSessionID = await getCachedEntry('auth', 'session_id');
  if (cachedSessionID) {
    sessionID = cachedSessionID;
    return cachedSessionID;
  }

  sessionID = uuidv4();
  await setCachedEntry('auth', sessionID, 'session_id');
  return sessionID;
}

async function logToCloudWatch(logPayload) {
  // Only send logs in production or staging
  if (
    process.env.REACT_APP_ENV !== 'main' &&
    process.env.REACT_APP_ENV !== 'staging'
  ) {
    return;
  }

  try {
    await fetch(process.env.REACT_APP_LOG_ENDPOINT + "/logs", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logPayload),
    });
  } catch (error) {
    console.error('[CloudWatch] Failed to send log:', error, logPayload);
  }
}

// -- Logging Functionality --
async function logMessage(level, message, event_id = null, context = {}) {
  if (!sessionID) await fetchOrGenerateSessionID();

  const logPayload = {
    timestamp: new Date().toISOString(),
    level,
    session_id: sessionID,
    message,
    event_id,
    ...context,
  };

  // Console output
  const consolePrefix = `[${logPayload.timestamp}] [${level}]${event_id ? ` [${event_id}]` : ''}`;
  console.log(`${consolePrefix} ${message}`, context);

  // Send to CloudWatch in production
  if (process.env.REACT_APP_ENV === 'prod' || process.env.REACT_APP_ENV === 'staging') {
  }
  logToCloudWatch(logPayload);
}

// -- Public API --
export const logger = {
  info: (event_id, msg, context = {}) => logMessage('INFO', msg, event_id, context),
  error: (event_id, msg, context = {}) => logMessage('ERROR', msg, event_id, context),
  warn: (event_id, msg, context = {}) => logMessage('WARN', msg, event_id, context),
  debug: (event_id, msg, context = {}) => logMessage('DEBUG', msg, event_id, context),
};

