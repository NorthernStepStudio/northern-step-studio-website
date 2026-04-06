import { handleRequest } from '../server/index.mjs';

export default async function handler(req, res) {
  // Pass the raw Vercel Edge/Node request down into the ResponseOS custom router
  return handleRequest(req, res);
}
