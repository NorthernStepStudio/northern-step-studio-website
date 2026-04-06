import { handle } from 'hono/vercel';
import app from '../src/worker/index.ts';

export const config = {
  runtime: 'edge', // Using Edge for maximum performance and compatibility with your Worker logic
};

export default handle(app);
