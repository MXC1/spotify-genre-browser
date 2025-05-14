const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');

const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

const path = '/exchange-token';

app.post(path, async (req, res) => {
  console.log('Received request body:', JSON.stringify(req.body, null, 2));

  const { code, codeVerifier, client_id, redirect_uri } = req.body;

  if (!code || !codeVerifier || !client_id || !redirect_uri) {
    console.error('Invalid parameters');
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  console.log('Parsed parameters:', { code, codeVerifier, client_id, redirect_uri });

  const postData = new URLSearchParams({
    client_id,
    grant_type: 'authorization_code',
    code,
    redirect_uri,
    code_verifier: codeVerifier,
  }).toString();

  console.log('Post data:', postData);

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
    const spotifyResponse = await new Promise((resolve, reject) => {
      console.log('Making HTTPS request to Spotify...');
      const req = https.request(options, (resFromSpotify) => {
        let data = '';

        console.log(`Received response status: ${resFromSpotify.statusCode}`);
        resFromSpotify.on('data', (chunk) => {
          console.log(`Received chunk: ${chunk}`);
          data += chunk;
        });

        resFromSpotify.on('end', () => {
          console.log('Request ended. Full response data:', data);
          try {
            const parsedData = JSON.parse(data);
            resolve({ status: resFromSpotify.statusCode, data: parsedData });
          } catch (err) {
            console.error('Failed to parse response data:', err);
            reject(new Error('Failed to parse response data as JSON'));
          }
        });
      });

      req.on('error', (e) => {
        console.error(`HTTPS request error: ${e.message}`);
        reject(new Error(`Problem with request: ${e.message}`));
      });

      req.write(postData);
      req.end();
    });

    console.log('Response from Spotify:', spotifyResponse);
    res.status(spotifyResponse.status).json(spotifyResponse.data);

  } catch (error) {
    console.error('Caught error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.toString() });
  }
});

module.exports = app;
