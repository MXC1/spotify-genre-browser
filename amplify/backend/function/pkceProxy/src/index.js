const https = require('https');

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    console.error('Failed to parse request body:', err);
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Invalid JSON in request body' }),
    };
  }

  const { code, codeVerifier, client_id, redirect_uri } = body;

  if (!code || !codeVerifier || !client_id || !redirect_uri) {
    console.error('Missing parameters');
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Missing required parameters' }),
    };
  }

  const postData = new URLSearchParams({
    client_id,
    grant_type: 'authorization_code',
    code,
    redirect_uri,
    code_verifier: codeVerifier,
  }).toString();

  const options = {
    hostname: 'accounts.spotify.com',
    path: '/api/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  try {
    const response = await makeHttpsRequest(options, postData);
    return {
      statusCode: response.statusCode,
      headers: corsHeaders(),
      body: JSON.stringify(response.body),
    };
  } catch (error) {
    console.error('Request error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Internal Server Error', details: error.toString() }),
    };
  }
};

// Helper: HTTPS request as a Promise
function makeHttpsRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ statusCode: res.statusCode, body: parsed });
        } catch (err) {
          reject(new Error('Failed to parse JSON response from Spotify'));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(postData);
    req.end();
  });
}

// Helper: CORS headers
function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };
}
