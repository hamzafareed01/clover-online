const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5050;

app.use(cors());

// --- Step 1: Redirect to Clover OAuth ---
app.get('/auth/start', (req, res) => {
  const { CLIENT_ID, REDIRECT_URI } = process.env;
  const cloverOAuthUrl = `https://sandbox.dev.clover.com/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  res.redirect(cloverOAuthUrl);
});

// --- Step 2: OAuth Callback ---
app.get('/auth/callback', async (req, res) => {
  const code = req.query.code;
  const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;

  try {
    const response = await axios.post('https://sandbox.dev.clover.com/oauth/token', null, {
      params: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      }
    });

    const accessToken = response.data.access_token;
    // TODO: Save accessToken securely (DB or encrypted storage)

    res.redirect(`http://localhost:5173/dashboard?token=${accessToken}`);
  } catch (err) {
    console.error('OAuth Error:', err.response?.data || err);
    res.status(500).send('OAuth failed');
  }
});

// --- Sample API Proxy (Inventory) ---
app.get('/api/inventory', async (req, res) => {
  const { token, merchantId } = req.query;

  try {
    const response = await axios.get(`https://sandbox.dev.clover.com/v3/merchants/${merchantId}/items`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    res.json(response.data);
  } catch (err) {
    console.error('API Error:', err.response?.data || err);
    res.status(500).json({ error: 'API request failed' });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
