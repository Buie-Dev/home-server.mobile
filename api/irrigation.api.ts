
import * as base from './base.api'
import { IRRIGATION } from './apiRoutes'
import { CreateScheduleParams } from '../hooks/useIrrigation.hook'



export const fetchSchedules = async () => {
	return await base.get(`${IRRIGATION}/schedules`)
}

export const createSchedule = async (data: CreateScheduleParams) => {
	return await base.put(`${IRRIGATION}/schedules`, data)
}

export const deleteSchedule = async (id: number) => {
	return await base.del(`${IRRIGATION}/schedules/${id}`)
}

export const fetchZones = async () => {
	console.log(`${IRRIGATION}/zones`)
	return await base.get(`${IRRIGATION}/zones`)
}