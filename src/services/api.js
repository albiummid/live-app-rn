import {useQueryClient} from '@tanstack/react-query';
import axios from 'axios';
import {ldb} from '../libs/ldb';
import {ldbKeys} from '../constants/keys';
import config from '../../configs/app.config';

// import { effect } from "@preact/signals";
// console.log(authState.value);
export const setHeaders = () => {
  return {
    'x-device-token': ldb.get(ldbKeys.device_token) ?? '',
    'x-uid': ldb.get(ldbKeys.user_id) ?? '',
    Authorization: `Bearer ${ldb.get(ldbKeys.access_token)}`,
  };
};

export const apiOptions = () => ({
  headers: {
    'x-device-token': ldb.get(ldbKeys.device_token) ?? '',
    'x-uid': ldb.get(ldbKeys.user_id) ?? '',
    Authorization: `Bearer ${ldb.get(ldbKeys.access_token)}`,
  },
});
export const api = axios.create({
  baseURL: config.API_BASE_URL,
});

export const useQC = () => {
  const queryClient = useQueryClient();
  const invalidateQuery = (queryKey = []) => {
    return queryClient.invalidateQueries({
      queryKey,
    });
  };
  return {invalidateQuery};
};

api.interceptors.response.use(
  data => {
    // console.log(`\n__RESPONSE::${data.message}\n`, data, "\n");
    return data;
  },
  async err => {
    console.log('___ERROR__:', JSON.stringify(err?.config, null, 2));
    throw err?.response;
  },
);
