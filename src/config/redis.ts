// import { createClient } from 'redis';
// import dotenv from 'dotenv';
//
// dotenv.config();
//
// const redisClient = createClient({
//   url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
// });
//
// redisClient.on('error', (err) => {
//   console.error('Redis Client Error:', err);
// });
//
// const connectRedis = async (): Promise<void> => {
//   try {
//     await redisClient.connect();
//     console.log('Redis Connected');
//   } catch (error) {
//     console.error(`Error connecting to Redis: ${error instanceof Error ? error.message : 'Unknown error'}`);
//   }
// };
//
// export { redisClient, connectRedis };
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  username: process.env.REDIS_USERNAME || 'default',
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
  }
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    console.log('Redis Connected');
  } catch (error) {
    console.error(`Error connecting to Redis: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export { redisClient, connectRedis };
