# How Primary Agents Automatically Invoke Subagents

## Understanding Automatic vs Manual Invocation

### Why Automatic Invocation Might Not Work

**Primary agents handle simple tasks themselves** rather than delegating to subagents. Automatic invocation typically occurs for:

1. **Complex multi-step tasks** that require specialized expertise
2. **Tasks requiring different models** or tool configurations
3. **When the primary agent determines delegation is beneficial**

For simple git status checks, the primary agent has all necessary tools and will handle it directly.

## Manual Invocation (Most Reliable)

Use **@ mentions** to explicitly invoke subagents:

```bash
@git-agent check git status and create a summary
@tester-agent run the full test suite
@git-agent create a feature branch for user authentication
```

## When Automatic Invocation Does Work

Automatic invocation typically triggers for:

1. **Complex git operations**: Repository restructuring, complex merges
2. **Advanced testing**: Full CI/CD pipeline validation
3. **Specialized tasks**: Tasks requiring specific model capabilities

## Testing Subagent Functionality

The subagents are properly configured and will work when manually invoked or when automatic conditions are met.

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
