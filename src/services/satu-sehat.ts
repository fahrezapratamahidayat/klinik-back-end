import axios from 'axios';

async function getSatuSehatToken() {
  const response = await axios.post('https://api-satusehat-stg.dto.kemkes.go.id/oauth2/v1', {
    client_id: process.env.SATU_SEHAT_CLIENT_ID,
    client_secret: process.env.SATU_SEHAT_CLIENT_SECRET,
    grant_type: 'client_credentials'
  });
  return response.data.access_token;
}

