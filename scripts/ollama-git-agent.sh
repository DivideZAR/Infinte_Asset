#!/bin/bash

# Ollama Git Agent - Direct integration with Ollama CLI for git operations

set -e

OLLAMA_MODEL="orieg/gemma3-tools:4b"

echo "🔧 Testing Ollama Git Agent with actual git operations..."
echo "================================================"

echo ""
echo "📊 Running git status..."
GIT_STATUS=$(git status 2>&1)
echo "$GIT_STATUS"

echo ""
echo "📜 Running git log --oneline -5..."
GIT_LOG=$(git log --oneline -5 2>&1)
echo "$GIT_LOG"

echo ""
echo "🌿 Running git branch -a..."
GIT_BRANCHES=$(git branch -a 2>&1)
echo "$GIT_BRANCHES"

echo ""
echo "📊 Running git diff --stat..."
GIT_DIFF=$(git diff --stat 2>&1)
echo "$GIT_DIFF"

echo ""
echo "🤖 Now asking Ollama to analyze the git state..."

PROMPT="Please analyze the following git repository state and provide a clear summary:

GIT STATUS:
$GIT_STATUS

RECENT COMMITS:
$GIT_LOG

BRANCHES:
$GIT_BRANCHES

UNSTAGED CHANGES:
$GIT_DIFF

Please provide:
1. Current branch and state
2. Recent activity summary
3. Any pending changes or issues
4. Recommendations if needed"

ollama run $OLLAMA_MODEL "$PROMPT"

echo ""
echo "✅ Git operations completed successfully via Ollama CLI!"
