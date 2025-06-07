import React, { ReactElement, useEffect, useState } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import useIrrigation, { Zone } from '../hooks/useIrrigation.hook';
import ManualIrrigationModel from '../components/ManualIrrigationModal/ManualIrrigationModal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';




function Zones(): ReactElement {
	const { fetchZones, zones, priorityQueue } = useIrrigation();
	const [selectedZone, setSelectedZone] = useState<Zone>()

	useEffect(() => {
		fetchZones();
	}, []);


	console.log(zones)

	return (
		<View>
			<ScrollView contentContainerStyle={styles.container}>
				<Text style={styles.title}>Irrigation Zone</Text>
				{zones.map((z: Zone, index: number) => {
					const hasSubZones = z.subzones && z.subzones.length > 0;
					const isActive = z.state
					const pqItem =  priorityQueue.find(pq => pq.zone === z.zone)
					return (
						<View key={z.id} >
							{/* Zone Row */}
							<TouchableOpacity style={[styles.zoneCard, !!pqItem && styles.queued, isActive && styles.active]} onPress={() => setSelectedZone(z)} >
								<Text style={styles.zoneText}>{z.name}</Text>
							</TouchableOpacity>
						</View>
					);
				})}
			</ScrollView>
			<ManualIrrigationModel
				open={!!selectedZone}
				zone={selectedZone}
				onClose={() => setSelectedZone(undefined)}
			/>	
		</View>
		
	);
}

export default Zones;

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
	},
	queued: {
		backgroundColor: 'orange'
	}
});
