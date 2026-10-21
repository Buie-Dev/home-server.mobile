import * as base from './base.api';
import {DEVICES} from './apiRoutes';

export const fetchDeviceStatus = async () => {
  return await base.get(DEVICES);
};
