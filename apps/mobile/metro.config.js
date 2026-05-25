const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project root (up two levels from apps/mobile)
const projectRoot = path.resolve(__dirname, '../..');
const workspaceRoot = __dirname;

const config = getDefaultConfig(workspaceRoot);

// 1. Watch all files in the monorepo including shared packages
config.watchFolders = [projectRoot];

// 2. Force Metro to resolve modules from the correct pnpm store paths
config.resolver.nodeModulesPaths = [
  path.resolve(workspaceRoot, 'node_modules'),
  path.resolve(projectRoot, 'node_modules'),
];

// 3. Fix the Windows backslash path serialization bug
if (process.platform === 'win32') {
  config.transformer.getTransformOptions = async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  });
}

module.exports = config;