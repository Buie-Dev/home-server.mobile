import { REACT_APP_SERVER, REACT_APP_API_PORT, REACT_APP_WEB_SOCKET_PORT, REACT_APP_WEBSOCKET} from '@env';

export const baseAPIUrl = `http://${REACT_APP_SERVER}:${REACT_APP_API_PORT}`;
export const baseWebSocketUrl = `ws://${REACT_APP_WEBSOCKET}:${REACT_APP_WEB_SOCKET_PORT}`

console.log(baseAPIUrl)
console.log(baseWebSocketUrl)