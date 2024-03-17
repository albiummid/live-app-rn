import {
  Text,
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  PermissionsAndroid,
  Image,
} from 'react-native';
import React, {Component, useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';

import {getUserById} from '../api/user.api';
import {ldb} from '../libs/ldb';
import {ldbKeys} from '../constants/keys';
import {initiateBroadcast} from '../services/live/StreamingServerService';
import {bsInitiateBroadcast} from '../services/live/AppServerService';

function GoLive() {
  const navigation = useNavigation();
  const [permitted, setPermitted] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // iife
    (async () => {
      const localUser = await getUserById(ldb.get(ldbKeys.user_id));
      setUser(localUser);
      requestPermissions();
    })();
  }, []);

  const handleBoxPress = async streamKind => {
    console.log('PRESSED');
    try {
      let seats = 1;
      if (streamKind == 'FTMAV') {
        seats = 4;
      } else if (streamKind == 'FTMA') {
        seats = 12;
      }

      const lsNewBroadcast = await initiateBroadcast(user._id, {
        native: {
          userId: user._id,
          name: user.name,
          image: user.profileImage,
        },
        broadcast: {
          streamKind: streamKind,
          seats: seats,
        },
        fp: 'meow',
      });
      console.log('LS New Broadcast');
      console.log(lsNewBroadcast.broadcast.broadcastId);

      const bsNewBroadcast = await bsInitiateBroadcast({
        userId: user._id,
        broadcastId: lsNewBroadcast.broadcast.broadcastId,
        hostId: user._id,
        title: user.name,
        streamKind: streamKind,
        seats: seats,
        initiatedAt: lsNewBroadcast.broadcast.timeBook.startedAt,
      });
      // navigate to join broadcast
      navigation.navigate('JoinBroadcast', {
        broadcastId: lsNewBroadcast.broadcast.broadcastId,
        mode: 'Host', // Init or Watch
        user: user,
      });
    } catch (error) {
      console.log('Caught Error Box Press');
      console.log(error);
    }
  };

  const requestPermissions = async () => {
    console.log('Permission Requested');
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
        try {
          setPermitted(true);
        } catch (error) {
          console.log('Error After Permission Granted: ', error);
        }
      } else {
        console.log('Camera and microphone permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  if (!permitted || user == null) {
    return null;
  }

  return (
    <ImageBackground
      source={{uri: user.photo}}
      style={styles.goLive}
      blurRadius={16}>
      <View style={styles.Container}>
        {permitted ? (
          <View style={styles.optionContainer}>
            <TouchableOpacity onPress={() => handleBoxPress('OTMAV')}>
              <View style={styles.optionSquareBox}>
                <Image
                  source={require('./../assets/images/broadcast/optionLive.png')}
                  style={styles.optionImage}
                />
                <Text style={styles.optionText}>Live</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleBoxPress('FTMAV')}>
              <View style={styles.optionSquareBox}>
                <Image
                  source={require('../assets/images/broadcast/optionMultiLive.png')}
                  style={styles.optionImage}
                />
                <Text style={styles.optionText}>Multi Live</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleBoxPress('FTMA')}>
              <View style={styles.optionSquareBox}>
                <Image
                  source={require('./../assets/images/broadcast/optionAudioLive.png')}
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

export default GoLive;
