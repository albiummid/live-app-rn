// export const getLocalServerIp = () => {
//   const {networkInterfaces} = require('os');
//   const nets = networkInterfaces();
//   const results = {};
//   let local_ipv4s = [];
//   for (const name of Object.keys(nets)) {
//     for (const net of nets[name]) {
//       // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
//       if (net.family === 'IPv4' && !net.internal) {
//         if (!results[name]) {
//           results[name] = [];
//         }
//         results[name].push(net.address);
//         if (net.address.startsWith('192.168')) {
//           local_ipv4s.push(net.address);
//         }
//       }
//     }
//   }
//   return local_ipv4s[0];
// };

export const catchAsyncErrors =
  func =>
  (...params) => {
    Promise.resolve(func(...params)).catch(error => {
      console.log(JSON.stringify(err, null, 4));
    });
  };

let timeout;
export const debounce = (cb, delay = 1000) => {
  if (timeout) {
    clearTimeout(timeout);
  }
  return (...arg) => {
    timeout = setTimeout(() => {
      cb(...arg);
    }, delay);
  };
};

export function requiredFieldMissing(inObject, withKeys = []) {
  let missing = [];

  for (let key of withKeys) {
    if (!inObject[key]) {
      missing.push(key);
    }
  }

  console.log('Missing Fields:');
  console.log(missing);

  return missing.length > 0 ? true : false;
}

export function getType(p) {
  if (Array.isArray(p)) return 'array';
  else if (typeof p == 'string') return 'string';
  else if (p != null && typeof p == 'object') return 'object';
  else return 'other';
}

export const Log = (msg, ...arg) => {
  return console.log(`\n\n[ ${msg} ]==>>\n`, ...arg, '\n\n');
};
