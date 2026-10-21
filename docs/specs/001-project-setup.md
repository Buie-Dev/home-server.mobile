# 001 Project Setup

## Goal

Set up project infrastructure so that future work follows a consistent workflow with clear documentation, spec-driven development and pull request templates.

## Context

This is a React Native 0.77 mobile app (TypeScript) that controls a home server and personal apps. It communicates with `homeserver.api` (Flask REST on port 5001) and `homewebsocket.api` (Python WebSocket on port 8765). There is also a companion web app in the `home-server.web` repo that does the same thing in the browser.

The repo currently has no CLAUDE.md, no spec template, no PR template, and no .github directory.

## Scope

- Create `CLAUDE.md` at repo root covering what the repo is, how it fits with related repos, stack and versions, install/run/lint/test commands, folder layout, code standards, ground rules and the spec workflow.
- Create `docs/specs/000-template.md` with the standard spec sections.
- Create `.github/pull_request_template.md` with sections for Spec, What changed, How I tested it, What I checked by hand.
- Remove the existing `memory/` folder (Claude Code auto-memory, not part of the project).

## Out of scope

- Changing any app code or behavior.
- CI/CD setup (that is spec 003).
- README rewrite (that is spec 005).
- Lint/format config changes (that is spec 003).

## Acceptance criteria

- `CLAUDE.md` exists and accurately describes the project based on the code.
- `docs/specs/000-template.md` exists with Goal, Context, Scope, Out of scope, Acceptance criteria, Test plan, Notes sections.
- `.github/pull_request_template.md` exists with the four required sections.
- `memory/` folder is removed from the repo.
- No app code is changed.

## Test plan

- Verify all three files exist and contain the correct sections.
- Verify no app source files were modified by diffing against dev.

## Notes

- The `memory/MEMORY.md` file is Claude Code auto-memory and should not be in the repo. It is gitignored via `.gitignore` but was committed previously.
