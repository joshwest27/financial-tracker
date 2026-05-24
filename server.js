import express from 'express';
import cors from 'cors';
import routes from './routes';

const server = express();

server.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  }),
);
server.use(express.json());
server.use(routes);

server.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default server;
