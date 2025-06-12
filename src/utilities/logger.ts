import { getCachedEntry, setCachedEntry } from './indexedDb';
import { v4 as uuidv4 } from 'uuid';
import { LogLevel } from "./LogLevel";

let sessionID: string;

async function fetchOrGenerateSessionID() {
  const cachedSessionID = await getCachedEntry('auth', 'session_id');
  if (cachedSessionID) {
    sessionID = cachedSessionID;
    return cachedSessionID;
  }

  sessionID = uuidv4();
  await setCachedEntry('auth', sessionID, 'session_id');
  logger.info("SYS002", "Generated new session ID", { sessionID });
  return sessionID;
}

function isRunningLocally() {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1';
}

async function logToCloudWatch(logPayload: LogPayload) {
  const env = process.env.REACT_APP_ENV ?? ""; // Defaults to empty string if undefined

  if (!['main', 'staging', 'dev'].includes(env) || isRunningLocally()) {
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
async function logMessage(level: string, message: string, event_id: string | null = null, context = {}) {
  if (!sessionID) await fetchOrGenerateSessionID();

  const logPayload : LogPayload = {
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

  logToCloudWatch(logPayload);
}

type LogPayload = {
  timestamp: string;
  level: string;
  session_id: string;
  message: string;
  event_id: string | null;
  context?: Record<string, unknown>;
};

// -- Public API --
export const logger = {
  info: (event_id: string, msg: string, context = {}) => logMessage(LogLevel.INFO, msg, event_id, context),
  error: (event_id: string, msg: string, context = {}) => logMessage(LogLevel.ERROR, msg, event_id, context),
  warn: (event_id: string, msg: string, context = {}) => logMessage(LogLevel.WARN, msg, event_id, context),
  debug: (event_id: string, msg: string, context = {}) => logMessage(LogLevel.DEBUG, msg, event_id, context),
};

