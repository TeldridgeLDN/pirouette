# Universal Session Protocols - Multi-Tool Guide

**Works With:** Claude Desktop, Claude Code, Cursor, Windsurf, or any AI coding assistant

---

## 🎯 Philosophy: Tool-Agnostic Design

These protocols are designed to work **everywhere**, adapting automatically to available capabilities:

- **Full MCP Support** (Claude Desktop, Cursor with MCP): Use structured tools
- **File System Access** (Claude Code, Cursor): Execute commands directly
- **Limited Access** (Web interfaces): Guide user through manual steps

**You get the same experience regardless of which tool you're using.**

---

## 📁 File Structure (Both Locations)

### For Cursor:
```
.cursor/
├── rules/
│   ├── wake-up-protocol.mdc
│   ├── wrap-up-protocol.mdc
│   └── project-identity.mdc
└── session-summaries/
    └── [YYYY-MM-DD-HH-MM.md]
```

### For Claude Desktop / Claude Code:
```
.claude/
├── rules/
│   ├── wake-up-protocol.md
│   ├── wrap-up-protocol.md
│   └── project-identity.md
└── session-summaries/
    └── [YYYY-MM-DD-HH-MM.md]
```

**Both exist simultaneously** - use whichever tool you prefer!

---

## 🌅 Wake-Up Protocol

### Trigger Phrases (Universal)
- "wake up"
- "good morning" / "good afternoon" / "good evening"
- "let's start"
- "ready"
- "begin"

### How It Adapts

#### In Claude Desktop (with MCP):
```javascript
// Uses MCP tools for structured data
mcp_taskmaster-ai_get_tasks({...})
mcp_taskmaster-ai_next_task({...})
```

#### In Cursor / Claude Code (with file access):
```bash
# Falls back to direct file reading
cat .taskmaster/tasks/tasks.json | jq '...'
```

#### In Web Interface (limited access):
```
Agent guides: "Can you run: cat .taskmaster/tasks/tasks.json | jq '...'"
Then parses user-provided output
```

**You get the same comprehensive wake-up report in all cases.**

---

## 🌙 Wrap-Up Protocol

### Trigger Phrases (Universal)
- "wrap up"
- "end session"
- "goodnight" / "goodbye"
- "that's all for today"
- "let's stop here"

### How It Adapts

#### Session Summary Saving:

**With File Access (Claude Desktop, Cursor, Claude Code):**
```bash
# Automatically saves to appropriate location
.claude/session-summaries/2025-11-23-17-30.md
# OR
.cursor/session-summaries/2025-11-23-17-30.md
```

**Without File Access (Web Interface):**
```
Presents full summary in chat
Suggests: "Copy this summary to your notes"
Provides formatted markdown for easy copying
```

#### Git Integration:

**With Command Execution:**
```bash
git status --short
git diff --cached --stat
# Automatic uncommitted changes detection
```

**Without Command Execution:**
```
Guides user: "Can you share output of: git status --short"
Analyzes user-provided git status
Provides recommendations based on that
```

**You get the same session closure experience, adapted to your environment.**

---

## 🛡️ Project Identity Validation

### Always Active (Universal)

This works the same everywhere because it's primarily **logic-based**:

1. **Verbalization**: AI states project identity at session start
2. **Validation**: Checks directory, config, PRD match
3. **Alerting**: Stops if mismatch detected

### How It Adapts

#### With File Access:
```bash
# Automatic validation
pwd
cat package.json | grep '"name"'
cat .taskmaster/config.json | grep projectName
```

#### Without File Access:
```
Agent asks: "Can you confirm current directory? (Run: pwd)"
User provides: "/Users/tomeldridge/pirouette"
Agent verifies: "✅ Confirmed: Working in Pirouette"
```

**You get the same protection against wrong-project work.**

---

## 🔄 Feature Comparison

| Feature | Claude Desktop (MCP) | Cursor / Claude Code | Web Interface |
|---------|---------------------|---------------------|---------------|
| **Wake-Up** | ✅ Full auto | ✅ Full auto | ⚠️ Semi-auto |
| **Wrap-Up** | ✅ Full auto | ✅ Full auto | ⚠️ Semi-auto |
| **Identity Check** | ✅ Auto | ✅ Auto | ⚠️ Interactive |
| **Session Save** | ✅ Auto | ✅ Auto | ❌ Manual copy |
| **Git Integration** | ✅ Auto | ✅ Auto | ⚠️ User provides |
| **Taskmaster** | ✅ MCP tools | ⚠️ File reading | ⚠️ User reads |
| **Memory Creation** | ✅ Programmatic | ✅ Programmatic | ⚠️ Manual |

**Legend:**
- ✅ Full auto: Works automatically, zero user action
- ⚠️ Semi-auto: Works with minimal user input
- ❌ Manual: Requires user to copy/paste

---

## 💡 Best Practices by Tool

### Claude Desktop Users:
- ✅ Leverage full MCP integration
- ✅ Session summaries auto-saved to `.claude/session-summaries/`
- ✅ Memories created programmatically
- ✅ Best for: Maximum automation

### Cursor Users:
- ✅ Use `.cursor/rules/*.mdc` for native integration
- ✅ Session summaries auto-saved to `.cursor/session-summaries/`
- ✅ Full file system access
- ✅ Best for: IDE-integrated workflows

### Claude Code Users:
- ✅ Use `.claude/rules/*.md` for compatibility
- ✅ Session summaries auto-saved
- ✅ Git integration works well
- ✅ Best for: Command-line focused work

### Web Interface Users:
- ⚠️ More manual steps required
- ⚠️ Copy summaries to your notes
- ⚠️ Provide command outputs when requested
- ✅ Best for: Quick consultations, planning

---

## 🎨 Pirouette-Specific Enhancements (All Tools)

Regardless of tool, protocols include:

### Wake-Up Additions:
- **Design Analysis Context:** Checks `src/lib/analysis/` status
- **Pattern Definitions:** Reviews available patterns
- **Module Status:** Reports on contrast, typography, visual design modules

### Wrap-Up Additions:
- **Design Work Summary:** Captures analysis module modifications
- **Pattern Discoveries:** Documents new patterns found
- **Component Changes:** Tracks React component updates
- **Test Coverage:** Reports on test file changes

### Identity Validation:
- **Sibling Project Awareness:** Prevents Energy OS / Orchestrator confusion
- **Design Context Checks:** Ensures design-specific files exist
- **Cross-Project Protection:** Validates against wrong-project work

**These enhancements work in all tools.**

---

## 🚀 Quick Start by Tool

### Starting with Claude Desktop:
1. Open Claude Desktop
2. Navigate to project: `cd /Users/tomeldridge/pirouette`
3. Say: "wake up"
4. Protocol runs with full MCP integration

### Starting with Cursor:
1. Open Cursor in pirouette project
2. Open AI chat (Cmd+L)
3. Say: "wake up"
4. Protocol runs using `.cursor/rules/wake-up-protocol.mdc`

### Starting with Claude Code:
1. Open terminal in pirouette
2. Start Claude Code: `claude`
3. Say: "wake up"
4. Protocol runs using `.claude/rules/wake-up-protocol.md`

### Starting with Web Interface:
1. Navigate to Claude.ai
2. Start new conversation
3. Say: "wake up for pirouette project"
4. Protocol guides you through validation steps

---

## 📋 Migration Between Tools

### Switching from Cursor to Claude Desktop:
✅ Session summaries readable in both locations  
✅ Same Taskmaster integration  
✅ Protocols work identically  
✅ Just say "wake up" in new tool

### Switching from Web to Desktop Client:
✅ Manual summaries can be imported  
✅ Context preserved through chat history  
✅ Upgrade to automatic features  
✅ No data loss

### Using Multiple Tools Simultaneously:
✅ Session summaries saved to both `.claude/` and `.cursor/`  
✅ Git status works across all tools  
✅ Taskmaster is source of truth  
✅ Pick whichever tool fits the task

---

## 🔧 Customization

### Per-Tool Customization:

**Cursor-Specific (`.cursor/rules/*.mdc`):**
- Add Cursor IDE-specific commands
- Integrate with Cursor-specific features
- Customize for Cursor UI

**Claude-Specific (`.claude/rules/*.md`):**
- Add Claude Desktop-specific features
- Integrate with Claude Projects
- Customize for Claude UI

**Both maintain same core protocols.**

---

## 🆘 Troubleshooting

### Protocol Not Triggering?

**Cursor:**
- Check `.cursor/rules/` files exist
- Verify `alwaysApply: true` in frontmatter
- Try explicit: "Run wake-up protocol"

**Claude Desktop:**
- Check `.claude/rules/` files exist
- Try explicit: "Run wake-up protocol"
- Verify project context loaded

**Claude Code:**
- Check `.claude/rules/` files exist
- Try explicit: "Execute wake-up sequence"
- Ensure in correct directory

### Session Summary Not Saving?

**With File Access:**
```bash
# Check directory exists
ls .claude/session-summaries/ || mkdir -p .claude/session-summaries/
ls .cursor/session-summaries/ || mkdir -p .cursor/session-summaries/
```

**Without File Access:**
- Copy summary from chat
- Save manually to project notes
- Consider upgrading to desktop client

### MCP Tools Not Working?

**Cursor:**
- Check `.cursor/mcp.json` configured
- Verify taskmaster-ai MCP server running
- Fallback: Direct file reading still works

**Claude Desktop:**
- Check MCP configuration
- Restart Claude Desktop
- Fallback: Command execution still works

---

## 🎯 Recommended Setup

### Optimal Configuration:
1. **Use both** `.cursor/` and `.claude/` directories
2. **Keep protocols in sync** between both
3. **Choose primary tool** based on task:
   - Cursor: For IDE-integrated coding
   - Claude Desktop: For planning and research
   - Claude Code: For terminal-focused work
4. **Session summaries** auto-save to both locations

### Why Both Directories?
- **Flexibility:** Switch tools without losing functionality
- **Backup:** Double redundancy for session history
- **Team:** Different team members can use different tools
- **Future-Proof:** As tools evolve, you're covered

---

## 📚 Related Documentation

- **Implementation:** `PHASE_1_PROTOCOLS_IMPLEMENTED.md`
- **Quick Start:** `QUICK_START_PROTOCOLS.md`
- **Source Analysis:** `ORCHESTRATOR_RELEVANT_COMPONENTS.md`

### Protocol Files:

**Cursor-Specific:**
- `.cursor/rules/wake-up-protocol.mdc`
- `.cursor/rules/wrap-up-protocol.mdc`
- `.cursor/rules/project-identity.mdc`

**Claude-Specific:**
- `.claude/rules/wake-up-protocol.md`
- `.claude/rules/wrap-up-protocol.md`
- `.claude/rules/project-identity.md`

---

## ✅ Success Criteria

Protocols are working correctly when:

1. ✅ **Tool-Agnostic**: Same experience in Cursor, Claude Desktop, Claude Code
2. ✅ **Graceful Degradation**: Works even with limited capabilities
3. ✅ **Session Continuity**: Context preserved between sessions
4. ✅ **Project Safety**: Never confuse Pirouette with other projects
5. ✅ **Zero Setup**: Works immediately after protocol files exist

---

**Created:** 2025-11-23  
**Philosophy:** Write once, run anywhere  
**Status:** ✅ Production-ready for all major AI coding assistants




