import serverless from 'serverless-http';
import app, { appReady } from '../../server/index.js';

const serverlessHandler = serverless(app);

export const handler = async (event, context) => {
  await appReady;
  return serverlessHandler(event, context);
};
