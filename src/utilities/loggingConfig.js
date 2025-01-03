// loggingConfig.js
import AWS from 'aws-sdk';

AWS.config.update({ region: 'eu-west-2',
    credentials: new AWS.CognitoIdentityCredentials({
      IdentityPoolId: 'eu-west-2:e1f1f662-0c4a-46b4-b707-123a98e849f1'
    })
 });

const cloudwatchlogs = new AWS.CloudWatchLogs();

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

  cloudwatchlogs.putLogEvents(params, (err) => {
    if (err) console.log(err, err.stack);
  });
};

const logMessage = (message) => {
  console.log(message);
  if (process.env.REACT_APP_ENV === 'production') {
    logToCloudWatch(message);
  }
};

export default logMessage;
