import {ldb} from '../libs/ldb';
import {ldbKeys} from '../constants/keys';

export default function useAuth() {
  const accessToken = ldb.get(ldbKeys.access_token);
  const deviceToken = ldb.get(ldbKeys.device_token);
  const userId = ldb.get(ldbKeys.user_id);

  return {
    isAuthenticated: accessToken && userId,
    deviceToken,
    userId,
    accessToken,
  };
}
