import React, { createContext, useContext, useEffect, useState } from "react";

const WS_URL = "ws://192.168.1.100:8765"; // Replace with your WebSocket server URL

export enum WEBSOCKET_TOPICS {
	CURRENT_STATE = 'current',
	PRIORITY_QUEUE = 'priorityQueue'
}

interface MessagePayload {
  topic: WEBSOCKET_TOPICS;
  message: string;
}

interface WebSocketContextType {
  sendMessage: (topic: string, message: any) => void;
	latestCurrentStates: Array<CurrentState>;
	latestCurrentQueueStates: Array<CurrentQueueState>
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
	subzones?: Array<{id: number, state: boolean}>
}


// ✅ Create Context with Type
const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
	const [latestCurrentStates, setLatestCurrentStates] = useState<Array<CurrentState>>([])
	const [latestCurrentQueueStates, setLatestCurrentQueueStates] = useState<Array<CurrentQueueState>>([])
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      console.log("Connected to WebSocket server");
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      console.log("Received:", event.data);
			const content = JSON.parse(event.data)
			console.log(content.topic)
			switch (content.topic) {
				case WEBSOCKET_TOPICS.CURRENT_STATE:
					console.log(content.message)
					setLatestCurrentStates(JSON.parse(content.message));
					break
				case WEBSOCKET_TOPICS.PRIORITY_QUEUE:
					setLatestCurrentQueueStates(JSON.parse(content.message));
					break
				default:
					console.log("Topic not controlled in Irrigation")
			}
    };

    socket.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket Disconnected");
      setIsConnected(false);
      setTimeout(() => {
        setWs(new WebSocket(WS_URL)); // Reconnect after 5 seconds
      }, 5000);
    };

    setWs(socket);

    return () => {
      socket.close();
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
    <WebSocketContext.Provider value={{ sendMessage, isConnected, latestCurrentQueueStates, latestCurrentStates }}>
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
