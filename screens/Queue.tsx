import React, { ReactElement, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import useIrrigation, { PriorityQueue } from '../hooks/useIrrigation.hook';



function Queue(): ReactElement {

	const [selectedQueueItem, setSelectedQueueItem] = useState<PriorityQueue>()
	const { priorityQueue, fetchZones } = useIrrigation()

	useEffect(() => {
		fetchZones();
	}, [])

	return (
		<View>
			<ScrollView contentContainerStyle={styles.container}>
					<Text style={styles.title}>PriorityQueue</Text>
					{priorityQueue.map((pqi) => {
						return (
							<View key={pqi.id} >
								<TouchableOpacity style={[styles.zoneCard]} onPress={() => setSelectedQueueItem(pqi)} >
									<Text style={styles.zoneText}>{pqi.name}</Text>
								</TouchableOpacity>
							</View>
						);
					})}
				</ScrollView>
		</View>
	)
}



const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		backgroundColor: '#f4f4f4',
		padding: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 20,
		color: '#333',
		textAlign: 'center',
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
