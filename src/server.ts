import express, { Application } from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import { routes } from './routes';
import { logger } from './utils/logger';
import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
const app: Application = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

const envFile = `.env.${process.env.NODE_ENV || 'local'}`;
const prisma = new PrismaClient();
dotenv.config({ path: envFile });


const PORT = process.env.PORT || 5173;

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

    res.status(200).json({ token: response.data });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/payment-methods', async (req, res) => {
  try {
    const paymentMethods = await prisma.paymentMethod.findMany();
    if (!paymentMethods || paymentMethods.length === 0) {
      res.status(404).json({ status: false, statusCode: 404, message: 'Metode pembayaran tidak ditemukan', data: [] });
    } else {
      res.json({ status: true, statusCode: 200, message: 'Metode pembayaran ditemukan', data: paymentMethods });
    }
  } catch (error) {
    res.status(500).json({ status: false, statusCode: 500, message: 'Terjadi kesalahan saat mengambil metode pembayaran', data: [] });
  }
});

routes(app);

app.listen(PORT, () => {
  logger.info(`Server running on port http://localhost:${PORT} in ${envFile} mode`);
});