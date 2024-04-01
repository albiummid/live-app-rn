import config from '../../settings';
import {getUser, getUserId} from './values';

export const BROADCAST_TYPE_NAMES = {
  one_to_many_audio_video: 'one_to_many_audio_video',
  few_to_many_audio_video: 'few_to_many_audio_video',
  one_to_many_audio: 'one_to_many_audio',
  few_to_many_audio: 'few_to_many_audio',
};

export const BROADCAST_KIND_BY_NAME = {
  one_to_many_audio_video: 'OTMAV',
  few_to_many_audio_video: 'FTMAV',
  one_to_many_audio: 'OTMA',
  few_to_many_audio: 'FTMA',
};

export const BROADCAST_TYPES = {
  one_to_many_audio_video: {
    name: 'one_to_many_audio_video',
    seats: 1,
    kind: 'OTMAV',
  },
  few_to_many_audio_video: {
    name: 'few_to_many_audio_video',
    seats: 4,
    kind: 'FTMAV',
  },
  one_to_many_audio: {
    name: 'one_to_many_audio',
    seats: 1,
    kind: 'OTMA',
  },
  few_to_many_audio: {
    name: 'few_to_many_audio',
    seats: 12,
    kind: 'FTMA',
  },
};

export const getAppLocalData = () => {
  return {
    app: {
      appId: config.APP_ID,
      auth: {
        key: config.APP_KEY,
        secret: config.APP_SECRET,
      },
    },
    native: {
      user: {
        id: getUserId(),
        name: getUser().name,
        image: getUser().photo,
      },
    },
  };
};
