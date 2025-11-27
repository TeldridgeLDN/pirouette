# Project Identity Validation

**Universal Protocol - Works in Claude Desktop, Claude Code, Cursor, any AI assistant**

## CRITICAL RULE: Always validate project context before implementing tasks

---

## Current Project

**Canonical Name:** `pirouette`

**Project Identifiers:**
- Working Directory: `/Users/tomeldridge/pirouette`
- Config File: `.taskmaster/config.json` → `global.projectName`
- Package Name: `package.json` → `"pirouette"`
- Description: "Design Confidence for Non-Designers - Landing page analysis SaaS"
- Primary PRD: `.taskmaster/docs/prd.txt` or `PRD_ALIGNMENT_CHECK.md`

**What This Project IS:**
- ✅ Design review toolkit for landing pages
- ✅ Visual design analysis (contrast, typography, visual design)
- ✅ Pattern-based automated review system
- ✅ SaaS tool for non-designers
- ✅ Next.js application with React 19

**What This Project IS NOT:**
- ❌ Energy OS (energy management system at `/Users/tomeldridge/multi-layer-cal`)
- ❌ Orchestrator (multi-project AI system at `/Users/tomeldridge/Orchestrator_Project`)
- ❌ Calendar application
- ❌ Task management system (though it uses Taskmaster)
- ❌ Wellness tracking application

---

## Validation Protocol

### Before ANY Implementation

When starting work on a task, especially from a PRD:

1. **Verify Working Directory**
   ```bash
   # Expected: /Users/tomeldridge/pirouette
   pwd
   ```

2. **Check Package.json Project Name**
   ```bash
   cat package.json | grep '"name"'
   # Expected: "name": "pirouette",
   
   cat package.json | grep '"description"'
   # Expected: "description": "Design Confidence for Non-Designers - Landing page analysis SaaS"
   ```

3. **Check Config Project Name**
   ```bash
   # Should show "pirouette" or "Taskmaster" (default)
   cat .taskmaster/config.json | grep projectName
   ```

4. **If Reading a PRD, Validate Project Field**
   ```markdown
   **Project**: [Name Here]
   
   ✅ CORRECT: "Pirouette" or "pirouette" or "Design Review Toolkit"
   ❌ WRONG: "Energy OS" or "Orchestrator" or "multi-layer-cal" or any other project name
   ```

### If Mismatch Detected

**STOP IMMEDIATELY and alert user:**

```
⚠️ PROJECT IDENTITY MISMATCH DETECTED

Current Working Directory: pirouette
PRD Project Field: [Different Project Name]

This indicates one of:
1. Wrong PRD being used in this project
2. Copy-paste error in PRD header
3. You're in the wrong project directory

🛑 CONFIRM WITH USER:
- Which project should this work be done in?
- Should the PRD be updated?
- Is this intentional cross-project work?

DO NOT PROCEED until user clarifies.
```

---

## Verbalization Protocol

When starting significant work, explicitly state project context:

```
"I'm working in Pirouette (design review toolkit). Let me verify the task 
requirements match this project before proceeding..."

[After checking PRD]
"✅ Confirmed: Task is for Pirouette. Proceeding with implementation."

OR

"⚠️ Warning: PRD indicates [Other Project] but we're in Pirouette. 
Please clarify before I proceed."
```

---

## Cross-Project Work

If user explicitly wants to implement features from ProjectA in ProjectB:

1. **Require Explicit Confirmation**
   - User must state: "Yes, implement ProjectA features in ProjectB"
   
2. **Document the Decision**
   - Add note to task: "Cross-project implementation approved by user"
   - Explain why this makes sense

3. **Extra Caution**
   - Double-check all file paths
   - Verify dependencies are compatible
   - Test thoroughly

---

## Common Scenarios

### ✅ CORRECT - Same Project

```
Working Dir: /Users/tomeldridge/pirouette
PRD Project: "Pirouette Design Review Toolkit"
→ MATCH: Proceed with confidence
```

### ❌ WRONG - Different Project

```
Working Dir: /Users/tomeldridge/pirouette
PRD Project: "Energy OS Energy Management System"
→ MISMATCH: Alert user immediately
```

### ❌ WRONG - Similar Names but Different Project

```
Working Dir: /Users/tomeldridge/pirouette
PRD Project: "Multi-Layer Calendar"
→ MISMATCH: These are completely different projects
```

### ⚠️ AMBIGUOUS - Needs Clarification

```
Working Dir: /Users/tomeldridge/pirouette
PRD Project: "Design System"
→ UNCLEAR: Could apply to multiple projects, verify with user
```

---

## Sibling Project Awareness

**Active Projects in Same Environment:**

1. **pirouette** (THIS PROJECT)
   - Path: `/Users/tomeldridge/pirouette`
   - Purpose: Design review toolkit, landing page analysis
   - Tech: Next.js, React 19, TypeScript

2. **Energy OS** (DIFFERENT PROJECT)
   - Path: `/Users/tomeldridge/multi-layer-cal`
   - Purpose: Energy management, calendar system, wellness tracking
   - Tech: pnpm monorepo, Next.js, Expo

3. **Orchestrator_Project** (DIFFERENT PROJECT)
   - Path: `/Users/tomeldridge/Orchestrator_Project`
   - Purpose: Multi-project AI system, development workflows
   - Tech: Node.js, hooks system, MCP servers

**Never confuse these projects during implementation!**

---

## Edge Cases

**Shared Patterns:**
- If adapting patterns FROM Orchestrator TO Pirouette
- Explicitly document: "Adapting [pattern] from Orchestrator for Pirouette use"
- Verify dependencies are compatible
- Test independently

**PRD with Multiple Projects:**
- If PRD mentions both projects
- Clarify which project is PRIMARY for this work
- Document cross-project implications

**Learning from Other Projects:**
- If referencing Energy OS or Orchestrator for inspiration
- Note: "Using [concept] from [project] as reference"
- Adapt, don't copy blindly
- Ensure it fits Pirouette's architecture

---

## Validation Tools

Use these to verify project identity:

```bash
# Quick project check
echo "Directory: $(basename $(pwd))"
cat package.json | grep -E "\"name\"|\"description\"" | head -2

# Expected output:
# Directory: pirouette
# "name": "pirouette",
# "description": "Design Confidence for Non-Designers - Landing page analysis SaaS",
```

---

## Critical Files to Check

Before implementing, quickly scan these for project identity:

1. `package.json` → `name` and `description`
2. `.taskmaster/config.json` → `global.projectName`
3. `README.md` → Project title
4. `.taskmaster/docs/prd.txt` or `PRD_ALIGNMENT_CHECK.md`

All should refer to Pirouette or design review concepts.

---

## Consequences of Violation

If project validation is skipped and wrong project is implemented:

- ⚠️ **Minor:** Wasted time, need to delete and redo
- 🔴 **Major:** Code incompatibility, merge conflicts, wrong dependencies
- 💥 **Critical:** Implementing energy management code in design toolkit (or vice versa)

**Always validate. Always.**

---

## Design Analysis Context Checks

**Additional Pirouette-Specific Validation:**

When working on design analysis features, verify:

```bash
# Should exist in Pirouette
ls src/lib/analysis/core/ 2>/dev/null
ls src/lib/analysis/patterns/ 2>/dev/null

# Should NOT exist (Energy OS concepts)
ls packages/shared/types/energy.ts 2>/dev/null && echo "⚠️ WRONG PROJECT!" || echo "✅ Correct project"
ls apps/web/components/EnergyChart* 2>/dev/null && echo "⚠️ WRONG PROJECT!" || echo "✅ Correct project"
```

If you see Energy OS concepts in Pirouette directory:
- **STOP** - wrong project or contamination
- Alert user immediately

---

## Tool Adaptability

### When Using Claude Desktop / Claude Code / Cursor:
- Execute validation commands directly
- Check file contents programmatically
- Full file system access

### When Using Web Interface:
- Guide user to run validation commands
- Ask user to confirm directory with `pwd`
- Request project name confirmation

### Always, Regardless of Tool:
- Verbalize project identity at session start
- State project context before major implementations
- Confirm with user if any doubt

---

## Rule Updates

This rule was created on 2025-11-23 adapted from Orchestrator_Project.

**Reason:** Multiple active projects (Pirouette, Energy OS, Orchestrator) with similar development patterns create risk of implementing features in wrong codebase.

**Last Updated:** 2025-11-23  
**Adapted From:** Orchestrator_Project project-identity.mdc  
**Works With:** Claude Desktop, Claude Code, Cursor, any AI coding assistant  
**Next Review:** 2025-12-23 (or after next project confusion incident)

---

*When in doubt about project identity, ask the user. 
Better to ask once than implement in the wrong project.*

**Remember: This is PIROUETTE - a design review toolkit for landing pages. 
NOT Energy OS. NOT Orchestrator. NOT a calendar. NOT wellness tracking.**



