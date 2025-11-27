# Quick Start: Session Protocols

**TL;DR:** Say "wake up" to start. Say "wrap up" to end. That's it.

---

## 🌅 Starting a Session

Say any of these:
- **"wake up"**
- "good morning"
- "let's start"
- "ready"

**You'll get:**
- ✅ Project identity confirmation (you're in Pirouette)
- ✅ Current tasks and next task
- ✅ Git status
- ✅ AI configuration
- ✅ Recent memories
- ✅ Design analysis context

**Time:** ~30-60 seconds

---

## 🌙 Ending a Session

Say any of these:
- **"wrap up"**
- "end session"
- "goodnight"
- "that's all for today"

**You'll get:**
- ✅ Uncommitted changes check (prompts to commit)
- ✅ Task status review (mark completed tasks done)
- ✅ Session summary (what you accomplished)
- ✅ Memory suggestions
- ✅ Documentation check
- ✅ Clear next steps for tomorrow

**Saves:** `.cursor/session-summaries/YYYY-MM-DD-HH-MM.md`

**Time:** ~45-90 seconds

---

## 🛡️ Automatic Protection

**Project Identity Validation** runs automatically:
- ✅ Confirms you're working in Pirouette
- ✅ Prevents Energy OS or Orchestrator code confusion
- ✅ Validates PRDs match current project
- ✅ Alerts if cross-project contamination detected

**No action needed** - it just works.

---

## 💡 Pro Tips

1. **Start every session with "wake up"**
   - Loads full context
   - Reminds you where you left off
   - Shows what's next

2. **End every session with "wrap up"**
   - Captures your progress
   - Suggests memories
   - Prepares for smooth next session

3. **If confused about project context:**
   - Say "refresh" or "reload" to re-run wake-up
   - Check the wake-up report's PROJECT AWARENESS section

4. **Session summaries are gold:**
   - Check `.cursor/session-summaries/` for history
   - Reference past decisions
   - Track your progress over time

---

## 🎯 Example Workflow

### Morning:
```
You: wake up

Agent: 🌅 WAKE-UP REPORT - PIROUETTE
       [Shows full context]
       Next Task: Task 7.3 - Implement visual design analyzer
       
       Ready to proceed?

You: Yes, let's implement the visual design analyzer
```

### Evening:
```
You: wrap up

Agent: 📊 UNCOMMITTED CHANGES DETECTED
       Modified: 3 files (visual-design-analyzer.ts, etc.)
       
       Would you like to commit?

You: Yes, commit with message "feat: implement visual design analyzer core"

Agent: ✅ Committed. Generating session summary...
       
       🌙 SESSION WRAP-UP COMPLETE
       [Shows summary]
       
       Tomorrow's Focus: Task 7.4 - Add visual design tests
```

---

## 📁 Where Things Are Saved

- **Session Summaries:** `.cursor/session-summaries/`
- **Rules:** `.cursor/rules/`
- **Config:** `.taskmaster/config.json`

---

## 🆘 Troubleshooting

**Wake-up not triggering?**
- Try more explicit: "Please run the wake-up protocol"
- Check you're using one of the trigger phrases

**Wrap-up not saving summary?**
- Directory should auto-create
- Check `.cursor/session-summaries/` exists
- Manual trigger: "Please run the wrap-up protocol"

**Project validation alerting incorrectly?**
- Verify `pwd` shows `/Users/tomeldridge/pirouette`
- Check `package.json` name is "pirouette"
- If intentional cross-project work, tell agent explicitly

---

**Questions?** See `PHASE_1_PROTOCOLS_IMPLEMENTED.md` for full details.

**Ready to test?** Start your next session with "wake up"!



