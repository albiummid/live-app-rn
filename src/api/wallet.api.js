import {getUserId} from '../constants/values';
import {api, apiOptions} from '../services/api';
export const getUserWallet = async () => {
  const {data} = await api.get(`/wallet/user/${getUserId()}`, apiOptions());
  return data.result;
};

// bean/transfer
// diamond/transfer
// vip-diamond/transfer
// bean/insert-from-vault
// diamond/insert-from-vault
// vip-diamond/insert-from-vault
// ## Above routes are for admin
