import { NextFunction, Request, Response } from 'express';

const rateLimiters = new Map<string, Map<string, number[]>>();

export const rateLimiterMiddleware = (endpoint: string) => {
    return (req: Request, res: Response, next: NextFunction): void | Response => {
        const ip = req.ip || '0.0.0.0';
        const key = `${ip}:${endpoint}`;

        // Initialize trackers if needed
        if (!rateLimiters.has(endpoint)) {
            rateLimiters.set(endpoint, new Map());
        }

        const endpointLimiter = rateLimiters.get(endpoint)!;
        if (!endpointLimiter.has(key)) {
            endpointLimiter.set(key, []);
        }

        // Get current timestamps and clean old ones
        const now = Date.now();
        const timeWindow = 10 * 1000; // 10 seconds
        const timestamps = endpointLimiter.get(key)!;

        // Remove timestamps older than the window
        const validTimestamps = timestamps.filter(time => now - time < timeWindow);

        // Check if rate limit exceeded
        if (validTimestamps.length >= 5) { // Limit to 5 requests per 10 seconds
            return res.status(429).json({
                message: 'Too many requests, please try again later'
            });
        }

        // Add current timestamp and update the list
        validTimestamps.push(now);
        endpointLimiter.set(key, validTimestamps);

        next();
    };
};