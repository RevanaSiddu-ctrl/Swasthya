// Placeholder for standard OpenAI service (switched from Azure due to quota)
// Used for natural language processing of text check-ins or IVR transcripts

const { env } = require('../../config/env');

class OpenAIService {
  async analyzeSentiment(text) {
    console.log('Mock: Analyzing sentiment with OpenAI...');
    return { sentiment: 'neutral', score: 0.5 };
  }
}

module.exports = new OpenAIService();
