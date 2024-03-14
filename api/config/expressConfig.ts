import express, { Express } from 'express';
import cors, { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import { getEnv } from '../utils/functions/getEnv';
import 'dotenv/config';

import usuariosRouter from '../src/domains/usuario/controllers';



export const app: Express = express();

const options: CorsOptions = {
  origin: getEnv('APP_URL'),
  credentials: true
};
app.use(cors(options));

app.use(cookieParser());

app.use(express.urlencoded({
  extended: true,
}));

app.use(express.json());

app.use('/api/usuarios', usuariosRouter);