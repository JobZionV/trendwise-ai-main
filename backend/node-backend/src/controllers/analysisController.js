import Analysis from '../models/Analysis.js';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

// @desc    Check health of Node and Python servers
// @route   GET /api/health
export const checkHealth = async (req, res) => {
  try {
    const pyRes = await fetch(`${FASTAPI_URL}/health`, { signal: AbortSignal.timeout(3000) });
    if (pyRes.ok) {
      return res.status(200).json({ status: 'ok', engine: 'connected' });
    }
    throw new Error('Python server not returning 200');
  } catch (error) {
    res.status(503).json({ status: 'degraded', engine: 'disconnected' });
  }
};

// @desc    Analyze text via FastAPI, then save to MongoDB
// @route   POST /api/analyze
export const analyzeText = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    // 1. Send to Python GPU Engine
    const fastApiRes = await fetch(`${FASTAPI_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (!fastApiRes.ok) {
      const errData = await fastApiRes.text();
      throw new Error(`GPU Engine Error: ${errData}`);
    }

    const mlData = await fastApiRes.json();

    // 2. Save result to MongoDB
    const doc = await Analysis.create({
      text: text.substring(0, 120), // Preview limit
      signals: mlData.signals,
      evidence: mlData.evidence,
      synthesis: mlData.synthesis,
      topic: mlData.topic,
      sentiment: mlData.sentiment
    });

    // 3. Return to React
    res.status(201).json(doc);
  } catch (error) {
    console.error('Analysis Error:', error.message);
    res.status(500).json({ error: 'Failed to process analysis' });
  }
};

// @desc    Get analysis history
// @route   GET /api/history
export const getHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const history = await Analysis.find().sort({ created_at: -1 }).limit(limit);
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

// @desc    Delete single history item
// @route   DELETE /api/history/:id
export const deleteHistory = async (req, res) => {
  try {
    const result = await Analysis.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Item not found' });
    res.status(200).json({ deleted: req.params.id });
  } catch (error) {
    res.status(400).json({ error: 'Invalid ID format' });
  }
};