# Orchestrator Project - Relevant Components for Pirouette

*Analysis Date: 2025-11-23*

This document identifies key rules, hooks, agents, and skills from the sibling Orchestrator_Project that are highly relevant for the Pirouette design review toolkit.

---

## 🎯 High Priority Components

### 1. Wake-Up & Wrap-Up Protocols

**Location:** `.cursor/rules/wake-up-protocol.mdc` and `wrap-up-protocol.mdc`

**What They Do:**
- **Wake-Up Protocol**: Automatically loads project context when starting a session
  - Verifies project identity
  - Loads AI model configuration
  - Checks Taskmaster status
  - Reviews git status
  - Loads active memories
  - Presents comprehensive wake-up report

- **Wrap-Up Protocol**: Captures session state when ending
  - Checks uncommitted changes
  - Verifies primacy rules
  - Updates Taskmaster status
  - Generates session summary
  - Suggests memories to create
  - Prepares for next session

**Why Relevant for Pirouette:**
- Ensures consistent project context awareness
- Prevents work in wrong project (critical for multi-project environments)
- Maintains continuity between sessions
- Creates session summaries for documentation
- Integrates with Taskmaster workflow

**Implementation Hooks:**
- `lib/hooks/sessionWrapUp.js` - Full implementation with git checks, Taskmaster integration

**Recommendation:** **IMPLEMENT IMMEDIATELY**
- These protocols solve the exact problem of session context management
- Will prevent confusion between Pirouette and Energy OS projects
- Provides professional session boundaries

---

### 2. Project Identity Validation

**Location:** `.cursor/rules/project-identity.mdc`

**What It Does:**
- Validates project context before implementing tasks
- Checks working directory, config file, git remote, PRD
- Prevents implementing tasks from wrong project
- Provides verbalization protocol for agents

**Critical Validation Steps:**
1. Verify working directory matches expected
2. Check `.taskmaster/config.json` → `global.projectName`
3. Validate PRD project field matches current project
4. Require explicit confirmation for cross-project work

**Why Relevant for Pirouette:**
- **CRITICAL**: You have multiple active projects (Pirouette, Energy OS, Orchestrator)
- Prevents costly mistakes of implementing features in wrong codebase
- Enforces explicit confirmation for cross-project patterns

**Recommendation:** **IMPLEMENT IMMEDIATELY**
- Add as first validation step in any task workflow
- Create similar rule for Pirouette's identity
- Reference in wake-up protocol

---

### 3. Analytics Implementation Rules

**Location:** `.cursor/rules/analytics.mdc`

**What It Does:**
- Defines strict patterns for Plausible analytics implementation
- Enforces script tag placement requirements
- Validates event call patterns
- Provides property handling guidelines
- Includes verification workflow

**Key Patterns:**
```javascript
// Safe event call pattern
if (window.plausible) {
  window.plausible('Event_Name', {
    props: {
      key: value || 'default',
      variant: variant.toUpperCase(),
      location: location || 'unknown'
    }
  });
}
```

**Why Relevant for Pirouette:**
- Design review toolkit will likely need analytics
- Prevents common analytics implementation errors
- Provides verification tooling pattern (`npm run verify:analytics`)
- Demonstrates "guardrails + PAI" skill pattern

**Recommendation:** **ADAPT FOR PIROUETTE**
- Not immediate, but valuable for when analytics added
- Pattern can be adapted for any verification needs
- Shows how to create preventative rules

---

### 4. SEO Implementation Rules

**Location:** `.cursor/rules/seo.mdc`

**What It Does:**
- Enforces SEO metadata requirements (title, description)
- Validates content length (titles: 50-60 chars, descriptions: 120-158 chars)
- Handles Open Graph and Twitter Cards
- Provides verification workflow

**Why Relevant for Pirouette:**
- Design review toolkit landing pages need SEO
- Pattern demonstrates content quality validation
- Shows automated content checks
- Provides agent behavior guidelines

**Recommendation:** **CONSIDER FOR MARKETING PAGES**
- Useful when creating landing pages for toolkit
- Pattern applicable to any content quality rules
- Can adapt for design review report quality checks

---

### 5. Directory Detection Hook

**Location:** `lib/hooks/directoryDetection.js`

**What It Does:**
- Automatically detects when user changes directory
- Triggers project context switching
- Monitors process working directory changes
- Detects `cd` commands in user prompts

**Key Features:**
- Zero-effort project switching
- Maintains project path cache
- Validates directory is in registered project
- Auto-switches to detected project context

**Why Relevant for Pirouette:**
- **HIGHLY RELEVANT**: You work across multiple projects
- Prevents manual context switching errors
- Integrates with project validation
- Works with Taskmaster's multi-project support

**Recommendation:** **EVALUATE FOR IMPLEMENTATION**
- Extremely useful in multi-project workflows
- Requires multi-project setup in Orchestrator
- Consider after basic wake-up/wrap-up protocols established

---

### 6. Lateral Thinking Module

**Location:** `lib/lateral-thinking/`

**What It Does:**
- Implements Edward de Bono's lateral thinking techniques
- Provides structured creativity tools:
  - Bad Ideas technique
  - Provocations
  - Random Metaphors
  - SCAMPER method
  - Six Thinking Hats
- Integrates with LLM for idea generation
- Includes scoring and clustering for convergence

**Why Relevant for Pirouette:**
- Design review toolkit could benefit from creative problem-solving
- Lateral thinking applicable to finding design solutions
- Could enhance review process with alternative perspectives
- Demonstrates advanced AI integration pattern

**Recommendation:** **EXPLORE FOR FUTURE ENHANCEMENT**
- Not immediate priority
- Potentially valuable for design review recommendations
- Could generate alternative design approaches
- Consider for "design suggestion" features

---

## 📋 Implementation Priority

### Phase 1: Essential (Implement Now)
1. ✅ **Wake-Up Protocol** - Session context management
2. ✅ **Wrap-Up Protocol** - Session closure and handoff
3. ✅ **Project Identity Validation** - Prevent wrong-project work

### Phase 2: High Value (Next Sprint)
4. **Directory Detection Hook** - Multi-project workflow support
5. **Session Wrap-Up Hook Implementation** - Full git/Taskmaster integration

### Phase 3: Enhancement (Future)
6. **Analytics Rules** - When adding analytics to toolkit
7. **SEO Rules** - For marketing/landing pages
8. **Lateral Thinking Module** - For design suggestion features

---

## 🔧 How to Implement

### Step 1: Create Rules Directory
```bash
mkdir -p .cursor/rules
```

### Step 2: Copy Core Rules
```bash
# From Orchestrator_Project to pirouette
cp ~/Orchestrator_Project/.cursor/rules/wake-up-protocol.mdc .cursor/rules/
cp ~/Orchestrator_Project/.cursor/rules/wrap-up-protocol.mdc .cursor/rules/
cp ~/Orchestrator_Project/.cursor/rules/project-identity.mdc .cursor/rules/
```

### Step 3: Adapt for Pirouette Context
- Update project name references from "Orchestrator_Project" to "pirouette"
- Update directory paths to `/Users/tomeldridge/pirouette`
- Adjust Taskmaster integration to match Pirouette's setup

### Step 4: Test Protocols
```bash
# Test wake-up
# Start new chat and say "wake up"

# Test wrap-up
# End session and say "wrap up"

# Test project validation
# Ensure pwd check, config check working
```

---

## 💡 Key Patterns to Adopt

### 1. Guardrails + PAI Pattern
From Analytics and SEO rules:
- **Guardrails**: Clear rules preventing errors
- **PAI** (Preventative AI): Proactive verification and auto-fixing
- **Verification**: Automated checks before deployment

### 2. Session Lifecycle Management
From Wake-Up and Wrap-Up protocols:
- Structured session boundaries
- Context capture and restoration
- Memory management integration
- Git hygiene enforcement

### 3. Project Context Awareness
From Project Identity Validation:
- Explicit project verification
- Cross-project work requires confirmation
- Verbalization of project context
- Multi-project safety nets

### 4. Hook-Based Architecture
From Directory Detection:
- Pre-processing hooks for context
- Post-processing hooks for cleanup
- Event-driven project switching
- Cached state management

---

## 🎨 Pirouette-Specific Adaptations Needed

### 1. Design Review Context
Adapt wake-up protocol to include:
- Current design being reviewed
- Analysis pattern being used
- Typography/contrast/visual design state
- Last review findings

### 2. Review Session Wrap-Up
Adapt wrap-up protocol to include:
- Design review completion status
- Findings documented
- Recommendations generated
- Report artifacts created

### 3. Design Pattern Validation
Similar to analytics/SEO rules:
- Validate design analysis completeness
- Check for required pattern elements
- Verify report structure
- Ensure accessibility compliance

### 4. Multi-Project Design Context
Adapt directory detection for:
- Switching between design review projects
- Loading project-specific design patterns
- Restoring review context per project

---

## 📚 Related Orchestrator Files

### Core Hooks
- `lib/hooks/sessionWrapUp.js` - Full wrap-up implementation
- `lib/hooks/directoryDetection.js` - Auto project switching
- `lib/hooks/skillSuggestions.js` - Skill recommendation logic
- `lib/hooks/historyCapture.js` - Session history logging
- `lib/hooks/voiceFeedback.js` - Voice feedback integration

### Configuration
- `.cursor/mcp.json` - MCP server configuration
- `.cursor/rules/cursor_rules.mdc` - Rule formatting standards
- `.cursor/rules/self_improve.mdc` - Self-improvement protocol

### Agent Documentation
- `AGENTS.md` - Comprehensive agent integration guide
- `CLAUDE.md` - Claude Code integration specifics
- `ORCHESTRATOR_TASKMASTER_WORKFLOW.md` - Full workflow documentation

---

## 🚀 Next Steps

1. **Review this document** to understand available components
2. **Prioritize which components** to implement first (recommend Phase 1)
3. **Copy and adapt rules** from Orchestrator to Pirouette
4. **Test protocols** in a real session
5. **Iterate based on** Pirouette's specific needs
6. **Document custom patterns** as they emerge

---

## 🔗 Cross-Project Benefits

Implementing these components in Pirouette:
- ✅ Consistent workflow across projects
- ✅ Reduced context switching errors
- ✅ Better session documentation
- ✅ Improved git hygiene
- ✅ Taskmaster integration
- ✅ Professional development practices
- ✅ Reusable patterns for Energy OS

---

**Generated:** 2025-11-23  
**Projects Analyzed:** Orchestrator_Project → Pirouette  
**Recommendation:** Start with Phase 1 (Wake-Up, Wrap-Up, Identity Validation)



