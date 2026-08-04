# TODO-10 — Gitignore and Remove .agents/skills/ Directory

- **Priority:** 🟠 High
- **Status:** [ ] Not Started
- **Directory:** `.agents/skills/`

---

## Problem

`.agents/skills/` contains 400+ external AI agent skill folders that have
nothing to do with CyberShakti. It bloats the repository significantly,
pollutes directory listings, and makes the project structure confusing
for any new contributor.

---

## Steps to Fix

- [ ] Add `.agents/` to `.gitignore`
- [ ] Remove the directory from git tracking (without deleting local files)
- [ ] Commit the removal

---

## Commands

```bash
# 1. Add to .gitignore
echo ".agents/" >> .gitignore

# 2. Remove from git index (keeps local files)
git rm -r --cached .agents/

# 3. Commit
git add .gitignore
git commit -m "chore: gitignore .agents/ skills directory"
```

---

## If the .agents/ Directory Is Needed Locally

The `--cached` flag above keeps the files on disk but stops tracking them in git.
Anyone who needs the skills locally can keep their own copy without it polluting the repo.

---

## Done When

- [ ] `.agents/` is listed in `.gitignore`
- [ ] `git status` does not show `.agents/` as tracked
- [ ] `listDirectory` on the repo root no longer shows `.agents/` as a major directory
- [ ] `pnpm dev` still works after the change
