/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  branches: ['main'],
    analyzeCommits: {
      preset: 'angular'
    },
    plugins: [
      '@semantic-release/commit-analyzer',
      '@semantic-release/release-notes-generator',
      '@semantic-release/npm',
      '@semantic-release/github',
    ],
    dryRun: false
  };
