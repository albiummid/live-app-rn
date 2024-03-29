import {MMKV} from 'react-native-mmkv';

const ldbStorage = new MMKV();

export const ldb = {
  set: (key, value) => {
    if (typeof value === 'string') ldbStorage.set(key, value);
    else ldbStorage.set(key, JSON.stringify(value));
  },
  get: key => {
    const string = ldbStorage.getString(key);
    return string || null;
  },
  getObject: key => {
    const string = ldbStorage.getString(key);
    return JSON.parse(string) || string || null;
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
