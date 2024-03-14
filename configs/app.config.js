const isDevENV = true;
const ENV = isDevENV ? 'development' : 'production';
const getENV = (prodValue, devValue) => {
  return isDevENV ? devValue : prodValue;
};
const localhost = '192.168.0.116';
const port = 5000;

const config = {
  ENV,
  //
  isDevENV,
  //
  API_BASE_URL: getENV(
    `https://engine.potropotrika.com/api/v1`,
    `http://${localhost}:${port}/api/v1`,
  ),
  //
  WS_BASE_URI: getENV(
    `https://engine.potropotrika.com`,
    `http://${localhost}:${port}`,
  ),
  //
  MS_BASE_URL: getENV(
    `https://bucket.potropotrika.com`,
    `http://${localhost}:${port}`,
  ),
  WEB_VIEW_USER_AGENT: getENV('Potroportika@v1', 'Potroportika@v1'),
  CUSTOM_QUERY_PARAM_IN_WEB_VIEW: getENV(
    'utm_source=PotroPotrika',
    'utm_source=PotroPotrika',
  ),
  splashTime: 5,
};

export default config;
