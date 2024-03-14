import config from '../../configs/app.config';
import {ldbKeys} from '../constants/keys';
import {ldb} from '../libs/ldb';

const {io} = require('socket.io-client');
export const getWSAuth = () => ({
  user_id: ldb.get(ldbKeys.user_id),
  access_token: ldb.get(ldbKeys.access_token),
  device_token: ldb.get(ldbKeys.device_token),
});

export const ws = io(config.WS_BASE_URI, {
  auth: getWSAuth(),
});
