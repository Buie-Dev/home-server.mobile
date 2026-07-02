# HomeApp

React Native mobile app for the home automation system. Communicates with `homeserver.api` (REST) and `homewebsocket.api` (WebSocket) running on the home server.

Two builds can be installed on the same phone simultaneously:

| Build | Bundle ID (iOS) | Display Name | Command |
|---|---|---|---|
| **Dev** | `org.buie.HomeApp.dev` | HomeApp Dev | `npm run ios` |
| **Production** | `org.buie.HomeApp` | HomeApp | `npx react-native run-ios --mode Release` |

---

## Prerequisites

- Node.js + npm
- Xcode (iOS)
- Ruby + Bundler (`gem install bundler`)
- CocoaPods (`bundle exec pod install`)

On first clone or after adding native dependencies:

```bash
bundle install
bundle exec pod install
```

---

## Environment Setup (.env)

The `.env` file at the project root controls which server the app connects to. There are two modes:

### Local / Dev (on home network)

Use the home server's local IP directly. Comment out or remove `REACT_APP_DOMAIN`:

```env
REACT_APP_SERVER="192.168.1.94"
REACT_APP_WEBSOCKET="192.168.1.94"
REACT_APP_API_PORT="5001"
REACT_APP_WEB_SOCKET_PORT="8765"
# REACT_APP_DOMAIN="dandelionlane.ca"
```

The app will connect to:
- REST API: `http://192.168.1.94:5001`
- WebSocket: `ws://192.168.1.94:8765`

### Production / Remote (outside home network)

Set `REACT_APP_DOMAIN` to route all traffic through Cloudflare. When this is set it takes priority over the IP/port values:

```env
REACT_APP_SERVER="192.168.1.94"
REACT_APP_WEBSOCKET="192.168.1.94"
REACT_APP_API_PORT="5001"
REACT_APP_WEB_SOCKET_PORT="8765"
REACT_APP_DOMAIN="dandelionlane.ca"
```

The app will connect to:
- REST API: `https://dandelionlane.ca/api`
- WebSocket: `wss://dandelionlane.ca/ws`

> After changing `.env`, restart Metro with `npm start` (or stop and re-run the build command) so the new values are picked up.

---

## Running the App

### Dev build (HomeApp Dev)

Used for day-to-day development. Supports fast refresh and the React Native debugger.

```bash
npm start            # start Metro bundler (separate terminal)
npm run ios          # build debug and install on connected iPhone
```

### Production build (HomeApp)

Used when shipping a stable version to the phone. Set `.env` to the Cloudflare domain before building.

```bash
npx react-native run-ios --mode Release
```

Takes 5–15 minutes. Does not require Metro to be running.

---

## Project Structure

```
api/            Axios API functions (one file per service)
components/     Reusable UI components
config/         config.ts — reads .env and exports base URLs
context/        React contexts (Auth, WebSocket, Units)
hooks/          Custom hooks that consume API files
lib/            Shared utilities (theme, token storage, units)
screens/        Top-level screens (Home, Login, irrigation/, todo/, megan/)
```

---

## Backend Services

| Service | Repo | Port |
|---|---|---|
| REST API | `homeserver.api` | 5001 |
| WebSocket | `homewebsocket.api` | 8765 |

Both run via Docker on the home server. Start `home-server` first (shared network + MySQL), then the other services.
