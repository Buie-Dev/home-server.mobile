import {useState, useEffect, useRef} from 'react';
import * as devicesApi from '../api/devices.api';
import {logger} from '../lib/logger';
import {useWebSocket} from '../context/WebSocketContext';

export type Device = {
  id: string;
  name: string;
  description: string;
  type: string;
  healthCheckResponse: string;
};

export type DeviceWithStatus = Device & {
  status: 'online' | 'offline' | 'checking';
  lastChecked: Date | null;
  responseTimeMs?: number;
};

interface DevicesInfo {
  devices: DeviceWithStatus[];
  fetchDevices: () => Promise<void>;
  checkConnectivity: () => void;
  loading: boolean;
}

const HEALTH_CHECK_TIMEOUT_MS = 5000;

function useDevices(): DevicesInfo {
  const {sendMessage, latestHealthCheckResponses, isConnected} = useWebSocket();
  const [devices, setDevices] = useState<DeviceWithStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const pingTimestampsRef = useRef<Record<string, number>>({});
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchDevices = async () => {
    setLoading(true);
    setDevices([]);
    try {
      const data = await devicesApi.fetchDeviceStatus();
      const withStatus: DeviceWithStatus[] = (
        Array.isArray(data) ? data : []
      ).map(d => ({
        ...d,
        status: 'checking',
        lastChecked: null,
      }));
      setDevices(withStatus);
    } catch (error) {
      logger.log(error);
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  const checkConnectivity = () => {
    if (!isConnected || devices.length === 0) {return;}

    const now = Date.now();
    pingTimestampsRef.current = Object.fromEntries(
      devices.map(d => [d.id, now]),
    );

    setDevices(prev => prev.map(d => ({...d, status: 'checking'})));

    sendMessage('healthcheck/request', {});

    if (timeoutRef.current) {clearTimeout(timeoutRef.current);}
    timeoutRef.current = setTimeout(() => {
      setDevices(prev =>
        prev.map(d =>
          d.status === 'checking'
            ? {...d, status: 'offline', lastChecked: new Date()}
            : d,
        ),
      );
    }, HEALTH_CHECK_TIMEOUT_MS);
  };

  useEffect(() => {
    if (latestHealthCheckResponses.length === 0) {return;}

    setDevices(prev =>
      prev.map(d => {
        const sentAt = pingTimestampsRef.current[d.id];
        if (sentAt === undefined) {return d;}

        const response = latestHealthCheckResponses.find(
          r => r.deviceId === d.id,
        );
        if (!response || !response.timestamp || response.timestamp < sentAt)
          {return d;}

        const isHealthy = response.status === d.healthCheckResponse;
        const responseTimeMs = Date.now() - sentAt;

        return {
          ...d,
          status: isHealthy ? 'online' : 'offline',
          lastChecked: new Date(),
          responseTimeMs,
        };
      }),
    );
  }, [latestHealthCheckResponses]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {clearTimeout(timeoutRef.current);}
    };
  }, []);

  return {devices, fetchDevices, checkConnectivity, loading};
}

export default useDevices;
