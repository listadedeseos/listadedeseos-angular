---
name: update-claude-memory
description: Keep this repo's CLAUDE.md (and any nested CLAUDE.md files) in sync with the codebase. Use at the end of any task that changed files in this project — new features, bug fixes, refactors, styling/theme changes, new pages/components/routes, dependency or config changes — right before telling the user the work is done. Not for read-only investigation or answering questions.
---

# Update CLAUDE.md after a change

This repo's `CLAUDE.md` is meant to always describe the app, its architecture, and its file tree
as they currently are — plus a changelog of what changed and why. Run this skill right after
finishing a set of edits to the codebase, before your final summary to the user.

## Steps

1. **Figure out what actually changed.** Use `git status` / `git diff` (or the edits you just made
   in this conversation) to see which files were added, removed, or modified.

2. **Decide if `CLAUDE.md` needs a structural update**, not just a changelog line. Update the
   relevant section(s) if the change:
   - Added/removed/renamed a page, component, route, service, or top-level directory → update
     "File tree" and, if relevant, "Architecture".
   - Changed the tech stack, build/test commands, or a core convention (e.g. state management
     approach, styling approach) → update "Tech stack" / "Commands" / "Conventions to follow".
   - Introduced a new domain concept a future Claude session would need to know about (e.g. a new
     theming system, a new integration like Steam/Amazon, a new auth flow) → update "What this app
     is" / "Architecture".
   - Was purely cosmetic/internal with no structural implication (e.g. a styling tweak within an
     existing component) → skip the structural update, just log it.

3. **Append a changelog entry** under the `## Changelog` section at the bottom of `CLAUDE.md`,
   newest entry last. Format:
   ```
   - YYYY-MM-DD — <what changed and why, one or two sentences, plain language> (`path/to/file(s)`)
   ```
   Use today's date. Be specific enough that a future session understands the change without
   reading the diff, but don't paste code or restate the obvious from filenames.

4. **Consider whether a nested `CLAUDE.md` is warranted.** If the change adds a substantial new
   subsystem with its own non-obvious conventions (e.g. a new `src/pages/<feature>/` with several
   files and its own rules), it's fine to add a short `CLAUDE.md` inside that directory instead of
   bloating the root file — link to it from the root `CLAUDE.md`'s file tree or architecture
   section. Don't create nested files for small/simple additions; the root file is the default.

5. **Don't duplicate or pad.** If an equivalent changelog entry already exists (e.g. you're
   iterating on the same task across a few tool calls), update that entry instead of adding a new
   one. Skip this whole skill for no-op runs (tests passing, formatting only, nothing behavior- or
   structure-relevant changed).

## What NOT to do

- Don't turn this into a running commit-by-commit log — squash multiple edits from the same task
  into one changelog entry.
- Don't restate git history or file diffs verbatim; summarize intent and impact.
- Don't invent structure that isn't there yet (no speculative "future work" sections).
