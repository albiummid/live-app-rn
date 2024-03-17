import {api, apiOptions} from '../services/api';

export const getUserById = async userId => {
  const {data} = await api.get(
    `/user/find-by-id/${userId}`,

    apiOptions(),
  );
  return data.result;
};
export const updateUsersBasicInformation = async (basicInfo = {}) => {
  const {data} = await api.post(
    `/user/find-by-id/${userId}`,
    basicInfo,
    apiOptions(),
  );
  return data.result;
};
export const getUserList = async queryParams => {
  const {data} = await api.get(`/user/list?${queryParams}`, apiOptions());
  return data.result;
};
