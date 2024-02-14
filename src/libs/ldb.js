import { MMKV } from "react-native-mmkv";

 const ldbStorage = new MMKV();

export const ldb = {
    set:(key,value)=>{
        console.log(value)
        ldbStorage.set(key,JSON.stringify(value));
    },
    get:(key)=>{
        return ldbStorage.getString(key);
    },
    clearAll:()=>{
        ldbStorage.clearAll();
    },
    getAllKeys:()=>{
        return ldbStorage.getAllKeys();
    },
    delete:(key)=>{
        ldbStorage.delete(key);
    }
}

