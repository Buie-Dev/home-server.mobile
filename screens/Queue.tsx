import React, { ReactElement, useEffect, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import useIrrigation, { PriorityQueue } from '../hooks/useIrrigation.hook';
import { formatTime } from '../lib/datetime';


function Queue(): ReactElement {
	
	const [selectedQueueItem, setSelectedQueueItem] = useState<PriorityQueue>()
	const { priorityQueue, fetchZones, stopAll, stopQueueItem } = useIrrigation()
	const [remainingTime, setRemainingTime] = useState<number | null>(null);

	useEffect(() => {
		if (priorityQueue.length === 0) return;
		console.log(priorityQueue)

		const firstItem = priorityQueue[0];
		if (firstItem.startTime) {
			// startTime is epoch in seconds, convert to milliseconds for JS Date
			const startTimeMs = firstItem.startTime * 1000;
			const currentTimeMs = Date.now();
			const elapsedSeconds = Math.floor((currentTimeMs - startTimeMs) / 1000);
			const remainingSeconds = Math.max(0, firstItem.duration - elapsedSeconds);
			setRemainingTime(remainingSeconds);
		} else {
			// Fall back to full duration if no startTime available
			setRemainingTime(firstItem.duration);
		}

		const interval = setInterval(() => {
			setRemainingTime(prev => {
				if (prev === null || prev <= 0) {
					clearInterval(interval);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [priorityQueue]);

	useEffect(() => {
		fetchZones();
	}, [])

	console.log(priorityQueue)

	return (
		<View style={styles.content}>
			<Text style={styles.title}>PriorityQueue</Text>
			<ScrollView contentContainerStyle={styles.container} style={styles.scroll}>
					
					{priorityQueue.map((pqi, index) => {
						const durationToShow = !index && remainingTime !== null
							? formatTime(remainingTime)
							: formatTime(pqi.duration);

						return (
							<View key={pqi.id}>
								<TouchableOpacity style={styles.zoneCard} onPress={() => setSelectedQueueItem(pqi)}>
									<Text style={styles.zoneText}>{pqi.name}</Text>
									<Text>{durationToShow}</Text>
									<Button title="X" onPress={() => stopQueueItem(pqi.id)}/>
								</TouchableOpacity>
							</View>
						);
					})}
				</ScrollView>
				{!!priorityQueue.length && <Button title={"Stop All"} onPress={stopAll}  />}
		</View>
	)
}



const styles = StyleSheet.create({
	content: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column'
	},
	scroll: {
		flex: 1
	},
	container: {
		flexGrow: 1,
		backgroundColor: '#f4f4f4',
		padding: 20,

	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#333',
		textAlign: 'center',
		margin: 20,
	},
	zoneCard: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		width: '90%',
		padding: 15,
		marginBottom: 10,
		backgroundColor: '#fff',
		borderRadius: 10,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3, // For Android shadow
		alignSelf: 'center',
	},
	zoneText: {
		fontSize: 18,
		fontWeight: '500',
		color: '#444',
	},
	subzoneContainer: {
		marginLeft: 30, // Indent sub-zones
	},
	subzoneCard: {
		padding: 10,
		marginBottom: 5,
		backgroundColor: '#eaeaea',
		borderRadius: 8,
	},
	subZoneText: {
		fontSize: 16,
		color: '#666',
	},
	active: {
		backgroundColor: 'green'
	}
});


export default Queue
