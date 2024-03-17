import {api, apiOptions, setHeaders} from '../services/api';

export const deviceHandshakeToServer = async payload => {
  const {data} = await api.post('/auth/device/handshake', payload);
  console.log(data);
  return data.result;
};

export const approveGoogleSignIn = async payload => {
  const {data} = await api.post('/auth/signIn/google', payload, apiOptions());
  return data.result;
};

export const signOutFromApp = async () => {
  const {data} = await api.get('/signout');
  return data.result;
};
