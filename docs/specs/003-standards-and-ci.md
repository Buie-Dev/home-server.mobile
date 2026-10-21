# 003 Standards and CI

## Goal

Add CI pipeline, create .env.example, and ensure .gitignore covers secrets. Pure formatting in its own commit. No behavior changes.

## Context

The repo already has ESLint (extends @react-native) and Prettier configured. There are 63 lint errors and 406 warnings in the existing code. There is no CI pipeline, no .env.example, and .gitignore is missing a secrets/ entry. The pre-existing App.test.tsx fails due to a missing Jest transform for @react-navigation, which needs to be fixed in jest config without changing app code.

## Scope

1. Fix the App.test.tsx Jest transform issue by adding transformIgnorePatterns to jest.config.js.
2. Add .env.example with placeholder values for all variables the app reads.
3. Add secrets/ to .gitignore.
4. Apply Prettier auto-formatting across the codebase in its own commit.
5. Add .github/workflows/ci.yml that runs lint and tests on push and PR to main and dev.

## Out of scope

- Fixing lint errors or warnings in app code (that is Phase 6 territory, and many are react-hooks/exhaustive-deps which could change behavior).
- Changing ESLint or Prettier config.
- Any app behavior changes.

## Acceptance criteria

- .env.example exists with all five env variables using placeholder values.
- .gitignore includes secrets/.
- App.test.tsx passes (Jest transform configured for react-navigation).
- All 177 baseline tests still pass.
- Prettier formatting applied in its own commit.
- .github/workflows/ci.yml runs lint and tests on push/PR to main and dev.

## Test plan

- Run npm test and confirm all tests pass including App.test.tsx.
- Run npx prettier --check . to verify formatting is clean.
- Verify ci.yml is valid YAML.

## Notes

- Not fixing the 63 lint errors here because many are react-hooks/exhaustive-deps which could subtly change behavior. Those belong in Phase 6.
- The lint step in CI will likely fail until Phase 6 fixes lint errors. This is expected.
