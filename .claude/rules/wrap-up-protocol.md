# Wrap-Up Protocol

**Universal Session End Protocol - Works in Claude Desktop, Claude Code, Cursor, etc.**

## Trigger Phrases

Say any of these to activate:
- "wrap up"
- "end session"
- "goodnight" / "goodbye"
- "that's all for today"
- "let's stop here"

---

## The Wrap-Up Sequence

### 1. Git Status Check (15 seconds)

```bash
# Check for uncommitted changes
git status --short

# Show what's staged
git diff --cached --stat

# Show what's modified
git diff --stat
```

**Report:**
- Uncommitted changes count
- Staged files ready to commit
- Modified but unstaged files
- Untracked new files
- Current branch
- Unpushed commits

**Prompt User:**
```
📊 UNCOMMITTED CHANGES DETECTED

Staged: [count] files
Modified: [count] files
Untracked: [count] files

Would you like me to:
1. Commit staged changes now
2. Review changes before committing
3. Stage remaining changes and commit all
4. Skip committing (you'll handle later)
```

---

### 2. Taskmaster Status Update (30 seconds)

**If MCP Available:**
```javascript
// Get current task status
mcp_taskmaster-ai_get_tasks({
  projectRoot: "/Users/tomeldridge/pirouette",
  status: "in-progress,review"
})

// Get next task for reference
mcp_taskmaster-ai_next_task({
  projectRoot: "/Users/tomeldridge/pirouette"
})
```

**If MCP Not Available:**
```bash
# Get in-progress tasks
cat .taskmaster/tasks/tasks.json | jq '.tags.master.tasks[] | select(.status == "in-progress" or .status == "review") | {id, title, status}'

# Get next pending task
cat .taskmaster/tasks/tasks.json | jq '.tags.master.tasks[] | select(.status == "pending") | {id, title, priority}' | head -10
```

**Capture:**
- Tasks marked as in-progress (should any be marked done?)
- Tasks in review status
- Next pending task for tomorrow's session
- Any blocked tasks

**Prompt User if Applicable:**
```
🎯 TASK STATUS CHECK

Currently In-Progress:
- [Task ID] - [Title]

Did you complete any of these today?
Would you like to update their status before wrapping up?
```

---

### 3. Design Analysis Status (15 seconds)

**Pirouette-Specific:**
```bash
# Check for modified analysis files
git diff --name-only | grep -E "src/lib/analysis|src/components"

# Check for new test files or reports
ls -t src/lib/analysis/**/*.test.* 2>/dev/null | head -5
```

**Capture:**
- Analysis modules modified
- New patterns added
- Test coverage changes
- Design review reports generated

---

### 4. Session Summary Generation (20 seconds)

**Analyze session activity:**
- Files modified during session (from git diff)
- Tasks worked on (from chat history)
- Key decisions made
- Blockers encountered
- Questions that arose
- Design patterns implemented/refined

**Generate Summary:**
```
📝 SESSION SUMMARY - PIROUETTE
═══════════════════════════════════════════

📅 SESSION INFO
  • Date: [date]
  • Duration: [approximate time based on chat history]
  • Project: pirouette (Design Review Toolkit)
  • Git Branch: [current branch]

💻 FILES MODIFIED
  • [count] files changed
  • [count] files added
  • [count] files deleted
  • Key areas: [list primary directories touched]

🎨 DESIGN ANALYSIS WORK
  • Analysis Modules: [modules modified]
  • Patterns: [patterns added/updated]
  • Components: [components created/modified]
  • Tests: [test coverage changes]

🎯 TASKS WORKED ON
  • [Task ID]: [Status Change] - [Brief description]
  • [Task ID]: [Status Change] - [Brief description]

🧩 WHAT WAS ACCOMPLISHED
  • [Key achievement 1]
  • [Key achievement 2]
  • [Key achievement 3]

🚧 BLOCKERS / OPEN QUESTIONS
  • [Blocker/question 1]
  • [Blocker/question 2]

📍 NEXT SESSION STARTING POINT
  • Next Task: [Task ID] - [Title]
  • Context: [Brief description of what to do next]
  • Files to Review: [Key files for next session]

🧠 MEMORY SUGGESTIONS
  • [Suggest memory 1]
  • [Suggest memory 2]
```

---

### 5. Memory Management (10 seconds)

**Review and suggest:**
- Key decisions that should be remembered
- Design pattern discoveries
- Implementation patterns discovered
- User preferences expressed
- Cross-project context that's relevant

**Prompt User:**
```
🧠 MEMORY SUGGESTIONS

Based on this session, I recommend creating/updating these memories:

1. [Suggested memory title]
   Content: [Brief description]
   
2. [Suggested memory title]
   Content: [Brief description]

Would you like me to create these memories?
```

---

### 6. Documentation Check (10 seconds)

```bash
# Check for undocumented changes
git diff --name-only | grep -E "(README|CHANGELOG|\.md$|PRD)"

# Check if design analysis docs need updating
git diff --cached --name-only src/lib/analysis/ | grep -v "README"
```

**Prompt if Needed:**
```
📚 DOCUMENTATION CHECK

⚠️  Code changes detected without corresponding documentation updates.

Modified files:
- [file 1]
- [file 2]

Would you like to:
1. Update relevant README sections
2. Document design patterns in PRD
3. Add implementation notes
4. Skip (I'll handle later)
```

---

### 7. Branch & Sync Status (10 seconds)

```bash
# Check branch status
git status -sb

# Check if branch is pushed
git rev-list @{u}.. 2>/dev/null | wc -l

# Check for remote changes
git fetch --dry-run 2>&1
```

**Report:**
```
🌿 BRANCH STATUS

Current Branch: [branch name]
Unpushed Commits: [count]
Branch Up to Date: [yes/no]
Remote Changes Available: [yes/no]

Recommendation: [push/pull/sync suggestion]
```

---

### 8. Save Session Summary (10 seconds)

**If File System Access Available:**
```bash
# Create session summary directory
mkdir -p .claude/session-summaries

# Save summary with timestamp
echo "[SUMMARY_CONTENT]" > .claude/session-summaries/$(date +%Y-%m-%d-%H-%M).md
```

**If File System Access Not Available:**
- Present summary in chat
- Suggest user copy to their notes
- Recommend saving in project documentation

---

### 9. Final Wrap-Up Report (10 seconds)

**Present comprehensive closing summary:**

```
🌙 SESSION WRAP-UP COMPLETE - PIROUETTE
═══════════════════════════════════════════

✅ READY FOR NEXT SESSION
  • All changes committed (or intentionally left)
  • Tasks updated in Taskmaster
  • Session summary saved
  • Memories created/updated
  • Documentation current

📋 TOMORROW'S FOCUS
  • Start with: [Next task or starting point]
  • Context: [Brief reminder of where we left off]
  • Design Module: [Which analysis module to work on]

💾 SESSION SAVED
  • Summary: .claude/session-summaries/[timestamp].md
  • Memories: [count] created/updated
  • Commits: [count] made

🔄 STATUS AT SESSION END
  • Project: pirouette (Design Review Toolkit)
  • Branch: [branch name]
  • Git Status: [clean / N uncommitted changes]
  • Taskmaster: [X pending, Y in-progress, Z done]
  • Analysis Modules: [status]

Have a great rest of your day! 👋

When you return, just say "wake up" to restore context.
```

---

## Execution Rules

### DO:
✅ Execute sequence automatically when triggered
✅ Save session summary (if possible)
✅ Prompt for commits if uncommitted changes exist
✅ Suggest memory creation/updates
✅ Offer to update documentation if code changed
✅ Provide clear "next session" starting point
✅ Capture design analysis-specific context

### DON'T:
❌ Force commits without user approval
❌ Skip the summary even if session was short
❌ Lose context about what was accomplished
❌ Close without offering to update Taskmaster
❌ Create memories without user consent
❌ Forget to note design pattern work

---

## Tool Adaptability

### When Using Claude Desktop (with file access):
- Save session summaries to `.claude/session-summaries/`
- Create memories programmatically
- Full file system integration

### When Using Claude Code / Cursor (with file access):
- Save session summaries to `.cursor/session-summaries/` or `.claude/session-summaries/`
- Use git integration features
- Leverage IDE capabilities

### When Using Web Interface (no file access):
- Present summary in chat for user to copy
- Guide user to save summary manually
- Focus on memory and next steps suggestions

---

## Session Summary File Format

**Markdown structure for saved summaries:**

```markdown
# Session Summary - [Date] [Time]

## Project Context
- **Project:** pirouette (Design Review Toolkit)
- **Branch:** [branch]
- **Starting Task:** [task that started session]

## Accomplishments
- [What was completed]
- [Key implementations]
- [Problems solved]

## Design Analysis Work
- **Modules Modified:** [list]
- **Patterns Added/Updated:** [list]
- **Components Created:** [list]
- **Tests Written:** [list]

## Files Modified
- `path/to/file1.ts` - [What changed]
- `path/to/file2.tsx` - [What changed]

## Tasks Updated
- **[Task ID]:** [Old Status] → [New Status]
- **[Task ID]:** [Old Status] → [New Status]

## Decisions Made
- [Key decision 1 and rationale]
- [Key decision 2 and rationale]

## Design Patterns Discovered
- [Pattern 1]: [Description and application]
- [Pattern 2]: [Description and application]

## Blockers / Open Questions
- [Blocker 1]
- [Question 1]

## Next Session
- **Start With:** [Task ID] - [Title]
- **Context:** [What to focus on]
- **Files to Review:** [Key files]
- **Design Module Focus:** [Which analysis module]

## Memories Created/Updated
- [Memory 1]
- [Memory 2]

## Commits Made
- `[hash]` - [commit message]
- `[hash]` - [commit message]

---
*Next wake-up command will restore this context*
```

---

## Integration with Wake-Up

**Wake-Up Protocol Enhancement:**

When user says "wake up", also check for latest session summary:

```bash
# Find latest session summary (try both locations)
LATEST_SUMMARY=$(ls -t .claude/session-summaries/*.md .cursor/session-summaries/*.md 2>/dev/null | head -1)

# Include in wake-up report
if [ -n "$LATEST_SUMMARY" ]; then
  echo "📄 Last Session: $(basename $LATEST_SUMMARY)"
  echo "   Focus: [extracted next session starting point]"
fi
```

---

## Failure Handling

If any step fails:
1. Continue with remaining steps
2. Note the failure in wrap-up report
3. Don't block session end
4. Provide manual alternatives

**Examples:**
- If can't save file: Present summary in chat
- If MCP unavailable: Use file reading
- If git unavailable: Skip git section
- If Taskmaster not configured: Skip task section

---

## Why This Exists

**Problem:** Sessions end abruptly without capturing:
- What was accomplished
- What needs to happen next
- Uncommitted work status
- Session learnings for memory
- **Design pattern discoveries**

**Solution:** Structured wrap-up that ensures continuity between sessions and nothing is lost.

**Pirouette-Specific Benefits:**
- Captures design analysis progress
- Documents pattern discoveries
- Tracks component development
- Maintains test coverage awareness
- Ensures cross-project boundaries maintained

---

**Last Updated:** 2025-11-23  
**Adapted From:** Orchestrator_Project wrap-up protocol  
**Works With:** Claude Desktop, Claude Code, Cursor, any AI coding assistant  
**Next Review:** After first real-world usage in Pirouette

---

*When the user says "wrap up," they mean "help me close this session properly and set up for next time."*




