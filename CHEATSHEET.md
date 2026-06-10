# Spec Kit — Swecha Compliance Cheatsheet

Welcome to the **Swecha Compliance Spec Kit** workflow for Streakr.

## Initialization

1. Ensure `.speckit/` and `.specify/` exist in the project root.
2. Load `CHEATSHEET.md` and `.speckit/constitution.md` before agent work.

## The 10-Step Workflow

```text
Step 1  Initialize          Bootstrap GitLab CI, pre-commit, and docs.
Step 2  Constitution        Load `.speckit/constitution.md` (or `.specify/memory/constitution.md`).
Step 3  Specify             Draft feature spec (WHAT & WHY).
Step 4  Clarify             Resolve ambiguities via `.speckit/prompts/clarify.md`.
Step 5  Checklist           Validate requirements via `.speckit/prompts/checklist.md`.
Step 6  Plan                Draft technical plan in `.speckit/templates/plan.md`.
Step 7  Tasks               Break work into `.speckit/templates/tasks.md`.
Step 8  Mega Audit          Run the 7-agent audit before implementation.
Step 9  Implement           Execute tasks using `.speckit/prompts/implement.md`.
Step 10 Git Sync            Commit using `.speckit/prompts/git_workflows.md`.
```

## Compliance Checklist

| Item | File / Tool |
|------|-------------|
| Secret scanning | `gitleaks` in `.pre-commit-config.yaml` + CI |
| Changelog | `cliff.toml`, `CHANGELOG.md` |
| Pre-commit | `.pre-commit-config.yaml` |
| GitLab CI | `.gitlab-ci.yml` |
| License | `LICENSE` (AGPL-3.0) |
| Spec-Kit | `.specify/` + `.speckit/` |
| Release tag | `git tag v4.0.0` |
