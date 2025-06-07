import React, { ReactElement, useEffect, useState } from 'react';
import { Button, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import useIrrigation, { Schedule } from '../hooks/useIrrigation.hook';
import { StyleSheet } from 'react-native';
import CreateScheduleModal from '../components/CreateScheduleModal/CreateScheduleModal';



function Schedules(): ReactElement {

	const [openCreateScheduleModal, setOpenCreateScheduleModal] = useState<boolean>(false)
	const { schedules, fetchSchedules, deleteSchedule } = useIrrigation()

	const onSave = () => {
		fetchSchedules()
		setOpenCreateScheduleModal(false)
	}

	const formatDaysOfWeek = (s: Schedule) => {
		if (s.monday && s.tuesday && s.wednesday && s.thursday && s.friday && s.saturday && s.sunday) {
			return 'Everyday'
		}
		if (s.monday && s.tuesday && s.wednesday && s.thursday && s.friday && !s.saturday && !s.sunday) {
			return 'Weekday'
		}
		if (s.monday && s.tuesday && s.wednesday && s.thursday && s.friday && s.saturday && !s.sunday) {
			return 'Weekday and Saturday'
		}
		if (s.monday && s.tuesday && s.wednesday && s.thursday && s.friday && !s.saturday && s.sunday) {
			return 'Weekday and Sunday'
		}
		const days = []
		if (s.monday) days.push('Mon')
		if (s.tuesday) days.push('Tues')
		if (s.wednesday) days.push('Wed')
		if (s.thursday) days.push('Thur')
		if (s.friday) days.push('Fri')
		if (s.saturday) days.push('Sat')
		if (s.sunday) days.push('Sun')

		return days.join(", ")
	}

	const onDelete = async (id: number ) => {
		await deleteSchedule(id)
		fetchSchedules()
	}

	useEffect(() => {
		fetchSchedules();
	}, [])



	console.log(schedules)
	return (
		<View style={styles.content}>
			<Text style={styles.title}>Schedules</Text>
			<ScrollView contentContainerStyle={styles.container} style={styles.scroll}>
					{schedules.map(s => (
						<View key={s.id} >
								<Text style={styles.zoneText}>{s.name}</Text>
								<Text style={styles.zoneText}>{s.startTime}</Text>
								<Text style={styles.zoneText}>{s.duration}</Text>
								<Text>{formatDaysOfWeek(s)}</Text>
								<Button title="X" onPress={() => onDelete(s.id)}/>
						</View>
					))}
				</ScrollView>
				 <Button title={"Create Schedule"} onPress={() => setOpenCreateScheduleModal(true)}  />
					<CreateScheduleModal open={openCreateScheduleModal} onClose={() => setOpenCreateScheduleModal(false)} onSave={onSave} />
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

export default Schedules
