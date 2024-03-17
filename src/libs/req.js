import axios from 'axios';
// import {API_URL, APP_ID} from '../../config';
// import {ldbExists, ldbGet} from './LocalDB';
import AlertError from '../widgets/AlertError';

export const buildHeaders = async (apiSpecificHeaders = null) => {
  let headers = {
    'Content-Type': 'application/json',
    source: APP_ID,
  };

  if (apiSpecificHeaders) {
    headers = {...headers, ...apiSpecificHeaders};
  }

  if (await ldbExists('device')) {
    const device = await ldbGet('device');
    headers.device = device;
  }

  if (await ldbExists('user')) {
    const user = await ldbGet('user');
    headers.user = user;
  }

  if (await ldbExists('session')) {
    const session = await ldbGet('session');
    headers.session = session;
  }

  return headers;
};

export const buildURL = endpoint => {
  if (endpoint.startsWith('http') || endpoint.startsWith('https')) {
    return endpoint;
  }
  return `${API_URL}/${endpoint}`;
};

export const apiGet = async (endpoint, apiSpecificHeaders = null) => {
  const response = await axios.get(buildURL(endpoint), {
    headers: await buildHeaders(apiSpecificHeaders),
  });

  return response;
};

export const apiPost = async (endpoint, body, apiSpecificHeaders = null) => {
  try {
    const builtEndpoint = buildURL(endpoint);
    const builtHeaders = await buildHeaders(apiSpecificHeaders);
    console.log(`Endpoint::: ${builtEndpoint}`);
    console.log('Headers ::');
    console.log(builtHeaders);
    console.log('Body');
    console.log(body);
    const response = await axios.post(builtEndpoint, body, {
      headers: builtHeaders,
    });

    console.log('Main Response :: ');
    console.log(response);

    return response;
  } catch (e) {
    console.log('Error in apiPost');
    console.log(e);
  }
};
