import express from 'express';
import cors from 'cors';
import { generateBuildVariants } from './src/nexusbot/recommendations.js';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Main recommendation endpoint
app.get('/api/recommendations', (req, res) => {
    try {
        const { budget } = req.query;
        const variants = generateBuildVariants({ budget: Number(budget) });
        res.json(variants);
    } catch (error) {
        console.error('Error generating recommendations:', error);
        res.status(500).json({ error: 'Failed to generate recommendations' });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'reco' });
});

app.listen(PORT, () => {
    console.log(`[Reco] Service running on port ${PORT}`);
});
