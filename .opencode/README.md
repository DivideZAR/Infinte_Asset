# OpenCode Subagents Configuration

This directory contains OpenCode agent configurations for the Infinte_Asset project.

## Overview

The project uses two specialized subagents for git operations and testing, integrated with the OpenCode AI development platform.

## Configured Agents

### Git Agent (`git-agent.md`)

**Purpose**: Git operations and repository management

**Configuration**:

- **Mode**: Subagent
- **Model**: OpenAI GPT-4o (high capability for complex operations)
- **Temperature**: 0.1 (focused and deterministic)
- **Max Steps**: 50 iterations

**Tools**:

- ✅ bash (with restricted git commands)
- ✅ read
- ✅ grep
- ❌ edit (prompt-only)
- ❌ write (prompt-only)

**Permissions**:

- **ALLOW**: git status, log*, diff*, branch*, checkout*, add*, commit*, stash\*
- **ASK**: git merge*, push*, pull*, reset*, rebase\*
- **DENY**: rm -rf /, sudo _, format_, fdisk\*

**Automatic Invocation**:
Triggered for tasks involving:

- Branch management
- Commit analysis
- Repository state checking
- Merge conflict resolution

**Task Permissions**: Can invoke tester-agent for validation after code changes

### Tester Agent (`tester-agent.md`)

**Purpose**: Testing pipeline and code quality validation

**Configuration**:

- **Mode**: Subagent
- **Model**: OpenAI GPT-4o (balanced capability for testing)
- **Temperature**: 0.1 (consistent results)
- **Max Steps**: 50 iterations

**Tools**:

- ✅ bash (with restricted npm commands)
- ✅ read
- ✅ grep
- ✅ glob
- ❌ edit (prompt-only)
- ❌ write (prompt-only)

**Permissions**:

- **ALLOW**: npm test*, typecheck*, lint*, build*, test:coverage\*
- **ASK**: npm run \* (other operations)
- **DENY**: npm publish, git push --force, rm -rf /, sudo \*

**Automatic Invocation**:
Triggered for tasks involving:

- Running tests
- TypeScript validation
- Code linting
- Build verification
- Code quality analysis

**Task Permissions**: Can invoke git-agent for repository state checks

## Primary Agents

### Build Agent

**Mode**: Primary
**Model**: OpenAI GPT-4o
**Temperature**: 0.1

Full development agent with all tools enabled and access to both subagents.

### Plan Agent

**Mode**: Primary
**Model**: OpenAI GPT-4o
**Temperature**: 0.1

Analysis agent with access to both subagents for planning tasks.

## Usage

### Manual Invocation (Recommended)

Use **@ mentions** to explicitly invoke subagents:

```bash
@git-agent check the status of all branches and suggest cleanup
@git-agent create a feature branch for authentication feature
@tester-agent run the full test suite and report coverage
@tester-agent check for TypeScript errors in the codebase
```

### Automatic Invocation

Primary agents automatically invoke subagents when tasks match their descriptions:

- Build agent → Git-Agent for repository operations
- Build agent → Tester-Agent for validation tasks
- Plan agent → Both subagents for analysis

### Navigation Between Sessions

When subagents create child sessions, navigate with:

- **Ctrl+Right**: Cycle forward (parent → child → ...)
- **Ctrl+Left**: Cycle backward (parent ← child ← ...)

## Configuration Files

### Main Config (`config.json`)

Central configuration with agent definitions, tools, and permissions.

### Agent Prompts (`agent/*.md`)

Individual markdown files for each agent with:

- YAML frontmatter for configuration
- System prompt with specialized instructions

### Global vs Project-Level

Agents can be configured at:

- **Global**: `~/.config/opencode/agent/` (shared across projects)
- **Project**: `.opencode/agent/` (project-specific, overrides global)

## Ollama Integration (Fallback)

For environments without OpenAI API access, use the direct Ollama CLI:

```bash
# Run the Ollama Git Agent
./scripts/ollama-git-agent.sh

# Or test specific operations
ollama run orieg/gemma3-tools:4b "Analyze git status and suggest actions"
```

**Note**: The Ollama integration works independently of OpenCode and provides direct CLI-based git operations.

## Best Practices

1. **Use Explicit Invocation**: Always use @ mentions for reliability
2. **Follow Permission Guidelines**: Subagents have restricted permissions for safety
3. **Check Task Output**: Review subagent results before committing changes
4. **Leverage Specialization**: Use Git-Agent for git tasks, Tester-Agent for validation

## Troubleshooting

### Subagent Won't Invoke

1. Check model availability: `opencode models`
2. Verify permissions in config.json
3. Ensure task permissions allow subagent invocation

### Permission Denied Errors

1. Review agent-specific permission settings
2. Check glob patterns for bash commands
3. Contact admin for permission changes

### Model Not Found

1. Verify provider configuration
2. Check API keys or local model availability
3. Fall back to alternative provider if needed

## Additional Resources

- [OpenCode Agents Documentation](https://opencode.ai/docs/agents/)
- [OpenCode Configuration Guide](https://opencode.ai/docs/config/)
- [OpenCode Permissions](https://opencode.ai/docs/permissions/)

## Project-Specific Notes

- All agents use OpenAI GPT-4o for consistency
- Temperature set to 0.1 for deterministic, reliable responses
- Permission system follows principle of least privilege
- Subagents can collaborate through task permissions
- Ollama integration available as fallback for local environments
