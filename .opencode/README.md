# OpenCode Agents Configuration

This directory contains OpenCode agent configurations for the Infinte_Asset project.

## Configured Agents

### Git Agent (`git-agent.md`)

- **Purpose**: Git operations and repository management
- **Mode**: Subagent
- **Model**: Claude Sonnet (high capability for complex operations)
- **Temperature**: 0.1 (focused and deterministic)
- **Tools**: Full access to bash, read, write, edit
- **Permissions**: Safe git operations, destructive commands blocked

### Tester Agent (`tester-agent.md`)

- **Purpose**: Testing pipeline and code quality validation
- **Mode**: Subagent
- **Model**: Claude Haiku (fast for routine testing)
- **Temperature**: 0.1 (consistent results)
- **Tools**: bash, read, grep (no webfetch)
- **Permissions**: Safe testing operations, destructive commands blocked

## Usage

### Invoking Subagents

You can invoke these subagents in your conversations using the `@` mention:

```
@git-agent help me create a feature branch for this task
@tester-agent run the full test suite and report any issues
```

### Automatic Invocation

Primary agents can automatically invoke subagents based on their descriptions when they encounter tasks that match the subagent's capabilities.

## Configuration Files

- `config.json`: Main configuration with agent definitions and tool permissions
- `agent/git-agent.md`: Git agent configuration and prompt
- `agent/tester-agent.md`: Tester agent configuration and prompt

## Adding New Agents

To add a new agent:

1. Create a new `.md` file in the `agent/` directory
2. Use the frontmatter format for configuration
3. Include a detailed system prompt below the frontmatter
4. Update `config.json` if needed

Example agent file structure:

```markdown
---
description: Brief description of agent purpose
mode: subagent
model: anthropic/claude-sonnet-4-20250514
temperature: 0.1
tools:
  bash: true
  read: true
---

You are [Agent Name], specialized in [specific task].
[Detailed system prompt and instructions...]
```

## OpenCode Documentation

For more information about configuring agents, see: https://opencode.ai/docs/agents/

## Project-Specific Notes

- Git Agent: Configured with safe permissions to prevent accidental data loss
- Tester Agent: Focused on development workflow validation
- All agents use Anthropic Claude models for consistency
- Temperature set low (0.1) for deterministic, reliable responses
