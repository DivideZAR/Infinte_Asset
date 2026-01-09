# How Primary Agents Automatically Invoke Subagents

## The Task Tool Mechanism

Primary agents automatically invoke subagents through the **Task tool** when they encounter tasks that match subagent descriptions.

## How It Works

1. **Task Recognition**: When you ask a primary agent to do something, it analyzes the task
2. **Subagent Matching**: The agent checks if any subagent's description matches the task
3. **Automatic Invocation**: If there's a match, the agent creates a child session for the subagent
4. **Parallel Work**: The subagent works in its own session while the primary agent continues
5. **Result Integration**: Results are brought back to the main conversation

## Example Usage

```bash
# This will likely invoke @git-agent automatically
"Help me create a feature branch for adding user authentication"

# This will likely invoke @tester-agent automatically
"Run the full test suite and check code quality"

# This might invoke both agents
"Create a new feature branch, implement the feature, and run tests"
```

## Task Permissions

Subagents can have **task permissions** that control which other subagents they can invoke:

```json
{
  "agent": {
    "build": {
      "permission": {
        "task": {
          "*": "allow",
          "git-agent": "allow",
          "tester-agent": "allow"
        }
      }
    }
  }
}
```

## Session Navigation

When subagents are invoked, you get **child sessions**:

- **<Leader>+Right**: Cycle forward through sessions
- **<Leader>+Left**: Cycle backward through sessions
- Each subagent works in its own isolated session
- Results are integrated back to the main conversation

## Current Subagent Descriptions

Your configured subagents have these descriptions:

**Git Agent**: "Comprehensive git operations and repository management"

- Matches: Branch creation, commits, merges, repository analysis

**Tester Agent**: "Comprehensive testing pipeline for code quality and validation"

- Matches: Test execution, linting, type checking, build validation

## Testing Automatic Invocation

Try these commands with your primary agent:

```bash
"Help me check the current git status and create a summary"
"Run all tests and provide a quality report"
"Set up a new feature branch and initialize testing"
```

The primary agent should automatically invoke the appropriate subagents based on these task descriptions.
