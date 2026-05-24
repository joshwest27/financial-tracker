import 'dotenv/config';
import mongoose from 'mongoose';
import server from './server';

const port = process.env.PORT || 3000;
const MONGO_URL =
  process.env.MONGO_URL || 'mongodb://localhost/financial-tracker';

mongoose
  .connect(MONGO_URL)
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('MongoDB connected');

    server.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server is listening on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  });
