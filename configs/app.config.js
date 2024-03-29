const isDevENV = true;
const getENV = (prodValue, devValue) => {
  return isDevENV ? devValue : prodValue;
};
const localhost = '192.168.0.105';
const port = 5000;
const domain = getENV(
  'https://testing-node-4t0h.onrender.com',
  `http://${localhost}`,
);

const config = {
  APP_ID: 'com.live_app_rn',
  APP_KEY: 'OhYeahh',
  APP_SECRET: 'golapjobajuichameli99',
  APP_VERSION: '1.0.0',
  APP_NAME: 'live_app_rn',
  ENV: isDevENV ? 'development' : 'production',
  //
  isDevENV,
  //
  API_BASE_URL: getENV(`${domain}/api/v1`, `${domain}:${port}/api/v1`),
  //
  WS_BASE_URI: getENV(`${domain}`, `${domain}:${port}`),
  STREAMING_SERVER_WS_URI: getENV(`${domain}`, `${domain}:${5483}`),
  APP_SERVER_WS_URI: getENV(`${domain}`, `${domain}:${port}`),
  //
  MS_BASE_URL: `${domain}`,
  WEB_VIEW_USER_AGENT: getENV('Potroportika@v1', 'Potroportika@v1'),
  CUSTOM_QUERY_PARAM_IN_WEB_VIEW: getENV(
    'utm_source=PotroPotrika',
    'utm_source=PotroPotrika',
  ),
  splashTime: 1,
};

export default config;
