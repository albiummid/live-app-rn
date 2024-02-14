import { ldbKeys } from "../constants/keys"
import { api } from "./api";
import { ldb } from "./ldb"

export const appInit = async ()=>{
    const deviceToken = ldb.get(ldbKeys.device_token);
    if(!deviceToken){
       try{
        const {data} = await api.post('/auth/device/handshake',{
            local_id:12345,
            kind:"Android"
        });

        console.log(data)
        ldb.set(ldbKeys.device_token,data.device.device_token);
        console.log("DEVICE_REGISTERED__")

       }catch(err){
        console.log(err)
       }
        
    }else{
        console.log("REGISTERED_DEVICE__:")
    }
}