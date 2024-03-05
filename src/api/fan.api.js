import {api, apiOptions} from '../services/api';

export const getFanCount = async celebrityId => {
  const res = await api.get(`/fan/count/${celebrityId}`, apiOptions());
  return res.data.result.count;
};

export const getFanList = async (celebrityId, queryParams = `?page=1`) => {
  const res = await api.get(
    `/fan/list/${celebrityId}` + queryParams,
    apiOptions(),
  );
  return res.data.result;
};
export const checkIsFan = async (celebrity, fanId) => {
  const {data} = await api.get(`/fan/check-is-fan/${celebrity}/${fanId}`);
  return data.result;
};

export const beFan = async ({celebrityUID, fanUID}) => {
  const {data} = await api.post(
    `/fan/be-fan`,
    {celebrityUID, fanUID},
    apiOptions(),
  );
  return data.result;
};
export const doUnFan = async ({celebrityUID, fanUID}) => {
  const {data} = await api.post(
    `/follow/do-unfollow`,
    {celebrityUID, fanUID},
    apiOptions(),
  );
  return data.result;
};
