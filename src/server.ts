import express, { Application } from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import { routes } from './routes';
import { logger } from './utils/logger';
import * as dotenv from 'dotenv';
const app: Application = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

const envFile = `.env.${process.env.NODE_ENV || 'local'}`;
dotenv.config({ path: envFile });

const PORT = process.env.PORT || 3000;

app.get('/token', async (req, res) => {
  try {
    const tokenUrl = 'https://api-satusehat-stg.dto.kemkes.go.id/oauth2/v1/accesstoken';
    const params = new URLSearchParams({
      grant_type: 'client_credentials'
    });
    const data = new URLSearchParams({
      client_id: process.env.SATU_SEHAT_CLIENT_ID!,
      client_secret: process.env.SATU_SEHAT_CLIENT_SECRET!
    });

    const response = await axios.post(tokenUrl, data, {
      params: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return res.status(200).json({ token: response.data });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});

routes(app);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${envFile} mode`);
});