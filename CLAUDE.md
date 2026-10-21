# CLAUDE.md

## What this repo is

React Native mobile app for controlling a home server and personal apps. Runs on iOS and Android. Authenticates via JWT, then talks to two backend services over the local network or through a Cloudflare domain.

Related repos:
- `home-server.api` — Flask REST API (port 5001), handles schedules, zones, history, devices, auth
- `home-server.web` — React web app that does the same thing in the browser
- `homewebsocket.api` — Python WebSocket server (port 8765), bridges WebSocket to MQTT

## Stack

- React Native 0.77, React 18.3, TypeScript 5.0
- React Navigation 7 (native stack + bottom tabs)
- Axios for REST, native WebSocket for real-time
- React Native Paper for UI components
- MaterialCommunityIcons via react-native-vector-icons
- Jest for tests, ESLint + Prettier for lint and format

## Commands

```bash
npm install              # Install dependencies
npm start                # Start Metro bundler
npm run ios              # Build and run on iOS
npm run android          # Build and run on Android
npm run prod             # Build iOS release
npm run lint             # Run ESLint
npm test                 # Run Jest tests
npx jest <file>          # Run a single test file
bundle exec pod install  # Install iOS native dependencies (after native dep changes)
```

## Environment

`.env` at repo root, loaded via `react-native-dotenv`. Not committed.

| Variable | Purpose |
|---|---|
| `REACT_APP_SERVER` | Home server IP for REST API |
| `REACT_APP_API_PORT` | REST API port (5001) |
| `REACT_APP_WEBSOCKET` | Home server IP for WebSocket |
| `REACT_APP_WEB_SOCKET_PORT` | WebSocket port (8765) |
| `REACT_APP_DOMAIN` | Optional Cloudflare domain, overrides direct IP |

When `REACT_APP_DOMAIN` is set, REST uses `https://<domain>/api` and WebSocket uses `wss://<domain>/ws`. Otherwise it connects directly to the IP and port.

## Dev vs release builds

Both can be installed on the same phone at the same time.

| Build | Bundle ID (iOS) | Package (Android) | Display Name |
|---|---|---|---|
| Dev | `org.buie.HomeApp.dev` | `com.homeapp.dev` | HomeApp Dev |
| Release | `org.buie.HomeApp` | `com.homeapp` | HomeApp |

## Folder layout

```
App.tsx                    Root component, navigation stack, auth gate
index.js                   Entry point
api/                       REST API wrappers (one file per domain)
  apiRoutes.ts             URL constants
  base.api.ts              Axios instance with JWT interceptor
  auth.api.ts              Login
  irrigation.api.ts        Zones, schedules
  history.api.ts           Irrigation run history
  devices.api.ts           Device registry
  rowing.api.ts            Rowing races, crews, boats
  todo.api.ts              To-do tasks and templates
  events.api.ts            Events
  people.api.ts            People
  megan.api.ts             Ideas
components/                Reusable UI components
  BaseModal/               Modal wrapper
  Button/                  Styled button
  IrrigationPage/          Bottom tab navigator for irrigation screens
  CreateScheduleModal/     Schedule creation form
  ManualIrrigationModal/   Manual zone run form
  ...
config/
  config.ts                Reads .env, exports baseAPIUrl and baseWebSocketUrl
context/
  AuthContext.tsx           Auth state, login/logout, token storage
  WebSocketContext.tsx      Single WS connection, message relay
  UnitContext.tsx           Metric/imperial preference
hooks/                     Custom hooks (one per domain)
  useIrrigation.hook.ts    Zones, schedules, queue
  useHistory.hook.ts       Irrigation run history
  useDevices.hook.ts       Device registry + health checks
  useRowing.hook.ts        Rowing races, crews, boats
  useTodo.hook.ts          To-do tasks
  useEvents.hook.ts        Events
  usePeople.hook.ts        People
  useMegan.hook.ts         Ideas
lib/
  theme.ts                 Design tokens (COLORS, SHADOWS, SPACING, RADIUS)
  tokenStorage.ts          AsyncStorage wrapper for JWT
  datetime.ts              Date formatting helpers
  units.ts                 Unit conversion (litres/gallons)
screens/
  Home.tsx                 Main menu
  Login.tsx                Auth screen
  irrigation/              Zones, Schedules, Queue, History, Devices
  rowing/                  Rowing.tsx (crews, boats, races), RaceTimer.tsx
  todo/                    ToDo.tsx
  events/                  Events.tsx
  megan/                   Ideas.tsx, People.tsx
  admin/                   Admin.tsx
types/
  navigation.ts            Navigation param types
```

## Architecture

**Auth:** Login via POST /auth/login returns a JWT. Stored in AsyncStorage via `lib/tokenStorage.ts`. Axios interceptor in `base.api.ts` attaches `Authorization: Bearer <token>` to every request. On 401, AuthContext triggers logout. WebSocket connects with `?token=<token>`.

**State management:** React Context + custom hooks. No Redux.
- `AuthContext` — auth state, login/logout
- `WebSocketContext` — single WS connection, exposes `sendMessage` and latest state for current zones, queue, health checks, live flow
- `UnitContext` — metric/imperial preference

**Navigation:** Native stack at root (Home, Irrigation, Rowing, ToDo, etc). Irrigation screen has bottom tabs (Zones, Schedules, Live, History, Devices).

**API pattern:** `api/apiRoutes.ts` defines URL constants. `api/*.api.ts` files are thin wrappers over `api/base.api.ts`. `hooks/use*.hook.ts` files consume the API files and expose state + actions to screens.

**Design system:** `lib/theme.ts` exports `COLORS`, `SHADOWS`, `SPACING`, `RADIUS`. Use these everywhere. Icons via `MaterialCommunityIcons`.

## Code standards

- All imports at the top of the file, never inline.
- All filtering done on the backend via query params, never filter arrays on the frontend.
- All function parameters use object destructuring with a named type. No positional parameters.
- Commit messages are imperative, sentence case. Commits by Claude keep the Co-Authored-By trailer.
- Two long-lived branches: `main` (stable) and `dev` (ongoing work). Spec branches are named `spec/NNN-short-name`, branch from dev and merge back into dev.

## Boundaries

- Never push. Give me the commands and wait.
- Never change app behavior unless the spec says to.
- Never commit .env files, secrets, real domains, real IPs or hostnames.
- Never merge a pull request.
- Only write things that are true in the code.

## Workflow

Changes follow the spec loop. Write a spec in `docs/specs/NNN-short-name.md`, get approval, branch `spec/NNN-short-name` from dev, do the work, commit, then give me the push and PR commands.
