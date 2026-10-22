# 004 Fixes

## Goal

Fix lint errors so CI passes, replace real IPs and domains with placeholders, and fix the bugs documented in spec 002.

## Context

CI is failing because of 64 lint errors. The codebase also has real IP addresses and a real domain name in README.md. Spec 002 documented two likely bugs: `deleteHistory` optimistically removes from local state without handling API failure, and `updateIdea` does not refetch after updating.

## Scope

### Lint errors (64 errors, 130 warnings)

**Unused vars in test files (28 errors, 8 files)**
Remove unused destructured imports and variables across test files. These were imported for completeness but not yet used in tests.

**Unused vars in app files (16 errors, 7 files)**
Remove unused imports (`TouchableOpacity`, `Modal`, `Platform`, `DateTimePicker`, `View`, `useRef`, `Subzone`, `Zone`, `MessagePayload`) and unused assigned variables (`position`, `screenWidth`, `screenHeight`, `formatDateToHHMM`, `hasMore`). Check each one to confirm it is genuinely unused before removing.

**Missing useEffect/useCallback dependencies (20 errors, 10 files)**
These are intentional mount-only effects (`[]` dependency array) and adding the dependencies would cause re-runs on every render since the functions are not memoized. Suppress each with `// eslint-disable-next-line react-hooks/exhaustive-deps` to document the intent without changing behavior.

**Auto-fixable warnings (101 warnings)**
Run `npm run lint -- --fix` to add curly braces to single-line `if`/`else` statements and remove redundant double negation. No behavior change.

### Real IPs and domains

**README.md** contains `192.168.1.94` (real server IP) and `dandelionlane.ca` (real domain) in the environment setup examples. Replace with `192.168.x.x` and `example.com` to match `.env.example`.

### Gitleaks

No leaks found. The `.env` file was committed in 5 historical commits (starting at `e1f407f`) with the real server IP `192.168.1.94` and domain `dandelionlane.ca`. It contains only local network IPs and no passwords or API keys. Listed here for your decision on whether to rewrite history.

### Spec 002 bugs

**deleteHistory local-only filtering**
`useHistory.deleteHistory` removes the item from local state optimistically but does not restore it if the API call fails. If the server delete fails, the item disappears from the UI until the next fetch. Fix by wrapping in try/catch and restoring local state on failure.

**updateIdea no refetch**
`useMegan.updateIdea` calls the API but does not refetch the ideas list afterward. Other similar functions (like `addIdea`, `deleteIdea`) do refetch. Fix by adding a `fetchIdeas()` call after a successful update.

## Out of scope

- Refactoring hooks to use `useCallback` for all functions (would fix exhaustive-deps properly but is a larger change)
- Rewriting git history to remove `.env` commits
- Changing error handling patterns across all hooks (spec 002 noted this as behavior to preserve)

## Acceptance criteria

- `npm run lint` reports 0 errors and 0 warnings
- `npm test` passes (all 178 tests plus any new ones)
- CI passes (lint + test)
- README.md contains no real IP addresses or domain names
- deleteHistory restores local state on API failure
- updateIdea refetches after successful update

## Test plan

- Run `npm run lint` and confirm zero errors and zero warnings
- Run `npm test` and confirm all tests pass
- Verify README.md only has `192.168.x.x` and `example.com`
- New test: deleteHistory keeps item in state when API returns error
- New test: updateIdea calls fetchIdeas after successful update

## Notes

Commits in order:
1. Fix unused imports in test files
2. Fix unused imports in app files
3. Suppress intentional exhaustive-deps warnings
4. Auto-fix lint warnings (curly braces, double negation)
5. Replace real IPs and domains in README
6. Fix deleteHistory to restore state on API failure (test-first)
7. Fix updateIdea to refetch after update (test-first)
