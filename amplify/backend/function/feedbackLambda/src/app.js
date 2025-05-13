const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const bodyParser = require('body-parser')
const express = require('express')

const ddbClient = new DynamoDBClient({ region: process.env.TABLE_REGION });
const ddbDocClient = new DynamoDBClient(ddbClient);

let tableName = "feedbackTable";
if (process.env.ENV && process.env.ENV !== "NONE") {
  tableName = tableName + '-' + process.env.ENV;
}

const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

const path = "/feedback";

/************************************
 * HTTP post method for inserting feedback *
 *************************************/

app.post(path, async function(req, res) {

  const feedback = req.body.message;
  const id = req.body.id; // Get id from request

  if (!feedback) {
    return res.status(400).json({ error: 'Feedback cannot be empty' });
  }
  if (!id) {
    return res.status(400).json({ error: 'ID is required' });
  }

  const putItemParams = {
    TableName: tableName,
    Item: {
      id: id, // Use id from request
      message: feedback,
      timestamp: new Date().toISOString(),
    },
  };

  try {
    await ddbDocClient.send(new PutCommand(putItemParams));
    res.json({ success: 'Feedback submitted successfully!' });
  } catch (err) {
    res.statusCode = 500;
    res.json({ error: 'Could not submit feedback: ' + err.message });
  }
});

// Export the app object
module.exports = app;
