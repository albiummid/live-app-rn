import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  PermissionsAndroid,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Button} from 'react-native-paper';
import {BROADCAST_TYPES, BROADCAST_TYPE_NAMES} from '../../constants';
import {getUser} from '../../constants/values';
import {bsInitiateBroadcast} from '../../services/live/AppServerService';
import {initiateBroadcast} from '../../services/live/StreamingServerService';

export default function GoBroadcast({navigation}) {
  const [user, setUser] = useState(getUser() || null);
  const [loading, setLoading] = useState(true);
  const [avPermitted, setAVPermitted] = useState(null);

  // AV permission
  const requestPermissions = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
      if (
        granted['android.permission.CAMERA'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.RECORD_AUDIO'] ===
          PermissionsAndroid.RESULTS.GRANTED
      ) {
        setAVPermitted(true);
      } else {
        setAVPermitted(false);
        console.log('Camera and microphone permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };
  useEffect(() => {
    requestPermissions();
    setLoading(false);
  }, []);

  if (loading) {
    return <ActivityIndicator size={50} />;
  }

  if (!avPermitted) {
    return (
      <View>
        <Text>Without Audio/Video permission broadcast won't work</Text>
        <Button onPress={requestPermissions}>Ask permission</Button>
      </View>
    );
  }

  const handleLivePress = async name => {
    const broadcastDetails = BROADCAST_TYPES[name];
    const kind = broadcastDetails.kind;

    // Initiating broadcast in streaming server
    const streamingServerBroadcast = await initiateBroadcast(user._id, {
      native: {
        userId: user._id,
        name: user.name,
        image: user.profileImage,
      },
      broadcast: {
        streamKind: broadcastDetails.kind,
        seats: broadcastDetails.seats,
      },
      fp: 'meow',
    });

    // saving broadcast history in appServer/backendServer
    const asNewBroadcast = await bsInitiateBroadcast({
      userId: user._id,
      broadcastId: streamingServerBroadcast.broadcast.broadcastId,
      hostId: user._id,
      title: user.name,
      streamKind: broadcastDetails.kind,
      seats: broadcastDetails.seats,
      initiatedAt: streamingServerBroadcast.broadcast.timeBook.startedAt,
    });

    navigation.navigate(`Host${kind}`, {
      broadcastId: streamingServerBroadcast.broadcast.broadcastId,
      mode: 'Host',
      broadcastDetails,
    });
  };

  return (
    <ImageBackground
      source={{uri: user?.photo}}
      style={styles.goLive}
      blurRadius={16}>
      <View style={styles.Container}>
        {avPermitted ? (
          <View style={styles.optionContainer}>
            <TouchableOpacity
              onPress={() =>
                handleLivePress(BROADCAST_TYPE_NAMES.one_to_many_audio_video)
              }>
              <View style={styles.optionSquareBox}>
                <Image
                  source={require('./../../assets/images/broadcast/optionLive.png')}
                  style={styles.optionImage}
                />
                <Text style={styles.optionText}>Live</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                handleLivePress(BROADCAST_TYPE_NAMES.few_to_many_audio_video)
              }>
              <View style={styles.optionSquareBox}>
                <Image
                  source={require('./../../assets/images/broadcast/optionMultiLive.png')}
                  style={styles.optionImage}
                />
                <Text style={styles.optionText}>Multi Live</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                handleLivePress(BROADCAST_TYPE_NAMES.few_to_many_audio)
              }>
              <View style={styles.optionSquareBox}>
                <Image
                  source={require('./../../assets/images/broadcast/optionAudioLive.png')}
                  style={styles.optionImage}
                />
                <Text style={styles.optionText}>Audio Live</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.contentWrapper}>
            <View style={styles.Header}>
              <Text style={styles.goLiveTitle}>
                You need to provide camera and microphone permission to go live.
              </Text>
              <Text style={styles.goLiveBtn} onPress={requestPermissions}>
                Provide Camera & Microphone Permission
              </Text>
            </View>
          </View>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  optionHeadline: {
    fontSize: 16,
    margin: 20,
    fontWeight: '700',
    color: 'white',
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#00000080',
    marginTop: 20,
    marginBottom: 20,
    padding: 10,
    borderRadius: 10,
  },
  optionSquareBox: {
    width: 100,
    height: 100,
    backgroundColor: 'white',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  optionImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  optionText: {
    marginTop: 10,
    fontSize: 14,
    color: 'black',
    fontWeight: 'bold',
  },

  goLive: {
    padding: 10,
    backgroundColor: 'red',
  },
  Container: {
    marginTop: 50,
    height: '100%',
  },
  Header: {
    backgroundColor: '#00000060',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    padding: 20,
  },
  goLiveTitle: {
    width: '80%',
    color: 'white',
    fontSize: 18,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 20,
  },
  goLiveBtn: {
    backgroundColor: '#2bc48a',
    padding: 15,
    borderRadius: 10,
    textAlign: 'center',
    color: 'white',
    fontWeight: 700,
    fontSize: 16,
    marginBottom: 20,
  },
  Footer: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    flexDirection: 'row',
  },
  contentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  },
});
