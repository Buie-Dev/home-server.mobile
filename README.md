![CI](https://github.com/Buie-Dev/home-server.mobile/actions/workflows/ci.yml/badge.svg?branch=dev)

# home-server.mobile

React Native mobile app I use to control my home server and personal apps from my phone.

## Why I built it

I started this as a way to control my irrigation system from my phone. Over time I kept adding features for things I wanted customized the way I like them, without juggling a bunch of separate apps. It also gave me a reason to get more hands-on experience with React Native.

## How it fits

This is the mobile client for a small home server stack. It talks to two backend services over REST and WebSocket.

- [home-server.api](https://github.com/Buie-Dev/home-server.api) is the Flask REST API that handles schedules, zones, history, devices, auth and more
- [home-server.web](https://github.com/Buie-Dev/home-server.web) is a React web app that does the same thing in the browser
- [homewebsocket.api](https://github.com/Buie-Dev/homewebsocket.api) is a Python WebSocket server that bridges WebSocket connections to MQTT

## Stack

- React Native 0.77, React 18, TypeScript
- React Navigation 7 (native stack + bottom tabs)
- Axios for REST, native WebSocket for real-time updates
- React Native Paper for UI components
- Jest and React Native Testing Library for tests
- ESLint and Prettier for linting and formatting

## Running it locally

You need Node.js, npm, Xcode (for iOS) and Ruby with Bundler.

```bash
npm install
bundle install
bundle exec pod install
```

Start the Metro bundler in one terminal, then build in another.

```bash
npm start              # Start Metro bundler
npm run ios            # Build and run dev build on iOS
npm run android        # Build and run dev build on Android
```

For a release build that connects through a Cloudflare domain:

```bash
npx react-native run-ios --mode Release
```

Dev and release builds use different bundle IDs so they can both be installed on the same phone at the same time.

## Configuration

Create a `.env` file at the project root. See `.env.example` for the full list.

| Variable | Purpose |
|---|---|
| `REACT_APP_SERVER` | Home server IP for REST API |
| `REACT_APP_API_PORT` | REST API port (default 5001) |
| `REACT_APP_WEBSOCKET` | Home server IP for WebSocket |
| `REACT_APP_WEB_SOCKET_PORT` | WebSocket port (default 8765) |
| `REACT_APP_DOMAIN` | Optional Cloudflare domain, overrides direct IP when set |

When `REACT_APP_DOMAIN` is set, REST uses `https://<domain>/api` and WebSocket uses `wss://<domain>/ws`. Otherwise it connects directly to the IP and port.

Restart Metro after changing `.env` so the new values are picked up.

## Tests

```bash
npm test               # Run all tests
npx jest <file>        # Run a single test file
npm run lint           # Run ESLint
```

Tests cover the API layer, all custom hooks, context providers, config and token storage. Everything is unit tested with mocked network calls.

## How I work on it

Changes start as specs in `docs/specs/`. Claude Code implements them on a branch and I review and merge every pull request.
