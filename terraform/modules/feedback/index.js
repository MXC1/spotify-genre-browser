const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');

const ddbClient = new DynamoDBClient({ region: process.env.TABLE_REGION });
const ddbDocClient = new DynamoDBClient(ddbClient);

let tableName = `feedback-${process.env.ENV}`;

exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    // Set CORS headers
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
    };

    try {
        const body = JSON.parse(event.body);
        console.log('Parsed body:', JSON.stringify(body, null, 2));
        
        const feedback = body.message;
        const id = body.id;

        if (!feedback) {
            console.log('Validation failed: Empty feedback');
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Feedback cannot be empty' })
            };
        }
        if (!id) {
            console.log('Validation failed: Missing ID');
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'ID is required' })
            };
        }

        const putItemParams = {
            TableName: tableName,
            Item: {
                id: id,
                message: feedback,
                timestamp: new Date().toISOString(),
            },
        };

        console.log('Attempting to save to DynamoDB:', JSON.stringify(putItemParams, null, 2));
        await ddbDocClient.send(new PutCommand(putItemParams));
        console.log('Successfully saved to DynamoDB');
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: 'Feedback submitted successfully!' })
        };
    } catch (err) {
        console.error('Error occurred:', err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Could not submit feedback: ' + err.message })
        };
    }
};
