import {MMKV} from 'react-native-mmkv';

const ldbStorage = new MMKV();

export const ldb = {
  set: (key, value) => {
    if (typeof value === 'string') ldbStorage.set(key, value);
    else ldbStorage.set(key, JSON.stringify(value));
  },
  get: key => {
    return ldbStorage.getString(key) ?? null;
  },
  clearAll: () => {
    ldbStorage.clearAll();
  },
  getAllKeys: () => {
    return ldbStorage.getAllKeys();
  },
  delete: key => {
    ldbStorage.delete(key);
  },
};
