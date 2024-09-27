// awsConfig.js
import AWS from 'aws-sdk';

AWS.config.update({
  region: 'your-region', // e.g., 'us-west-2'
  accessKeyId: 'your-access-key-id',
  secretAccessKey: 'your-secret-access-key'
});

const cloudwatchlogs = new AWS.CloudWatchLogs();

export { cloudwatchlogs };
