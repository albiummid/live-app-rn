import {deviceInfo} from './Device.js';
import {ldbExists, ldbStore, ldbClear} from './LocalDB';
import {apiPost} from './Req.js';
api;
import requestLocationPermission from './permissions/RequestLocationPermission.js';

export default init = async () => {
  if (!(await ldbExists('device'))) {
    await bindDevice();
  }

  console.log('Already Device Binded');
  await requestLocationPermission();
};

async function bindDevice() {
  try {
    let body = {
      source: APP_ID,
      token: 'FCM Token',
      optionals: deviceInfo(),
    };
    const response = await apiPost('auth/bind/device', body);

    if (response.status === 200 || response.status === 201) {
      console.log(response.data.data.device.dhKey);
      await ldbStore('device', response.data.data.device.dhKey);
    }
  } catch (e) {
    console.log('[ CATCH BLOCK ERROR ] System :: bindDevice :: Error' + e);
  }
}
