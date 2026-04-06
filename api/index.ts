import { handle } from 'hono/vercel';
import app from '../src/worker/index';

export const config = {
  runtime: 'edge', // Using Edge for maximum performance and compatibility with your Worker logic
};

export default handle(app);
