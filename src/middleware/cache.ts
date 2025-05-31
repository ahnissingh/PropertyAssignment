import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';

/**
 * Middleware to cache responses
 * @param duration - Time in seconds to cache the response
 */
export const cacheMiddleware = (duration: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching if redis is not connected
    if (!redisClient.isReady) {
      return next();
    }

    const key = `api:${req.originalUrl || req.url}`;

    try {
      const cachedData = await redisClient.get(key);
      
      if (cachedData) {
        const data = JSON.parse(cachedData);
        return res.status(200).json({
          ...data,
          source: 'cache'
        });
      }

      // Store the original send function
      const originalSend = res.send;

      // Override the send function
      res.send = function (body: any): Response {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          let data = body;
          
          // If body is a string, try to parse it as JSON
          if (typeof body === 'string') {
            try {
              data = JSON.parse(body);
            } catch (e) {
              // Not JSON, just use the string
              data = body;
            }
          }

          // Don't cache if explicitly marked as no-cache
          if (data && data.noCache !== true) {
            redisClient.setEx(key, duration, JSON.stringify(data))
              .catch(err => console.error('Redis cache error:', err));
          }
        }

        // Restore the original send function
        res.send = originalSend;
        return originalSend.call(this, body);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next(); // Proceed without caching on error
    }
  };
};

/**
 * Clear cache for a specific key pattern
 */
export const clearCache = async (pattern: string): Promise<void> => {
  if (!redisClient.isReady) return;
  
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error('Clear cache error:', error);
  }
};