#!/usr/bin/env python3
"""
AI Coding Assistant Configuration Synchroniser
===============================================

Synchronises configuration files between Claude Code (VS Code extension) and Cursor IDE
to ensure consistent AI assistant behaviour across both tools.

Supports:
- AGENTS.md / CLAUDE.md instruction files
- Custom slash commands
- MCP server configurations
- Project rules (.cursor/rules/*.mdc)
- Settings files
- Custom subagents

Usage:
    python ai-config-sync.py [--project-dir PATH] [--dry-run] [--verbose]
    
    # Sync current directory
    python ai-config-sync.py
    
    # Sync specific project with dry run
    python ai-config-sync.py --project-dir /path/to/project --dry-run
    
    # Initial setup for new project
    python ai-config-sync.py --init

Author: Claude (Anthropic)
Version: 1.0.0
"""

import os
import sys
import json
import shutil
import argparse
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, List, Any, Tuple


# =============================================================================
# Configuration Constants
# =============================================================================

# File locations relative to project root
PROJECT_CONFIG = {
    # Primary instruction files (AGENTS.md is the emerging standard)
    "agents_md": "AGENTS.md",
    "claude_md": "CLAUDE.md",
    
    # Claude Code specific
    "claude_settings": ".claude/settings.json",
    "claude_settings_local": ".claude/settings.local.json",
    "claude_commands": ".claude/commands",
    "claude_agents": ".claude/agents",
    
    # Cursor specific
    "cursor_rules": ".cursor/rules",
    "cursorrules_legacy": ".cursorrules",
    
    # MCP configuration
    "mcp_json": ".mcp.json",
}

# User-level configuration (home directory)
USER_CONFIG = {
    "claude_global_md": "~/.claude/CLAUDE.md",
    "claude_global_settings": "~/.claude/settings.json",
    "claude_global_commands": "~/.claude/commands",
    "claude_global_agents": "~/.claude/agents",
    "claude_json": "~/.claude.json",  # Legacy but still used
}


# =============================================================================
# Utility Functions
# =============================================================================

def expand_path(path: str) -> Path:
    """Expand ~ and environment variables in path."""
    return Path(os.path.expanduser(os.path.expandvars(path)))


def ensure_dir(path: Path) -> None:
    """Ensure directory exists, creating if necessary."""
    path.mkdir(parents=True, exist_ok=True)


def file_hash(path: Path) -> Optional[str]:
    """Calculate MD5 hash of file contents."""
    if not path.exists():
        return None
    return hashlib.md5(path.read_bytes()).hexdigest()


def safe_read_json(path: Path) -> Dict[str, Any]:
    """Safely read JSON file, returning empty dict on failure."""
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, IOError) as e:
        print(f"  ⚠️  Warning: Could not parse {path}: {e}")
        return {}


def safe_write_json(path: Path, data: Dict[str, Any], dry_run: bool = False) -> bool:
    """Safely write JSON file with pretty formatting."""
    if dry_run:
        print(f"  [DRY RUN] Would write to {path}")
        return True
    try:
        ensure_dir(path.parent)
        path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
        return True
    except IOError as e:
        print(f"  ❌ Error writing {path}: {e}")
        return False


def backup_file(path: Path, backup_dir: Path) -> Optional[Path]:
    """Create timestamped backup of file."""
    if not path.exists():
        return None
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = backup_dir / f"{path.name}.{timestamp}.bak"
    ensure_dir(backup_dir)
    shutil.copy2(path, backup_path)
    return backup_path


# =============================================================================
# MDC Format Conversion
# =============================================================================

def markdown_to_mdc(content: str, description: str = "", globs: str = "", always_apply: bool = True) -> str:
    """
    Convert markdown content to Cursor's MDC format with YAML frontmatter.
    
    MDC (Markdown with Configuration) is Cursor's rule format that adds
    YAML frontmatter for rule metadata.
    """
    frontmatter = "---\n"
    if description:
        frontmatter += f'description: "{description}"\n'
    if globs:
        frontmatter += f"globs: {globs}\n"
    frontmatter += f"alwaysApply: {str(always_apply).lower()}\n"
    frontmatter += "---\n\n"
    
    return frontmatter + content


def mdc_to_markdown(content: str) -> Tuple[str, Dict[str, Any]]:
    """
    Extract markdown content and metadata from MDC format.
    
    Returns:
        Tuple of (markdown_content, metadata_dict)
    """
    if not content.startswith("---"):
        return content, {}
    
    # Find end of frontmatter
    end_idx = content.find("---", 3)
    if end_idx == -1:
        return content, {}
    
    frontmatter = content[3:end_idx].strip()
    markdown = content[end_idx + 3:].strip()
    
    # Parse simple YAML (without importing yaml library)
    metadata = {}
    for line in frontmatter.split("\n"):
        if ":" in line:
            key, value = line.split(":", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if value.lower() == "true":
                value = True
            elif value.lower() == "false":
                value = False
            metadata[key] = value
    
    return markdown, metadata


# =============================================================================
# AGENTS.md / CLAUDE.md Synchronisation
# =============================================================================

class InstructionSyncer:
    """
    Synchronises AGENTS.md and CLAUDE.md files.
    
    Strategy:
    - AGENTS.md is the canonical source (emerging standard supported by multiple tools)
    - CLAUDE.md is created as a reference/symlink for Claude Code
    - Cursor reads AGENTS.md directly
    """
    
    def __init__(self, project_dir: Path, verbose: bool = False, dry_run: bool = False):
        self.project_dir = project_dir
        self.verbose = verbose
        self.dry_run = dry_run
        self.agents_md = project_dir / PROJECT_CONFIG["agents_md"]
        self.claude_md = project_dir / PROJECT_CONFIG["claude_md"]
    
    def sync(self) -> bool:
        """Synchronise instruction files."""
        print("\n📝 Synchronising instruction files (AGENTS.md / CLAUDE.md)...")
        
        agents_exists = self.agents_md.exists()
        claude_exists = self.claude_md.exists()
        
        if self.verbose:
            print(f"  AGENTS.md exists: {agents_exists}")
            print(f"  CLAUDE.md exists: {claude_exists}")
        
        # Case 1: Neither exists - create template AGENTS.md
        if not agents_exists and not claude_exists:
            print("  Creating template AGENTS.md...")
            self._create_template()
            self._create_claude_reference()
            return True
        
        # Case 2: Only CLAUDE.md exists - migrate to AGENTS.md
        if not agents_exists and claude_exists:
            print("  Migrating CLAUDE.md to AGENTS.md (new standard)...")
            if not self.dry_run:
                shutil.copy2(self.claude_md, self.agents_md)
            self._create_claude_reference()
            return True
        
        # Case 3: Only AGENTS.md exists - create CLAUDE.md reference
        if agents_exists and not claude_exists:
            print("  Creating CLAUDE.md reference to AGENTS.md...")
            self._create_claude_reference()
            return True
        
        # Case 4: Both exist - check if they're in sync
        if agents_exists and claude_exists:
            return self._reconcile_both()
        
        return True
    
    def _create_template(self) -> None:
        """Create a template AGENTS.md file."""
        template = '''# Project Instructions for AI Coding Assistants

## Overview
This file provides instructions and context for AI coding assistants (Claude Code, Cursor, etc.).
It follows the AGENTS.md standard: https://agents.md/

## Project Context
<!-- Add your project description here -->

## Coding Standards
- Follow existing code style and conventions
- Write clear, self-documenting code
- Include appropriate error handling
- Add tests for new functionality

## Architecture
<!-- Describe your project's architecture -->

## Common Commands
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Run linter
```

## File Structure
<!-- Describe important directories and files -->

## Dependencies
<!-- List key dependencies and their purposes -->

## Notes
<!-- Any additional context for the AI assistant -->
'''
        if not self.dry_run:
            self.agents_md.write_text(template, encoding="utf-8")
        print(f"  ✅ Created {self.agents_md}")
    
    def _create_claude_reference(self) -> None:
        """
        Create CLAUDE.md that references AGENTS.md.
        
        Using a reference file rather than symlink for better cross-platform compatibility
        and to handle Claude Code's specific parsing behaviour.
        """
        # Check if CLAUDE.md is already a symlink pointing to AGENTS.md
        if self.claude_md.is_symlink():
            target = self.claude_md.resolve()
            if target == self.agents_md.resolve():
                print("  ✅ CLAUDE.md already symlinked to AGENTS.md")
                return
        
        reference_content = 'See @AGENTS.md\n'
        
        if not self.dry_run:
            self.claude_md.write_text(reference_content, encoding="utf-8")
        print(f"  ✅ Created {self.claude_md} (references AGENTS.md)")
    
    def _reconcile_both(self) -> bool:
        """Reconcile when both AGENTS.md and CLAUDE.md exist."""
        agents_hash = file_hash(self.agents_md)
        claude_hash = file_hash(self.claude_md)
        
        # Check if CLAUDE.md is just a reference
        claude_content = self.claude_md.read_text(encoding="utf-8").strip().lower()
        if claude_content.startswith("see @agents.md") or claude_content.startswith("see agents.md"):
            print("  ✅ CLAUDE.md correctly references AGENTS.md")
            return True
        
        # They're different actual files
        if agents_hash != claude_hash:
            print("  ⚠️  AGENTS.md and CLAUDE.md have different content!")
            print("      Consider consolidating into AGENTS.md and updating CLAUDE.md to reference it.")
            print("      AGENTS.md is the recommended standard for cross-tool compatibility.")
            
            # Show diff summary
            agents_lines = len(self.agents_md.read_text().splitlines())
            claude_lines = len(self.claude_md.read_text().splitlines())
            print(f"      AGENTS.md: {agents_lines} lines")
            print(f"      CLAUDE.md: {claude_lines} lines")
            
            return False
        
        print("  ✅ Both files have identical content")
        return True


# =============================================================================
# Rules Synchronisation
# =============================================================================

class RulesSyncer:
    """
    Synchronises rules between Claude Code and Cursor.
    
    Strategy:
    - .cursor/rules/*.mdc files are the source of truth for rules
    - Claude Code reads CLAUDE.md directly, but can also use custom commands
    - Convert between formats as needed
    """
    
    def __init__(self, project_dir: Path, verbose: bool = False, dry_run: bool = False):
        self.project_dir = project_dir
        self.verbose = verbose
        self.dry_run = dry_run
        self.cursor_rules = project_dir / PROJECT_CONFIG["cursor_rules"]
        self.cursorrules_legacy = project_dir / PROJECT_CONFIG["cursorrules_legacy"]
        self.claude_settings = project_dir / PROJECT_CONFIG["claude_settings"]
    
    def sync(self) -> bool:
        """Synchronise rules across tools."""
        print("\n📋 Synchronising rules...")
        
        success = True
        
        # Handle legacy .cursorrules migration
        if self.cursorrules_legacy.exists():
            success = self._migrate_legacy_cursorrules() and success
        
        # Ensure .cursor/rules directory exists
        if not self.cursor_rules.exists():
            print(f"  Creating {self.cursor_rules} directory...")
            if not self.dry_run:
                ensure_dir(self.cursor_rules)
        
        # List existing rules
        if self.cursor_rules.exists():
            rules = list(self.cursor_rules.glob("*.mdc"))
            if rules:
                print(f"  Found {len(rules)} Cursor rule file(s):")
                for rule in rules:
                    print(f"    - {rule.name}")
            else:
                print("  No .mdc rule files found in .cursor/rules/")
                print("  💡 Tip: Create rules using 'Cmd+Shift+P > New Cursor Rule' in Cursor")
        
        return success
    
    def _migrate_legacy_cursorrules(self) -> bool:
        """Migrate legacy .cursorrules to new .cursor/rules/ format."""
        print("  📦 Found legacy .cursorrules file - migrating to .cursor/rules/")
        
        content = self.cursorrules_legacy.read_text(encoding="utf-8")
        
        # Convert to MDC format
        mdc_content = markdown_to_mdc(
            content,
            description="Migrated from legacy .cursorrules",
            always_apply=True
        )
        
        new_path = self.cursor_rules / "project-rules.mdc"
        
        if not self.dry_run:
            ensure_dir(self.cursor_rules)
            new_path.write_text(mdc_content, encoding="utf-8")
            
            # Backup and remove legacy file
            backup_dir = self.project_dir / ".cursor/backups"
            backup_file(self.cursorrules_legacy, backup_dir)
            print(f"  💡 Legacy .cursorrules backed up and can be removed")
        
        print(f"  ✅ Migrated to {new_path}")
        return True


# =============================================================================
# MCP Server Synchronisation
# =============================================================================

class MCPSyncer:
    """
    Synchronises MCP server configurations.
    
    Strategy:
    - Project-level: .mcp.json in project root (shared with team)
    - User-level: ~/.claude.json or ~/.claude/settings.json
    - Cursor and Claude Code both support .mcp.json for project-level config
    """
    
    def __init__(self, project_dir: Path, verbose: bool = False, dry_run: bool = False):
        self.project_dir = project_dir
        self.verbose = verbose
        self.dry_run = dry_run
        self.mcp_json = project_dir / PROJECT_CONFIG["mcp_json"]
        self.claude_json = expand_path(USER_CONFIG["claude_json"])
    
    def sync(self) -> bool:
        """Synchronise MCP configurations."""
        print("\n🔌 Checking MCP server configurations...")
        
        # Check project-level .mcp.json
        if self.mcp_json.exists():
            mcp_config = safe_read_json(self.mcp_json)
            server_count = len(mcp_config.get("mcpServers", mcp_config))
            print(f"  ✅ Found .mcp.json with {server_count} server(s)")
            
            if self.verbose:
                for name in mcp_config.get("mcpServers", mcp_config).keys():
                    print(f"    - {name}")
        else:
            print("  ℹ️  No project-level .mcp.json found")
            print("     💡 Create one to share MCP servers with your team")
        
        # Check user-level configuration
        if self.claude_json.exists():
            user_config = safe_read_json(self.claude_json)
            
            # MCP servers might be nested under projects
            projects = user_config.get("projects", {})
            total_servers = 0
            
            for project_path, project_config in projects.items():
                servers = project_config.get("mcpServers", {})
                total_servers += len(servers)
            
            # Also check root-level mcpServers
            root_servers = user_config.get("mcpServers", {})
            total_servers += len(root_servers)
            
            if total_servers > 0:
                print(f"  ✅ Found {total_servers} user-level MCP server(s) in ~/.claude.json")
        
        return True
    
    def create_template(self) -> bool:
        """Create a template .mcp.json file."""
        if self.mcp_json.exists():
            print("  ⚠️  .mcp.json already exists")
            return False
        
        template = {
            "mcpServers": {
                "# Add your MCP servers here": {
                    "command": "npx",
                    "args": ["-y", "example-mcp-server"],
                    "env": {}
                }
            }
        }
        
        if not self.dry_run:
            safe_write_json(self.mcp_json, template)
        
        print(f"  ✅ Created template {self.mcp_json}")
        return True


# =============================================================================
# Commands Synchronisation
# =============================================================================

class CommandsSyncer:
    """
    Synchronises custom slash commands.
    
    Strategy:
    - Claude Code: .claude/commands/*.md files
    - Cursor: Commands can be created via UI or files
    - Sync directory structure and content
    """
    
    def __init__(self, project_dir: Path, verbose: bool = False, dry_run: bool = False):
        self.project_dir = project_dir
        self.verbose = verbose
        self.dry_run = dry_run
        self.claude_commands = project_dir / PROJECT_CONFIG["claude_commands"]
        self.user_commands = expand_path(USER_CONFIG["claude_global_commands"])
    
    def sync(self) -> bool:
        """Synchronise custom commands."""
        print("\n⚡ Checking custom commands...")
        
        # Check project-level commands
        if self.claude_commands.exists():
            commands = list(self.claude_commands.glob("*.md"))
            if commands:
                print(f"  ✅ Found {len(commands)} project command(s) in .claude/commands/")
                for cmd in commands:
                    print(f"    - /{cmd.stem}")
            else:
                print("  ℹ️  .claude/commands/ exists but is empty")
        else:
            print("  ℹ️  No project commands directory (.claude/commands/)")
        
        # Check user-level commands
        if self.user_commands.exists():
            commands = list(self.user_commands.glob("*.md"))
            if commands:
                print(f"  ✅ Found {len(commands)} user command(s) in ~/.claude/commands/")
                if self.verbose:
                    for cmd in commands:
                        print(f"    - /{cmd.stem}")
        
        return True
    
    def create_command(self, name: str, content: str, scope: str = "project") -> bool:
        """Create a new custom command."""
        if scope == "project":
            commands_dir = self.claude_commands
        else:
            commands_dir = self.user_commands
        
        if not self.dry_run:
            ensure_dir(commands_dir)
            cmd_path = commands_dir / f"{name}.md"
            cmd_path.write_text(content, encoding="utf-8")
        
        print(f"  ✅ Created command /{name} in {scope} scope")
        return True


# =============================================================================
# Settings Synchronisation
# =============================================================================

class SettingsSyncer:
    """
    Synchronises settings between Claude Code and Cursor.
    
    Note: Settings formats differ between tools, so this focuses on
    ensuring compatible configurations rather than direct syncing.
    """
    
    def __init__(self, project_dir: Path, verbose: bool = False, dry_run: bool = False):
        self.project_dir = project_dir
        self.verbose = verbose
        self.dry_run = dry_run
        self.claude_settings = project_dir / PROJECT_CONFIG["claude_settings"]
        self.claude_settings_local = project_dir / PROJECT_CONFIG["claude_settings_local"]
    
    def sync(self) -> bool:
        """Check and report on settings."""
        print("\n⚙️  Checking settings files...")
        
        # Claude Code project settings
        if self.claude_settings.exists():
            settings = safe_read_json(self.claude_settings)
            print(f"  ✅ Found .claude/settings.json")
            
            # Report key settings
            if "permissions" in settings:
                perms = settings["permissions"]
                if "allowedTools" in perms:
                    print(f"     Allowed tools: {len(perms['allowedTools'])} configured")
                if "deny" in perms:
                    print(f"     Denied patterns: {len(perms['deny'])} configured")
            
            if "hooks" in settings:
                print(f"     Hooks: {len(settings['hooks'])} configured")
        else:
            print("  ℹ️  No .claude/settings.json found")
        
        # Local settings (git-ignored)
        if self.claude_settings_local.exists():
            print("  ✅ Found .claude/settings.local.json (personal/git-ignored)")
        
        return True


# =============================================================================
# Main Orchestrator
# =============================================================================

class ConfigSyncer:
    """Main orchestrator for all synchronisation tasks."""
    
    def __init__(self, project_dir: Path, verbose: bool = False, dry_run: bool = False):
        self.project_dir = project_dir.resolve()
        self.verbose = verbose
        self.dry_run = dry_run
        
        # Initialise sub-syncers
        self.instructions = InstructionSyncer(self.project_dir, verbose, dry_run)
        self.rules = RulesSyncer(self.project_dir, verbose, dry_run)
        self.mcp = MCPSyncer(self.project_dir, verbose, dry_run)
        self.commands = CommandsSyncer(self.project_dir, verbose, dry_run)
        self.settings = SettingsSyncer(self.project_dir, verbose, dry_run)
    
    def sync_all(self) -> bool:
        """Run all synchronisation tasks."""
        print("=" * 60)
        print("🔄 AI Coding Assistant Configuration Sync")
        print("=" * 60)
        print(f"Project: {self.project_dir}")
        
        if self.dry_run:
            print("🔍 DRY RUN MODE - No changes will be made")
        
        success = True
        
        # Run all syncers
        success = self.instructions.sync() and success
        success = self.rules.sync() and success
        success = self.mcp.sync() and success
        success = self.commands.sync() and success
        success = self.settings.sync() and success
        
        # Summary
        print("\n" + "=" * 60)
        if success:
            print("✅ Synchronisation complete!")
        else:
            print("⚠️  Synchronisation completed with warnings")
        
        self._print_tips()
        
        return success
    
    def init_project(self) -> bool:
        """Initialise a new project with AI assistant configuration."""
        print("=" * 60)
        print("🚀 Initialising AI Assistant Configuration")
        print("=" * 60)
        print(f"Project: {self.project_dir}")
        
        if self.dry_run:
            print("🔍 DRY RUN MODE - No changes will be made")
        
        # Create directory structure
        dirs_to_create = [
            self.project_dir / ".claude/commands",
            self.project_dir / ".claude/agents",
            self.project_dir / ".cursor/rules",
        ]
        
        print("\n📁 Creating directory structure...")
        for dir_path in dirs_to_create:
            if not dir_path.exists():
                if not self.dry_run:
                    ensure_dir(dir_path)
                print(f"  ✅ Created {dir_path.relative_to(self.project_dir)}")
        
        # Run full sync (will create templates)
        success = self.sync_all()
        
        # Create additional templates
        self._create_gitignore_entries()
        
        return success
    
    def _create_gitignore_entries(self) -> None:
        """Add appropriate entries to .gitignore."""
        gitignore = self.project_dir / ".gitignore"
        
        entries_to_add = [
            "\n# AI Assistant local configs (not tracked)",
            ".claude/settings.local.json",
            ".claude/backups/",
        ]
        
        existing_content = ""
        if gitignore.exists():
            existing_content = gitignore.read_text(encoding="utf-8")
        
        new_entries = []
        for entry in entries_to_add:
            if entry not in existing_content:
                new_entries.append(entry)
        
        if new_entries:
            print("\n📝 Updating .gitignore...")
            if not self.dry_run:
                with gitignore.open("a", encoding="utf-8") as f:
                    f.write("\n" + "\n".join(new_entries) + "\n")
            print("  ✅ Added AI assistant local config entries")
    
    def _print_tips(self) -> None:
        """Print helpful tips after sync."""
        print("\n💡 Tips:")
        print("  • Edit AGENTS.md for instructions that work across both tools")
        print("  • Use .cursor/rules/*.mdc for Cursor-specific rules")
        print("  • Use .claude/commands/*.md for Claude Code slash commands")
        print("  • Store shared MCP servers in .mcp.json (committed to git)")
        print("  • Keep personal settings in .claude/settings.local.json (git-ignored)")
        print("\n📚 Learn more:")
        print("  • AGENTS.md standard: https://agents.md/")
        print("  • Claude Code docs: https://docs.anthropic.com/en/docs/claude-code")
        print("  • Cursor rules: https://docs.cursor.com/context/rules")


# =============================================================================
# CLI Entry Point
# =============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Synchronise AI coding assistant configurations between Claude Code and Cursor",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s                          # Sync current directory
  %(prog)s --project-dir /path/to/project  # Sync specific project
  %(prog)s --init                   # Initialise new project
  %(prog)s --dry-run                # Preview changes without applying
        """
    )
    
    parser.add_argument(
        "--project-dir", "-p",
        type=Path,
        default=Path.cwd(),
        help="Project directory to sync (default: current directory)"
    )
    
    parser.add_argument(
        "--init", "-i",
        action="store_true",
        help="Initialise a new project with AI assistant configuration"
    )
    
    parser.add_argument(
        "--dry-run", "-n",
        action="store_true",
        help="Show what would be done without making changes"
    )
    
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Show detailed output"
    )
    
    args = parser.parse_args()
    
    # Validate project directory
    if not args.project_dir.exists():
        print(f"❌ Error: Project directory does not exist: {args.project_dir}")
        sys.exit(1)
    
    if not args.project_dir.is_dir():
        print(f"❌ Error: Not a directory: {args.project_dir}")
        sys.exit(1)
    
    # Run sync
    syncer = ConfigSyncer(
        project_dir=args.project_dir,
        verbose=args.verbose,
        dry_run=args.dry_run
    )
    
    if args.init:
        success = syncer.init_project()
    else:
        success = syncer.sync_all()
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
