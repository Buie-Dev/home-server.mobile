import * as base from './base.api'
import { IRRIGATION } from './apiRoutes'

export const fetchHistory = async (params?: {
  limit?: number
  offset?: number
  zoneId?: number
  subzoneId?: number
  startDate?: string
  endDate?: string
}) => {
  return await base.get(`${IRRIGATION}/history`, params)
}

export const fetchHistoryTotals = async (params?: {
  zoneId?: number
  subzoneId?: number
}) => {
  return await base.get(`${IRRIGATION}/history/totals`, params)
}

export const deleteHistory = async (id: number) => {
  return await base.del(`${IRRIGATION}/history/${id}`)
}
