import {streamingServerWS} from '../ws';

export async function inquireBroadcast(
  originId,
  broadcastId,
  localData = null,
) {
  return new Promise((resolve, reject) => {
    streamingServerWS.emit(
      'inquireBroadcast',
      {
        originId,
        broadcastId,
        localData,
      },
      async data => {
        if (data.error) {
          reject(data.error);
        }
        resolve(data.data);
      },
    );
  });
}

export async function joinBroadcast(originId, broadcastId, localData = null) {
  return new Promise((resolve, reject) => {
    streamingServerWS.emit(
      'joinBroadcast',
      {
        broadcastId,
        originId,
        localData,
      },
      async data => {
        if (data.error) {
          reject(data.error);
        }
        resolve(data.data);
      },
    );
  });
}

export async function initiateBroadcast(originId, localData = null) {
  return new Promise((resolve, reject) => {
    streamingServerWS.emit(
      'initiateBroadcast',
      {
        originId,
        localData,
      },
      async data => {
        if (data.error) {
          reject(data.error);
        }
        resolve(data.data);
      },
    );
  });
}

export async function subscribe(originId, broadcastId, localData) {
  return new Promise((resolve, reject) => {
    streamingServerWS.emit(
      'broadcastSubscribe',
      {
        broadcastId,
        originId,
        localData,
      },
      data => {
        if (data.error) {
          reject(data.error);
        }
        resolve(data.data);
      },
    );
  });
}

export async function createServerTransportToPublish(
  originId,
  broadcastId,
  localData,
) {
  return new Promise((resolve, reject) => {
    streamingServerWS.emit(
      'broadcastPublish',
      {
        broadcastId,
        originId,
        localData,
      },
      data => {
        if (data.error) {
          reject(data.error);
        }
        resolve(data.data);
      },
    );
  });
}

export async function sendTransportOnConnect(
  originId,
  broadcastId,
  transportId,
  dtlsParameters,
  localData = null,
) {
  return new Promise((resolve, reject) => {
    streamingServerWS.emit(
      'transport-connect',
      {
        originId,
        broadcastId,
        transportId,
        dtlsParameters,
        localData,
      },
      data => {
        if (data.error) {
          reject(data.error);
        }
        resolve(data.data);
      },
    );
  });
}

export async function sendTransportOnProduce(
  originId,
  broadcastId,
  transportId,
  kind,
  rtpParameters,
  localData = null,
) {
  return new Promise((resolve, reject) => {
    streamingServerWS.emit(
      'transport-produce',
      {
        originId,
        broadcastId,
        transportId,
        kind,
        rtpParameters,
        localData,
      },
      data => {
        if (data.error) {
          reject(data.error);
        }
        resolve(data.data);
      },
    );
  });
}

export async function onAirProducers(originId, broadcastId, localData = null) {
  return new Promise((resolve, reject) => {
    streamingServerWS.emit(
      'broadcastProducers',
      {
        broadcastId,
        originId,
      },
      data => {
        if (data.error) {
          reject(data.error);
        }
        resolve(data.data);
      },
    );
  });
}

export async function onAirPublishers(originId, broadcastId, localData = null) {
  return new Promise((resolve, reject) => {
    streamingServerWS.emit(
      'broadcastPublishers',
      {
        broadcastId,
        originId,
      },
      data => {
        if (data.error) {
          reject(data.error);
        }
        resolve(data.data);
      },
    );
  });
}

export async function createServerTransportToConsume(
  originId,
  broadcastId,
  subscriberId,
  localData,
) {
  return new Promise((resolve, reject) => {
    streamingServerWS.emit(
      'broadcastConsume',
      {
        broadcastId,
        originId,
        subscriberId,
        localData,
      },
      data => {
        if (data.error) {
          reject(data.error);
        }
        resolve(data.data);
      },
    );
  });
}

export async function deviceRecvTransportConnect(
  originId,
  broadcastId,
  transportId,
  dtlsParameters,
  localData = null,
) {
  return new Promise((resolve, reject) => {
    streamingServerWS.emit(
      'transport-recv-connect',
      {
        originId,
        broadcastId,
        transportId,
        dtlsParameters,
      },
      data => {
        if (data.error) {
          reject(data.error);
        }
        resolve(data.data);
      },
    );
  });
}

export async function deviceRecvTransportConsume(
  originId,
  broadcastId,
  transportId,
  producerId,
  rtpCapabilities,
  localData = null,
) {
  return new Promise((resolve, reject) => {
    streamingServerWS.emit(
      'transport-recv-consume',
      {
        originId,
        broadcastId,
        transportId,
        producerId,
        rtpCapabilities,
        localData,
      },
      data => {
        if (data.error) {
          reject(data.error);
        }
        resolve(data.data);
      },
    );
  });
}

export async function rtpCaps(originId, broadcastId, localData = null) {
  return new Promise((resolve, reject) => {
    streamingServerWS.emit(
      'routerRtpCaps',
      {
        broadcastId,
        originId,
      },
      data => {
        console.log('Router RTP Caps');
        if (data.error) {
          reject(data.error);
        }
        resolve(data.data.rtpCapabilities);
      },
    );
  });
}

export async function resumeConsumer(
  originId,
  broadcastId,
  consumerId,
  localData,
) {
  return new Promise((resolve, reject) => {
    streamingServerWS.emit(
      'transport-recv-consume-resume',
      {
        broadcastId,
        originId,
        consumerId,
      },
      data => {
        if (data.error) {
          reject(data.error);
        }
        resolve(data.data);
      },
    );
  });
}

export async function endBroadcasting(originId, broadcastId, localData) {
  return new Promise((resolve, reject) => {
    streamingServerWS.emit(
      'theEnd',
      {
        broadcastId,
        originId,
        localData,
      },
      data => {
        if (data.error) {
          reject(data.error);
        }
        resolve(data.data);
      },
    );
  });
}
