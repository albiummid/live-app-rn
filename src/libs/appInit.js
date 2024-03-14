import {ldbKeys} from '../constants/keys';
import DeviceInfo from 'react-native-device-info';
import {ldb} from './ldb';
import {deviceHandshakeToServer} from '../api/auth.api';
import {getDeviceFCMToken} from './firebase';
export const deviceInit = async () => {
  const deviceToken = ldb.get(ldbKeys.device_token);
  if (!deviceToken) {
    try {
      const device = await deviceHandshakeToServer({
        local_id: DeviceInfo.getUniqueIdSync(),
        kind: 'Android',
        fcm_token: await getDeviceFCMToken(),
        details: {
          brand: DeviceInfo.getBrand(),
          model: DeviceInfo.getModel(),
          name: DeviceInfo.getDeviceNameSync(),
          device_fingerprint: DeviceInfo.getFingerprintSync(),
          build_id: DeviceInfo.getBuildIdSync(),
          unique_id: DeviceInfo.getUniqueIdSync(),
        },
      });
      console.log(device);
      ldb.set(ldbKeys.device_token, device.device_token);
    } catch (err) {
      console.log(err);
    }
  } else {
    console.log('REGISTERED_DEVICE__');
  }
};
export const getAuth = () => {
  const accessToken = ldb.get(ldbKeys.access_token) ?? null;
  const userId = ldb.get(ldbKeys.user_id) ?? null;
  const isAuthenticated = Boolean(accessToken) && Boolean(userId);
  console.log(accessToken, userId);
  return {
    accessToken,
    userId,
    isAuthenticated,
  };
};
