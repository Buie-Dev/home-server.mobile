import React, { createContext, useContext, useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { baseWebSocketUrl } from '../config/config';
import { getToken } from '../lib/tokenStorage';


export enum WEBSOCKET_TOPICS {
	CURRENT_STATE = 'current',
	PRIORITY_QUEUE = 'priorityQueue',
	HEALTH_CHECK_RESPONSE = 'healthcheck/response',
	LIVE_FLOW = 'liveFlow',
}

interface MessagePayload {
  topic: WEBSOCKET_TOPICS;
  message: string;
}

interface WebSocketContextType {
  sendMessage: (topic: string, message: any) => void;
	latestCurrentStates: Array<CurrentState>;
	latestCurrentQueueStates: Array<CurrentQueueState>;
	latestHealthCheckResponses: Array<HealthCheckResponse>;
	liveFlow: LiveFlowState | null;
  isConnected: boolean;
}

export type CurrentState = {
	id: number;
	state: boolean;
	subzones?: Array<{id: number, state: boolean}>
}

export type CurrentQueueState = {
	id: string;
	duration: number;
	zone: number;
	priority: number;
	start_time?: string;
	subzones?: Array<{id: number, state: boolean}>
}

export type HealthCheckResponse = {
	deviceId: string;
	status: string;
	timestamp?: number;
}

export type LiveFlowState = {
	id: string;
	litres: number;
}


// ✅ Create Context with Type
const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
	const [latestCurrentStates, setLatestCurrentStates] = useState<Array<CurrentState>>([])
	const [latestCurrentQueueStates, setLatestCurrentQueueStates] = useState<Array<CurrentQueueState>>([])
	const [latestHealthCheckResponses, setLatestHealthCheckResponses] = useState<Array<HealthCheckResponse>>([])
	const [liveFlow, setLiveFlow] = useState<LiveFlowState | null>(null);
  const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		let socket: WebSocket;
	
		const connect = async () => {
			console.log("Connecting to WebSocket...");
			const token = await getToken();
			const url = token ? `${baseWebSocketUrl}?token=${token}` : baseWebSocketUrl;
			socket = new WebSocket(url);
	
			socket.onopen = () => {
				console.log("Connected to WebSocket server");
				setIsConnected(true);
			};
	
			socket.onmessage = (event) => {
				const content = JSON.parse(event.data);
				switch (content.topic) {
					case WEBSOCKET_TOPICS.CURRENT_STATE:
						setLatestCurrentStates(JSON.parse(content.message));
						break;
					case WEBSOCKET_TOPICS.PRIORITY_QUEUE:
						setLatestCurrentQueueStates(JSON.parse(content.message));
						break;
					case WEBSOCKET_TOPICS.HEALTH_CHECK_RESPONSE:
						setLatestHealthCheckResponses(prev => {
							const raw = JSON.parse(content.message);
							// Devices publish { device: "identifier" }; normalize to { deviceId, status }
							const response: HealthCheckResponse = {
								deviceId: raw.deviceId ?? raw.device,
								status: raw.status ?? raw.device,
								timestamp: raw.timestamp ?? Date.now(),
							};
							const filtered = prev.filter(r => r.deviceId !== response.deviceId);
							return [...filtered, response];
						});
						break;
					case WEBSOCKET_TOPICS.LIVE_FLOW:
						setLiveFlow(JSON.parse(content.message) as LiveFlowState);
						break;
					default:
						console.log("Topic not handled:", content.topic);
				}
			};
	
			socket.onerror = (error) => {
				console.error("WebSocket Error:", error);
			};
	
			socket.onclose = () => {
				console.log("WebSocket Disconnected");
				setIsConnected(false);
			};
	
			setWs(socket);
		};
	
		connect(); // Initial connection
	
		const handleAppStateChange = (nextAppState: AppStateStatus) => {
			if (nextAppState === 'active') {
				console.log("App has come to the foreground — reconnecting WebSocket");
				if (!socket || socket.readyState !== WebSocket.OPEN) {
					connect().catch(console.error);
				}
			}
		};
	
		const subscription = AppState.addEventListener('change', handleAppStateChange);
	
		return () => {
			socket?.close();
			subscription.remove();
		};
	}, []);

  const sendMessage = (topic: string, message: any) => {
    if (ws && isConnected) {
			const payload = JSON.stringify({ topic, message })
      ws.send(payload);
    } else {
      console.error("WebSocket is not connected.");
    }
  };

  return (
    <WebSocketContext.Provider value={{ sendMessage, isConnected, latestCurrentQueueStates, latestCurrentStates, latestHealthCheckResponses, liveFlow }}>
      {children}
    </WebSocketContext.Provider>
  );
};

// ✅ Export the context
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
