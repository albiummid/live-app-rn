import {ldb} from '../libs/ldb';
import {ldbKeys} from './keys';

export const getUserId = () => ldb.get(ldbKeys.user_id);
export const getUser = () => ldb.getObject(ldbKeys.user_info);
export const getAccessToken = () => ldb.get(ldbKeys.access_token);
export const getDeviceToken = () => ldb.get(ldbKeys.device_token);
