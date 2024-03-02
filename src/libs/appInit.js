import { ldbKeys } from "../constants/keys"
import DeviceInfo from 'react-native-device-info'
import { ldb } from "./ldb";
import { api } from "../services/api";
export const deviceInit = async()=>{
    const deviceToken = ldb.get(ldbKeys.device_token);
    if(!deviceToken){
       try{
        const {data} = await api.post('/auth/device/handshake',{
            local_id:DeviceInfo.getUniqueIdSync(),
            kind:"Android",
            details:{
                brand:DeviceInfo.getBrand(),
                model:DeviceInfo.getModel(),
                name:DeviceInfo.getDeviceNameSync(),
                device_fingerprint:DeviceInfo.getFingerprintSync(),
                build_id:DeviceInfo.getBuildIdSync(),
                unique_id:DeviceInfo.getUniqueIdSync(),
            }
        });
        ldb.set(ldbKeys.device_token,data.device.device_token);
        console.log("DEVICE_REGISTERED__")

       }catch(err){
        console.log(err)
       }
        
    }else{
        console.log("REGISTERED_DEVICE__")
    }

}
export const appInit =  ()=>{
    const accessToken=ldb.get(ldbKeys.access_token)??null;
   const userId=ldb.get(ldbKeys.user_id)??null;
   const isAuthenticated=Boolean(accessToken)&&Boolean(userId);
    return {
      accessToken,
      userId,
      isAuthenticated
    }
}