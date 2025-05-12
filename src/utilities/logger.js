import AWS from 'aws-sdk';
import { getCachedEntry, setCachedEntry } from './indexedDb';
import { v1 as uuidv1 } from 'uuid';

// Configure AWS
AWS.config.update({
  region: 'eu-west-2',
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'eu-west-2:e1f1f662-0c4a-46b4-b707-123a98e849f1',
  }),
});

const cloudwatchlogs = new AWS.CloudWatchLogs();

let sessionID;

async function fetchOrGenerateSessionID() {
  const cachedSessionID = await getCachedEntry('auth', 'session_id');
  if (cachedSessionID) {
    sessionID = cachedSessionID;
    return cachedSessionID;
  }

  sessionID = uuidv1();
  await setCachedEntry('auth', sessionID, 'session_id');
  return sessionID;
}

// -- CloudWatch Log Stream/Group Configuration --
const LOG_GROUP = 'SGB_Operational_Logs';
const LOG_STREAM = 'SGB_Operational_Logs'; // For production use, you might want per-session or per-day stream names

async function logToCloudWatch(logEvent) {
  const params = {
    logGroupName: LOG_GROUP,
    logStreamName: LOG_STREAM,
    logEvents: [
      {
        message: JSON.stringify(logEvent),
        timestamp: Date.now(),
      },
    ],
  };

  cloudwatchlogs.putLogEvents(params, (err) => {
    if (err) console.error('CloudWatch error:', err);
  });
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
  if (process.env.REACT_APP_ENV === 'prod') {
    logToCloudWatch(logPayload);
  }
}

// -- Public API --
export const logger = {
  info: (msg, context = {}, event_id = null) => logMessage('INFO', msg, event_id, context),
  error: (msg, context = {}, event_id = null) => logMessage('ERROR', msg, event_id, context),
  warn: (msg, context = {}, event_id = null) => logMessage('WARN', msg, event_id, context),
  debug: (msg, context = {}, event_id = null) => logMessage('DEBUG', msg, event_id, context),
};

export default logger;
