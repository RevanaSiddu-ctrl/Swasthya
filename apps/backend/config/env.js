require('dotenv').config();

const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'GEMINI_API_KEY',
  'MONGODB_URI'
];

// Check for missing required variables (hackathon-friendly warning instead of crashing)
const missing = requiredEnvVars.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.warn(`⚠️  Warning: Missing recommended environment variables: ${missing.join(', ')}`);
}

const env = {
  port: process.env.PORT || 5000,
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Handle literal \n in private keys if provided in .env
    privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
  },
  gemini: {
    key: process.env.GEMINI_API_KEY,
  },
  azureOpenAI: {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    key: process.env.AZURE_OPENAI_KEY,
  },
  mongo: {
    uri: process.env.MONGODB_URI,
  },
  azureSpeech: {
    key: process.env.AZURE_SPEECH_KEY,
    region: process.env.AZURE_SPEECH_REGION,
  },
  azureCommunication: {
    connectionString: process.env.AZURE_COMMUNICATION_CONNECTION_STRING,
  },
  azureAnomaly: {
    endpoint: process.env.AZURE_ANOMALY_ENDPOINT,
    key: process.env.AZURE_ANOMALY_KEY,
  },
  clientUrl: process.env.CLIENT_URL,
};

module.exports = { env };
