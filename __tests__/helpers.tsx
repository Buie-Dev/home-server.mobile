export const mockWebSocketValue = {
  sendMessage: jest.fn(),
  latestCurrentStates: [] as any[],
  latestCurrentQueueStates: [] as any[],
  latestHealthCheckResponses: [] as any[],
  liveFlow: null,
  latestRowingStartEvent: null,
  latestRowingFinishEvent: null,
  isConnected: true,
};

jest.mock('../context/WebSocketContext', () => {
  const actual = jest.requireActual('../context/WebSocketContext');
  return {
    ...actual,
    useWebSocket: () => mockWebSocketValue,
  };
});

export const resetWebSocketMock = () => {
  mockWebSocketValue.sendMessage = jest.fn();
  mockWebSocketValue.latestCurrentStates = [];
  mockWebSocketValue.latestCurrentQueueStates = [];
  mockWebSocketValue.latestHealthCheckResponses = [];
  mockWebSocketValue.liveFlow = null;
  mockWebSocketValue.latestRowingStartEvent = null;
  mockWebSocketValue.latestRowingFinishEvent = null;
  mockWebSocketValue.isConnected = true;
};
