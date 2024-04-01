const isDevENV = false;
const getENV = (prodValue, devValue) => {
  return isDevENV ? devValue : prodValue;
};
const localhost = '192.168.0.112';
const app_server_dev_port = 5000;
const live_server_dev_port = 5483;
const domain = getENV(
  'https://x1-live-app.innovainfosys.com',
  `http://${localhost}:${app_server_dev_port}`,
);
const live_server_domain = getENV(
  `https://x1-live-server.innovainfosys.com`,
  `http://${localhost}:${live_server_dev_port}`,
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
  API_BASE_URL: `${domain}/api/v1`,
  //
  WS_BASE_URI: domain,
  STREAMING_SERVER_WS_URI: live_server_domain,
  APP_SERVER_WS_URI: domain,
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
