import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
  text: { type: String, required: true },
  signals: { type: Object, required: true },
  evidence: { type: Array, default: [] },
  synthesis: { type: String, default: '' },
  topic: { type: String, required: true },
  sentiment: { type: Object, required: true },
  created_at: { type: Date, default: Date.now }
});

const Analysis = mongoose.model('Analysis', analysisSchema, 'analyses');
export default Analysis;