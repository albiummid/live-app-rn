import {getAuth} from '../libs/appInit';
import {api, apiOptions} from '../services/api';

export const getFollowCount = async followeeId => {
  const res = await api.get(`/follow/count/${followeeId}`, apiOptions());
  return res.data.result.count;
};
export const getFollowerList = async (followeeId, queryParams = `?page=1`) => {
  const res = await api.get(
    `/follow/list/${followeeId}` + queryParams,
    apiOptions(),
  );
  return res.data.result;
};
export const checkIsFollowing = async (followeeId, followerId) => {
  const {data} = await api.get(
    `/follow/check-is-following/${followeeId}/${followerId}`,
    apiOptions(),
  );
  return data.result;
};

export const doFollow = async (followeeId, followerId) => {
  const {data} = await api.post(
    `/follow/do-follow`,
    {followeeId, followerId},
    apiOptions(),
  );
  return data.result;
};
export const doUnFollow = async (followeeId, followerId) => {
  const {data} = await api.post(
    `/follow/do-unfollow`,
    {followeeId, followerId},
    apiOptions(),
  );
  return data.result;
};
