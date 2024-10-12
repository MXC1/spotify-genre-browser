// loggingConfig.js
import AWS from 'aws-sdk';
import { set, get } from '../utilities/indexedDB';

AWS.config.update({ region: 'eu-west-2',
    credentials: new AWS.CognitoIdentityCredentials({
      IdentityPoolId: 'eu-west-2:e1f1f662-0c4a-46b4-b707-123a98e849f1'
    })
 });

const cloudwatchlogs = new AWS.CloudWatchLogs();

let sessionID;
export async function generateSessionID() {
  const cachedSessionID = await get('sessionID');
  if (cachedSessionID) {
    sessionID = cachedSessionID;
    return cachedSessionID;
  }
  const timestamp = new Date().getTime();
  const randomNumber = Math.floor(Math.random() * 1000000);
  sessionID = `${timestamp}-${randomNumber}`;
  set('sessionID', sessionID);
}

const logToCloudWatch = (message) => {
  const params = {
    logGroupName: 'SGB_Operational_Logs',
    logStreamName: 'SGB_Operational_Logs',
    logEvents: [
      {
        message: JSON.stringify(message),
        timestamp: new Date().getTime(),
      },
    ],
  };

  cloudwatchlogs.putLogEvents(params, (err, data) => {
    if (err) console.log(err, err.stack);
    else console.log(data);
  });
};

export const logMessage = (message) => {
  message = `${message} - SessionID: ${sessionID}`;
  console.log(message);
  if (process.env.REACT_APP_ENV === 'production') {
    logToCloudWatch(message);
  }
};

export default logMessage;
