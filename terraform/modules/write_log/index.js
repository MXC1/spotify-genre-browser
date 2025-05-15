const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

// Initialize DynamoDB client
const ddbClient = new DynamoDBClient({ region: process.env.TABLE_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

// Table name using environment variable
const tableName = `feedback-${process.env.ENV}`;

exports.handler = async (event, context) => {
  try {
    // Set up CORS headers
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*"
    };

    // Handle OPTIONS method for CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({})
      };
    }

    // Only proceed if this is a POST request
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    // Parse the request body
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (parseErr) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      };
    }
    const feedback = requestBody.message;
    const id = requestBody.id;

    // Validate inputs
    if (!feedback) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Feedback cannot be empty' })
      };
    }

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'ID is required' })
      };
    }

    // Prepare item for DynamoDB
    const putItemParams = {
      TableName: tableName,
      Item: {
        id: id,
        message: feedback,
        timestamp: new Date().toISOString(),
      },
    };

    // Store the feedback in DynamoDB
    await ddbDocClient.send(new PutCommand(putItemParams));

    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: 'Feedback submitted successfully!' })
    };

  } catch (err) {
    // Handle errors
    console.error('Error:', err);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ error: `Could not submit feedback: ${err.message}` })
    };
  }
};