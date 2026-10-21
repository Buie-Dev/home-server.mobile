import * as base from './base.api';
import {HEALTH_CHECK, IRRIGATION} from './apiRoutes';
import {CreateScheduleParams} from '../hooks/useIrrigation.hook';

export const fetchSchedules = async (zoneId?: number, subzoneId?: number) => {
  return await base.get(`${IRRIGATION}/schedules`, {zoneId, subzoneId});
};

export const createSchedule = async (data: CreateScheduleParams) => {
  return await base.put(`${IRRIGATION}/schedules`, data);
};

export const updateSchedule = async (
  id: number,
  data: CreateScheduleParams,
) => {
  return await base.put(`${IRRIGATION}/schedules/${id}`, data);
};

export const deleteSchedule = async (id: number) => {
  return await base.del(`${IRRIGATION}/schedules/${id}`);
};

export const toggleSchedule = async (id: number, active: boolean) => {
  return await base.post(`${IRRIGATION}/schedules/${id}/toggle`, {active});
};

export const fetchZones = async (zoneTypeId?: number) => {
  return await base.get(`${IRRIGATION}/zones`, {zoneTypeId});
};

export const fetchZoneTypes = async () => {
  return await base.get(`${IRRIGATION}/zones/types`);
};

export const checkScheduleSync = async () => {
  return await base.get(`${IRRIGATION}/schedules/sync-status`);
};

export const forceScheduleSync = async () => {
  return await base.post(`${IRRIGATION}/schedules/sync`, {});
};

export const reorderSchedules = async (ids: number[]) => {
  return await base.put(`${IRRIGATION}/schedules/reorder`, {ids});
};

export const healthCheck = async () => {
  return await base.get(HEALTH_CHECK);
};
