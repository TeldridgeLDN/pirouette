# AI Coding Assistant Configuration Sync

A Python script to synchronise configuration files between **Claude Code** (VS Code extension) and **Cursor IDE**, ensuring consistent AI assistant behaviour across both tools.

## The Problem

When working with both Claude Code (VS Code extension) and Cursor on the same project, you encounter several configuration inconsistencies:

| Configuration Type | Claude Code Location | Cursor Location |
|-------------------|---------------------|-----------------|
| Instructions | `CLAUDE.md` | `AGENTS.md` or `.cursor/rules/` |
| Rules | `.claude/settings.json` | `.cursor/rules/*.mdc` |
| Commands | `.claude/commands/*.md` | Via UI or `.cursor/` |
| MCP Servers | `.mcp.json` or `~/.claude.json` | `.mcp.json` |
| Agents/Subagents | `.claude/agents/*.md` | Via rules |

This script creates a unified approach using the emerging **AGENTS.md standard** while maintaining tool-specific configurations where needed.

## Installation

```bash
# The script is located in the scripts/ directory
# Make executable
chmod +x scripts/ai-config-sync.py

# Optionally install globally
cp scripts/ai-config-sync.py /usr/local/bin/
```

## Quick Start

```bash
# Initialise a new project with AI assistant configuration
python ai-config-sync.py --init

# Sync an existing project
python ai-config-sync.py

# Preview changes without applying them
python ai-config-sync.py --dry-run

# Sync a specific project directory
python ai-config-sync.py --project-dir /path/to/project
```

## What It Does

### 1. Instruction Files (AGENTS.md / CLAUDE.md)

The script uses **AGENTS.md** as the canonical source of truth:

- **AGENTS.md**: Primary instruction file (supports Claude Code, Cursor, Copilot, and more)
- **CLAUDE.md**: Created as a reference file pointing to AGENTS.md

This approach follows the [agents.md standard](https://agents.md/) adopted by Google, OpenAI, Factory, Sourcegraph, and Cursor.

### 2. Rules Synchronisation

- Migrates legacy `.cursorrules` to the new `.cursor/rules/*.mdc` format
- Creates the `.cursor/rules/` directory structure
- Reports on existing rule configurations

### 3. MCP Server Configuration

- Checks project-level `.mcp.json` (shared with team)
- Reports on user-level `~/.claude.json` configurations
- Can create template configurations

### 4. Custom Commands

- Tracks `.claude/commands/*.md` files for Claude Code
- Reports on user-level commands in `~/.claude/commands/`

### 5. Settings Management

- Checks `.claude/settings.json` for project settings
- Respects `.claude/settings.local.json` for personal settings (git-ignored)

## Directory Structure After Init

```
your-project/
├── AGENTS.md                    # Primary instructions (edit this!)
├── CLAUDE.md                    # Reference to AGENTS.md
├── .mcp.json                    # Shared MCP server configs (optional)
├── .gitignore                   # Updated with AI config ignores
├── .claude/
│   ├── commands/                # Custom slash commands
│   │   └── your-command.md
│   ├── agents/                  # Custom subagents
│   │   └── your-agent.md
│   ├── settings.json            # Project settings (committed)
│   └── settings.local.json      # Personal settings (ignored)
└── .cursor/
    └── rules/
        └── project-rules.mdc    # Cursor-specific rules
```

## Configuration Strategy

### For Instructions That Apply to Both Tools

Edit `AGENTS.md` with your project context, coding standards, and workflow instructions. Both Claude Code and Cursor will read this file.

```markdown
# AGENTS.md

## Project Overview
This is a Next.js application with TypeScript...

## Coding Standards
- Use TypeScript strict mode
- Follow React hooks patterns
- Write tests for all new features

## Common Commands
npm run dev    # Development server
npm run test   # Run tests
```

### For Cursor-Specific Rules

Create `.cursor/rules/*.mdc` files with Cursor's MDC format:

```markdown
---
description: "TypeScript component rules"
globs: "src/components/**/*.tsx"
alwaysApply: false
---

# Component Guidelines

- Use functional components with hooks
- Export types alongside components
- Include prop validation
```

### For Claude Code-Specific Commands

Create `.claude/commands/your-command.md`:

```markdown
Review the code in $ARGUMENTS for:
- Security vulnerabilities
- Performance issues
- Code style violations

Provide specific, actionable feedback.
```

### For Shared MCP Servers

Create `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

## Tips for Cross-Tool Consistency

1. **Use AGENTS.md as your primary source** - Edit this file for instructions that should apply everywhere

2. **Keep tool-specific rules minimal** - Only use `.cursor/rules/` for Cursor-specific features like glob patterns

3. **Share MCP configs via .mcp.json** - This file works with both Claude Code and Cursor

4. **Use environment variables for secrets** - Reference `${VAR_NAME}` in configs rather than hardcoding

5. **Git ignore personal settings** - Keep `.claude/settings.local.json` in `.gitignore`

## Command Reference

```bash
# Full command syntax
python ai-config-sync.py [OPTIONS]

Options:
  -p, --project-dir PATH   Project directory (default: current directory)
  -i, --init               Initialise new project configuration
  -n, --dry-run            Preview changes without applying
  -v, --verbose            Show detailed output
  -h, --help               Show help message
```

## Troubleshooting

### Claude Code not reading AGENTS.md

Claude Code has a [known issue](https://github.com/anthropics/claude-code/issues/6235) where it may not read AGENTS.md directly. The script creates a `CLAUDE.md` file with `See @AGENTS.md` as a workaround.

### Cursor rules not applying

Check that your `.cursor/rules/*.mdc` files have valid YAML frontmatter:

```markdown
---
description: "Description for agent to understand when to apply"
globs: "**/*.ts"
alwaysApply: true
---
```

### MCP servers not loading

1. Check `claude mcp list` to see registered servers
2. Verify the server command is correct
3. Run `claude mcp get <server-name>` to test connectivity

## Resources

- [AGENTS.md Standard](https://agents.md/)
- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Cursor Rules Documentation](https://docs.cursor.com/context/rules)
- [MCP Protocol](https://modelcontextprotocol.io/)

## Contributing

Feel free to extend this script for your workflow. Common additions:

- Integration with other AI tools (Copilot, Codeium, etc.)
- Automated rule generation from project structure
- CI/CD integration for config validation

## License

MIT License - Use freely in your projects.
