import express from 'express';
import { Redis } from '@upstash/redis';
const app = express();
const port = 3000;
const redis = new Redis({
    url: 'https://honest-dogfish-21078.upstash.io',
    token: 'AVJWAAIjcDFjYmRiY2ZjOGQ2ZWM0ODYwYWE4ZmY0MTMwOTdiZDZkZHAxMA',
});
app.use(express.json());
app.post('/calculate-average', async (req, res) => {
    try {
        const { numbers } = req.body;
        
        if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
            return res.status(400).json({
                error: 'Please provide an array of numbers'
            });
        }
        if (!numbers.every(num => typeof num === 'number')) {
            return res.status(400).json({
                error: 'All elements must be numbers'
            });
        }
        const sortedNumbers = [...numbers].sort((a, b) => a - b);
        const cacheKey = `avg:${sortedNumbers.join(',')}`;
        const cachedResult = await redis.get(cacheKey);
        if (cachedResult) {
            return res.json({
                ...cachedResult,
                cached: true
            });
        }
        const sum = numbers.reduce((acc, curr) => acc + curr, 0);
        const average = sum / numbers.length;
        const result = {
            result: average,
            count: numbers.length,
            cached: false
        };
        await redis.setex(cacheKey, 3600, result);
        res.json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 