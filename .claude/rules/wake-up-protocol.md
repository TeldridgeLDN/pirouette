# Wake-Up Protocol

**Universal Session Start Protocol - Works in Claude Desktop, Claude Code, Cursor, etc.**

## Trigger Phrases

Say any of these to activate:
- "wake up"
- "good morning" / "good afternoon" / "good evening"
- "let's start"
- "ready"
- "begin"

---

## The Wake-Up Sequence

### 1. Verify Project Identity (30 seconds)
```bash
# Confirm working directory
pwd

# Read project configuration
cat .taskmaster/config.json | grep projectName

# Read package.json for project info
cat package.json | grep -E "name|version|description"
```

**Expected Output:**
- Directory: `/Users/tomeldridge/pirouette`
- Project Name: `pirouette`
- Description: Design Confidence for Non-Designers - Landing page analysis SaaS

---

### 2. Load AI Model Configuration (15 seconds)
```bash
# Read AI model setup
cat .taskmaster/config.json
```

**Verify:**
- Main model configured
- Research model configured
- Fallback model configured

---

### 3. Load Taskmaster Context (45 seconds)

**If MCP Available (Claude Desktop, Cursor with MCP):**
```javascript
// Get current task status
mcp_taskmaster-ai_get_tasks({
  projectRoot: "/Users/tomeldridge/pirouette",
  status: "pending,in-progress"
})

// Identify next task
mcp_taskmaster-ai_next_task({
  projectRoot: "/Users/tomeldridge/pirouette"
})

// List available tags
mcp_taskmaster-ai_list_tags({
  projectRoot: "/Users/tomeldridge/pirouette"
})
```

**If MCP Not Available (Claude Code, other environments):**
```bash
# Read tasks directly
cat .taskmaster/tasks/tasks.json | jq '.tags.master.tasks[] | select(.status == "pending" or .status == "in-progress") | {id, title, status}'

# Get next task
cat .taskmaster/tasks/tasks.json | jq '.tags.master.tasks[] | select(.status == "pending") | {id, title, priority, dependencies}' | head -20
```

**Capture:**
- Total pending/in-progress tasks
- Next task ID and title
- Current tag context
- Available tag contexts

---

### 4. Check Git Status (10 seconds)
```bash
# Current branch and status
git branch --show-current
git status --short

# Recent commits (last 3)
git log --oneline -3
```

**Note:**
- Current branch name
- Uncommitted changes count
- Recent work context

---

### 5. Load Active Context (5 seconds)

**Review available context:**
- Current project focus (Pirouette design review toolkit)
- Recent implementation decisions (from chat history or memories)
- Known blockers or issues
- Cross-project context (vs Energy OS, vs Orchestrator)

---

### 6. Check Design Analysis Context (10 seconds)

**Pirouette-Specific:**
```bash
# Check for active design reviews
ls -la src/lib/analysis/ 2>/dev/null || echo "Analysis directory not found"

# Check pattern definitions (if available)
if [ -f "src/lib/analysis/patterns/default-patterns.json" ]; then
  cat src/lib/analysis/patterns/default-patterns.json | head -20
fi
```

**Note:**
- Analysis modules available (contrast, typography, visual-design)
- Pattern definitions present
- Recent analysis work

---

### 7. Present Wake-Up Report (5 seconds)

Output a structured report:

```
🌅 WAKE-UP REPORT - PIROUETTE
═══════════════════════════════════════════

📍 PROJECT CONTEXT
  • Directory: /Users/tomeldridge/pirouette
  • Project: pirouette (Design Confidence for Non-Designers)
  • Version: [version]
  • Git Branch: [current branch]
  • Uncommitted Changes: [count]

🎨 DESIGN ANALYSIS STATUS
  • Analysis Modules: [contrast, typography, visual-design]
  • Pattern Definitions: [available/needs update]
  • Recent Reviews: [count or description]

🤖 AI CONFIGURATION
  • Main Model: [from config]
  • Research Model: [from config]
  • Fallback Model: [from config]

📋 TASKMASTER STATUS
  • Current Tag: [tag name]
  • Available Tags: [count] contexts
  • Pending Tasks: [count]
  • In-Progress Tasks: [count]
  • Next Task: [id] - [title]
    - Priority: [priority]
    - Type: [task/subtask]
    - Dependencies: [status]

⚠️  PROJECT AWARENESS
  • This is PIROUETTE (design review toolkit)
  • NOT Energy OS (energy management system)
  • NOT Orchestrator (multi-project AI system)

🎯 READY STATE
All systems loaded. Awaiting your direction.

What would you like to focus on?
```

---

## Execution Rules

### DO:
✅ Execute this sequence automatically without asking
✅ Run all steps in parallel where possible
✅ Present the complete report even if some steps fail
✅ Cache the loaded context for the session
✅ Re-run if user says "refresh" or "reload"
✅ Explicitly state project identity to prevent confusion

### DON'T:
❌ Ask "Do you want me to load context?" - just do it
❌ Skip steps because "it might not be relevant"
❌ Stop if one step fails - complete all steps and report issues
❌ Re-run the protocol mid-conversation unless explicitly requested
❌ Confuse Pirouette with Energy OS or Orchestrator projects

---

## Tool Adaptability

### When Using Claude Desktop (with MCP):
- Use MCP tools for Taskmaster integration
- Leverage full MCP server capabilities
- Access structured data directly

### When Using Claude Code / Cursor (without MCP):
- Fall back to file reading with `cat` and `jq`
- Parse JSON manually
- Use shell commands for all operations

### When Using Web Interface (minimal capabilities):
- Guide user to run commands themselves
- Parse output they provide
- Focus on analysis and guidance

---

## Failure Handling

If any step fails:
1. Continue with remaining steps
2. Note the failure in the report
3. Suggest fixes if known
4. Provide manual alternatives

**Examples:**
- If MCP unavailable: Fall back to file reading
- If Taskmaster not configured: Skip task section, note in report
- If git not available: Skip git section, continue with other checks

---

## Why This Exists

**Problem:** Agent inconsistently loaded project context at session start, leading to:
- Missed project validation
- Incomplete task awareness
- Lost configuration context
- Repeated questions about project state
- **Risk of confusing Pirouette with Energy OS or Orchestrator**

**Solution:** Explicit, automatic, comprehensive wake-up sequence triggered by common session-start phrases.

**Pirouette-Specific Benefits:**
- Confirms working on design review toolkit (not energy management)
- Loads design analysis module context
- Prevents cross-project contamination
- Maintains focus on landing page analysis

---

**Last Updated:** 2025-11-23  
**Adapted From:** Orchestrator_Project wake-up protocol  
**Works With:** Claude Desktop, Claude Code, Cursor, any AI coding assistant  
**Next Review:** After first real-world usage in Pirouette

---

*When the user says "wake up," they mean "load everything you need to help me effectively with Pirouette."*

