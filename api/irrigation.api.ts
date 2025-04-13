
import * as base from './base.api'
import { IRRIGATION } from './apiRoutes'





export const fetchZones = async () => {
	console.log(`${IRRIGATION}/zones`)
	return await base.get(`${IRRIGATION}/zones`)
}