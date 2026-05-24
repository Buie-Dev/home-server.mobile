import React, { useEffect, useState } from 'react';
import * as irrigationApi from '../api/irrigation.api'
import { useWebSocket } from '../context/WebSocketContext';

export type ZoneDetail = {
	id: number;
	name: string;
	zone: number;
	type: string;
	subzones?: SubZoneDetail[]
}

export type SubZoneDetail = {
	id: number;
	name: string;
	subzone: number;
}

export type Subzone = {
	id: number;
	name: string;
	subzone: number;
	state: boolean;
}
export type Zone = {
	id: number;
	name: string;
	state: boolean;
	zone: number;
	type: string;
	subzones?: Subzone[]
}

export type PriorityQueue = {
	id: string;
	name: string;
	duration: number;
	zone: number;
	zoneType: string;
	priority: number;
	startTime?: number;
	subZones?: Array<QueueSubzone>
}
export type QueueSubzone = {
	id: number;
	name: string;
	zone: number;
}

export type Schedule = {
	id: number;
	name: string;
	startTime: string;
	duration: number;
	monday: boolean;
	tuesday: boolean;
	wednesday: boolean;
	thursday: boolean;
	friday: boolean;
	saturday: boolean;
	sunday: boolean;
	subzoneNames?: string;
	subzoneIds: number[];
	zoneName: string;
	zoneId: number;
	active: boolean;
}

export type CreateScheduleParams = {
	name: string;
	startTime: string;
	duration: number;
	monday: boolean;
	tuesday: boolean;
	wednesday: boolean;
	thursday: boolean;
	friday: boolean;
	saturday: boolean;
	sunday: boolean;
	zoneId: number;
	subzoneIds?: Array<number>
}

export type ZoneType = {
	id: number;
	type: string;
}



export type SyncStatus = {
	in_sync: boolean;
	missing_from_automation: number[];
	mismatched: { id: number; diffs: string[] }[];
	extra_in_automation: number[];
	error?: string;
	timeout?: boolean;
}

interface IrrigationInfo {
	fetchZones: (zoneTypeId?: number) => void;
	healthCheck: () => void;
	stopAll: () => void;
	stopQueueItem: (id: string) => void;
	fetchSchedules: (zoneId?: number, subzoneId?: number) => void;
	createSchedule: (data: CreateScheduleParams) => Promise<void>;
	updateSchedule: (id: number, data: CreateScheduleParams) => Promise<void>;
	deleteSchedule: (id: number) => Promise<void>;
	toggleSchedule: (id: number, active: boolean) => Promise<void>;
	fetchZoneTypes: () => void;
	checkSync: () => Promise<SyncStatus | null>;
	forceSync: () => Promise<{ synced: number } | null>;
	zones: Array<Zone>
	priorityQueue: Array<PriorityQueue>
	schedules: Array<Schedule>
	zoneTypes: Array<ZoneType>
	zoneDetails: Array<ZoneDetail>
	connected: boolean,
}

function useIrrigation(): IrrigationInfo {
	const { latestCurrentQueueStates, latestCurrentStates, sendMessage } = useWebSocket();

	const [zoneDetails, setZoneDetails] = useState<Array<ZoneDetail>>([])
	const [zones, setZones] = useState<Array<Zone>>([])
	const [schedules, setSchedules] = useState<Array<Schedule>>([])
	const [priorityQueue, setPriorityQueue] = useState<Array<PriorityQueue>>([])
	const [zoneTypes, setZoneTypes] = useState<Array<ZoneType>>([])
	const [connected, setConnected] = useState<boolean>(false);

	const fetchZoneTypes = async () => {
		try {
			const zoneTypes = await irrigationApi.fetchZoneTypes()
			setZoneTypes(zoneTypes as Array<ZoneType>)
		} catch (error) {
			console.log(error)
		}	
	}

	const formatZones = (): Array<Zone> => {
		if (!latestCurrentStates || !zoneDetails.length) return []

		const zones: Array<Zone> = []
		for (const zoneDetail of zoneDetails) {
			const latestCurrentState = latestCurrentStates.find(lz => lz.id === zoneDetail.zone)
			if (!latestCurrentState) continue;

			const zone: Zone = {
				id: zoneDetail.id,
				name: zoneDetail.name,
				zone: zoneDetail.zone,
				type: zoneDetail.type,
				state: !!latestCurrentState.state
			}

			if (latestCurrentState.subzones && zoneDetail.subzones) {
				for (const zoneDetailSubzone of zoneDetail.subzones) {
					const latestSubzone = latestCurrentState.subzones.find(slz => slz.id === zoneDetailSubzone.subzone)
					if (!latestSubzone) continue;
					if (!zone.subzones) zone.subzones = []
					const subzone: Subzone = {
						id: zoneDetailSubzone.id,
						name: zoneDetailSubzone.name,
						subzone: zoneDetailSubzone.subzone,
						state: !!latestSubzone.state
					}
					zone.subzones.push(subzone)
				}
			}
			zones.push(zone)
		}
		return zones

	}

	const formatQueue = (): Array<PriorityQueue> => {
		if (!latestCurrentQueueStates || !zoneDetails.length) return []
	
		
		const priorityQueue = []
		for (const latestCurrentQueueState of  latestCurrentQueueStates) {

			const zoneDetail = zoneDetails.find(zd => zd.zone === latestCurrentQueueState.zone)
			if (!zoneDetail) continue;
			
			const queueSubZones: Array<QueueSubzone> = []
			if (latestCurrentQueueState.subzones && zoneDetail.subzones) {
				for (const subState of latestCurrentQueueState.subzones) {
					const subZone = zoneDetail.subzones.find(slz => slz.subzone === subState.id)
					if (!subZone) continue;
					queueSubZones.push({
						name: subZone.name,
						id: subState.id,
						zone: subZone.subzone
					})
				}
			}

			const queueItem: PriorityQueue = {
				id: latestCurrentQueueState.id,
				duration: latestCurrentQueueState.duration,
				zone: latestCurrentQueueState.zone,
				name: zoneDetail.name,
				zoneType: zoneDetail.type,
				priority: latestCurrentQueueState.priority,
				subZones: queueSubZones ? queueSubZones : undefined,
				startTime: latestCurrentQueueState.start_time ? parseInt(latestCurrentQueueState.start_time) : undefined
			}
			priorityQueue.push(queueItem)


		}
		return priorityQueue
	}


	const stopAll = () => {
		sendMessage('stopAll', {})
	}

	const stopQueueItem = (id: string) => {
		sendMessage('stop', { id })
	}


	const fetchSchedules = async (zoneId?: number, subzoneId?: number) => {
		try {
			const schedules = await irrigationApi.fetchSchedules(zoneId, subzoneId)
			setSchedules(schedules as Array<Schedule>)
		} catch (error) {
			console.log(error)
		}
	}

	const createSchedule = async (data: CreateScheduleParams) => {
		try {
			await irrigationApi.createSchedule(data)
		} catch (error) {
			console.log(error)
		}
	}

	const updateSchedule = async (id: number, data: CreateScheduleParams) => {
		try {
			await irrigationApi.updateSchedule(id, data)
		} catch (error) {
			console.log(error)
		}
	}

	const deleteSchedule = async (id: number) => {
		try {
			await irrigationApi.deleteSchedule(id)
		} catch (error) {
			console.log(error)
		}
	}

	const checkSync = async (): Promise<SyncStatus | null> => {
		try {
			return await irrigationApi.checkScheduleSync() as SyncStatus;
		} catch (error) {
			console.log(error);
			return null;
		}
	}

	const forceSync = async (): Promise<{ synced: number } | null> => {
		try {
			return await irrigationApi.forceScheduleSync() as { synced: number };
		} catch (error) {
			console.log(error);
			return null;
		}
	}

	const toggleSchedule = async (id: number, active: boolean) => {
		try {
			await irrigationApi.toggleSchedule(id, active)
			await fetchSchedules()
		} catch (error) {
			console.log(error)
		}
	}

	const fetchZones = async (zoneTypeId?: number) => {
		try {
			const zones = await irrigationApi.fetchZones(zoneTypeId)
			setZoneDetails(zones as Array<ZoneDetail>)
		} catch (error) {
			console.log(error)
		}
	}

	const healthCheck = async () => {
		try {
			await irrigationApi.healthCheck();
			setConnected(true);
		} catch (error) {
			console.error('Health check failed:', error);
			setConnected(false);
		}
	};

	useEffect(() => {
		// Fetch zone details needed to format queue and zone state
		fetchZones();

		// Initial health check
		healthCheck();

		// Set up interval for health checks every minute
		const intervalId = setInterval(healthCheck, 60000);

		// Cleanup interval on unmount
		return () => clearInterval(intervalId);
	}, []);

	useEffect(() => {
		const queues = formatQueue()
		setPriorityQueue(queues)
	}, [latestCurrentQueueStates, zoneDetails])

	useEffect(() => {

		const localZones = formatZones()		
		setZones(localZones)
	}, [latestCurrentStates, zoneDetails])

	


	return  {
		fetchZones,
		stopAll,
		stopQueueItem,
		deleteSchedule,
		createSchedule,
		updateSchedule,
		fetchSchedules,
		toggleSchedule,
		checkSync,
		forceSync,
		schedules,
		zones,
		priorityQueue,
		fetchZoneTypes,
		zoneTypes,
		zoneDetails,
		healthCheck,
		connected
	}

}

export default useIrrigation