# 002 Baseline Tests

## Goal

Lock in the current behavior of the app before making any changes, so future work can be validated against a known baseline.

## Context

The app has 8 custom hooks, 10 API modules, 3 context providers, a config module and a token storage utility. Currently there is one test file (`__tests__/App.test.tsx`) with a basic render test. All logic lives in hooks and API wrappers, making them straightforward to unit test by mocking axios and WebSocket.

## Scope

Test the layers that contain logic, focusing on behavior that matters most.

**API layer** (mock axios)
- `base.api.ts` — token attachment, 401 handler, cache headers
- `auth.api.ts` — login, permissions
- `irrigation.api.ts` — schedule CRUD, zones, sync
- `history.api.ts` — pagination params, totals
- `devices.api.ts` — device fetch
- `rowing.api.ts` — race/crew/boat CRUD, entry timing
- `todo.api.ts` — category hierarchy, template/task CRUD
- `events.api.ts` — event CRUD, month/year filtering
- `people.api.ts` — per-person categories and ideas
- `megan.api.ts` — global categories and ideas

**Hooks** (mock API modules + WebSocket context)
- `useIrrigation` — zone formatting from WebSocket states, queue formatting, schedule CRUD, health check interval
- `useHistory` — pagination (hasMore, loadMore), concurrent fetch of history + totals, filter persistence
- `useDevices` — health check ping/timeout flow, device status transitions, response time calculation
- `useRowing` — race lifecycle, entry start/finish, WebSocket broadcasts, active race refresh
- `useTodo` — category hierarchy, template/task CRUD, checklist optimistic updates, batch archive
- `useEvents` — event CRUD, filter persistence
- `usePeople` — per-person category and idea CRUD
- `useMegan` — global category/idea CRUD, completion toggle

**Contexts** (mock dependencies)
- `AuthContext` — login/logout flow, token persistence, 401 auto-logout, permission checking
- `WebSocketContext` — message parsing by topic, health check response normalization, connection lifecycle
- `UnitContext` — preference persistence, toggle

**Utilities**
- `config.ts` — URL construction (domain vs direct IP)
- `tokenStorage.ts` — get/set/clear token

## Out of scope

- Screen and component rendering tests (too tightly coupled to navigation and native modules for baseline value)
- End-to-end tests
- Any changes to app code

## Acceptance criteria

- All new tests pass with `npm test`
- No app source files are modified (only test files, test config, and dev dependencies added)
- Every API module has at least one test verifying correct endpoint and method
- Every hook has tests covering its core state management and side effects
- All three contexts have tests covering their primary flows
- Config and token storage have tests covering all branches

## Test plan

- Run `npm test` and confirm all tests pass
- Run `git diff dev -- ':(exclude)__tests__' ':(exclude)jest*' ':(exclude)package*'` to verify no app files changed

## Notes

- All hooks catch API errors but only console.log them without updating error state (except useRowing which sets an error string). This is existing behavior to preserve, not fix.
- `useHistory.deleteHistory` filters the item from local state but does not refetch history from the server, only refetches totals. This may be a bug where deleted items reappear on next fetch.
- `useMegan.updateIdea` does not refetch ideas after updating. The caller is responsible for refreshing.
- `useDevices` uses a 5-second timeout for health checks. Devices not responding within 5 seconds are marked offline.
- WebSocket health check responses can have either `device` or `deviceId` field depending on the source. The context normalizes this.
