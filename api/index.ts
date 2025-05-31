// api/index.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/app'; // Adjust path as needed
import { createServer } from 'http';
import { parse } from 'url';

const server = createServer((req, res) => {
  const parsedUrl = parse(req.url!, true);
  // @ts-ignore
  req.query = parsedUrl.query;
  app(req, res); // let Express handle it
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  server.emit('request', req, res);
}
