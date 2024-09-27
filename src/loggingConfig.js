// loggingConfig.js
import AWS from 'aws-sdk';

AWS.config.update({ region: 'eu-west-2' });

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

  cloudwatchlogs.putLogEvents(params, (err, data) => {
    if (err) console.log(err, err.stack);
    else console.log(data);
  });
};

export default logToCloudWatch;
