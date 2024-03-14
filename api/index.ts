import { hash } from 'bcrypt';
import { app } from './config/expressConfig';
import prisma from './config/prismaClient';
import { getEnv } from './utils/functions/getEnv';

app.listen(getEnv('PORT'), () => {
  console.log("API rodando na porta " + getEnv('PORT') + "...");
});
