import React, { useEffect, useState } from 'react';
import * as irrigationApi from '../api/irrigation.api'
import { useWebSocket, WEBSOCKET_TOPICS } from '../context/WebSocketContext';

export type ZoneDetail = {
	id: number;
	name: string;
	zone: number;
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
	subzones?: Subzone[]
}

export type PriorityQueue = {
	id: string;
	name: string;
	duration: number;
	zone: number;
	priority: number;
	subZones?: Array<QueueSubzone>
}
export type QueueSubzone = {
	id: number;
	name: string;
	zone: number;
}



interface IrrigationInfo {
	fetchZones: () => void;
	zones: Array<Zone>
	priorityQueue: Array<PriorityQueue>
}

function useIrrigation(): IrrigationInfo {

	const { latestCurrentQueueStates, latestCurrentStates } = useWebSocket();

	const [zoneDetails, setZoneDetails] = useState<Array<ZoneDetail>>([])

	const [zones, setZones] = useState<Array<Zone>>([])
	const [priorityQueue, setPriorityQueue] = useState<Array<PriorityQueue>>([])

	const formatZones = (): Array<Zone> => {
		console.log(latestCurrentStates)
		console.log(zoneDetails)
		if (!latestCurrentStates || !zoneDetails.length) return []

		const zones: Array<Zone> = []
		for (const zoneDetail of zoneDetails) {
			const latestCurrentState = latestCurrentStates.find(lz => lz.id === zoneDetail.zone)
			if (!latestCurrentState) continue;

			const zone: Zone = {
				id: zoneDetail.id,
				name: zoneDetail.name,
				zone: zoneDetail.zone,
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
		console.log(zoneDetails)
		console.log(latestCurrentQueueStates)
		if (!latestCurrentQueueStates || !zoneDetails.length) return []
	
		
		const priorityQueue = []
		for (const latestCurrentQueueState of  latestCurrentQueueStates) {

			const zoneDetail = zoneDetails.find(zd => zd.zone === latestCurrentQueueState.zone)
			console.log(zoneDetail)
			if (!zoneDetail) continue;
			
			const queueSubZones: Array<QueueSubzone> = []
			if (latestCurrentQueueState.subzones && zoneDetail.subzones) {
				for (const subState of latestCurrentQueueState.subzones) {
					const subZone = zoneDetail.subzones.find(slz => slz.id === subState.id)
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
				priority: latestCurrentQueueState.priority,
				subZones: queueSubZones ? queueSubZones : undefined
			}
			priorityQueue.push(queueItem)


		}
		return priorityQueue
	}


	const fetchZones = async () => {
		try {
			const zones = await irrigationApi.fetchZones()
			setZoneDetails(zones)
		} catch (error) {
			console.log(error)
		}
	}

	useEffect(() => {
		const queues = formatQueue()
		console.log(queues)
		setPriorityQueue(queues)
	}, [latestCurrentQueueStates, zoneDetails])

	useEffect(() => {

		const localZones = formatZones()		
		setZones(localZones)
	}, [latestCurrentStates, zoneDetails])

	


	return  {
		fetchZones,
		zones,
		priorityQueue,
	}

}

export default useIrrigation