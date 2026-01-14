/**
 * OpenCode Model Configuration
 *
 * This file provides easy model switching between OpenAI and Ollama providers.
 * Export model configurations for use in OpenCode agent setup.
 */

// OpenAI GPT-4o Configuration (Primary - OpenCode Native Support)
export const openaiConfig = {
  provider: 'openai',
  model: 'gpt-4o',
  temperature: 0.1,
  maxSteps: 50,
}

// Ollama Configuration (Local - No API Key Required)
export const ollamaConfig = {
  provider: 'ollama',
  model: 'orieg/gemma3-tools:4b',
  temperature: 0.1,
  maxSteps: 50,
}

// Ollama 16K Context Configuration (Extended Context Window)
export const ollama16kConfig = {
  provider: 'ollama',
  model: 'orieg/gemma3-tools:4b-16K',
  temperature: 0.1,
  maxSteps: 50,
}

// Anthropic Configuration (Alternative)
export const anthropicConfig = {
  provider: 'anthropic',
  model: 'claude-sonnet-4-20250514',
  temperature: 0.1,
  maxSteps: 50,
}

// Default configuration (currently using OpenAI for best OpenCode compatibility)
export const defaultConfig = openaiConfig

// Agent-specific configurations
export const agentConfigs = {
  'git-agent': {
    description: 'Git operations: branch management, commits, merges, and repository analysis',
    mode: 'subagent',
    ...ollama16kConfig,
    tools: ['bash', 'read', 'grep'],
    permissions: {
      bash: {
        'git status': 'allow',
        'git log*': 'allow',
        'git diff*': 'allow',
        'git branch*': 'allow',
        'git checkout*': 'allow',
        'git add*': 'allow',
        'git commit*': 'allow',
        'git stash*': 'allow',
        'git merge*': 'ask',
        'git push*': 'ask',
        'git pull*': 'ask',
        'rm -rf /': 'deny',
        'sudo *': 'deny',
      },
    },
  },
  'tester-agent': {
    description:
      'Testing pipeline: runs TypeScript checks, linting, Jest tests, and build validation',
    mode: 'subagent',
    ...ollama16kConfig,
    tools: ['bash', 'read', 'grep', 'glob'],
    permissions: {
      bash: {
        'npm test*': 'allow',
        'npm run typecheck*': 'allow',
        'npm run lint*': 'allow',
        'npm run build*': 'allow',
        'npm run test:coverage*': 'allow',
        'npm publish': 'deny',
        'git push --force': 'deny',
        'rm -rf /': 'deny',
        'sudo *': 'deny',
      },
    },
  },
}

// Switch between providers
export function useProvider(provider) {
  switch (provider) {
    case 'ollama':
      return ollamaConfig
    case 'anthropic':
      return anthropicConfig
    case 'openai':
    default:
      return openaiConfig
  }
}

// Get model identifier for OpenCode config
export function getModelId(config = defaultConfig) {
  return `${config.provider}/${config.model}`
}

// Export all available providers
export const availableProviders = {
  openai: openaiConfig,
  ollama: ollamaConfig,
  ollama16k: ollama16kConfig,
  anthropic: anthropicConfig,
}
