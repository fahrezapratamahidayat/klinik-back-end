import express, { Application } from 'express';
import bodyParser from 'body-parser';
import { routes } from './src/routes';
import { logger } from './src/utils/logger';
import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import { errorHandler } from './src/utils/error-handler';
const app: Application = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

const envFile = `.env.${process.env.NODE_ENV || 'local'}`;
dotenv.config({ path: envFile });

const PORT = process.env.PORT || 5173;

routes(app);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port http://localhost:${PORT} in ${envFile} mode`);
});