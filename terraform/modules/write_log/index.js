exports.handler = async (event) => {
  let logPayload;
  try {
    logPayload = event.body ? JSON.parse(event.body) : {};
  } catch (err) {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    console.error('Failed to parse log payload:', err);
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ error: 'Invalid JSON in request body' }),
    };
  }

  // Log only the payload as-is for CloudWatch
  console.log(JSON.stringify(logPayload));

  // Optionally, add logic to store logs in a database or another service here

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*"
    },
    body: JSON.stringify({ message: 'Log received', received: logPayload }),
  };
};
