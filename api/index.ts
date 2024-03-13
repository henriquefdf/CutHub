import { app } from './config/express-config';
import { getEnv } from './utils/functions/getEnv';

app.listen(getEnv('PORT'), () => {
  console.log("API rodando na porta " + getEnv('PORT') + "...");
});