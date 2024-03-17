import {View, Text, TouchableOpacity, Alert} from 'react-native';
import React from 'react';
import {
  codes,
  getDeviceFCMToken,
  getDeviceToken,
  signInWithGoogle,
} from '../../libs/firebase';
import {api, apiOptions, setHeaders} from '../../services/api';
import {ldb} from '../../libs/ldb';
import {ldbKeys} from '../../constants/keys';
import {approveGoogleSignIn} from '../../api/auth.api';

export default function LoginScreen({navigation}) {
  React.useEffect(() => {
    getDeviceFCMToken().then(d => console.log(d));
  }, []);
  const handleSignInWithGoogle = async () => {
    console.log(apiOptions());
    try {
      const json = await signInWithGoogle();
      const {displayName, email, photoURL} = json.user.providerData[0];
      const data = await approveGoogleSignIn({
        properties: {
          name: displayName,
          email,
          photo: photoURL,
        },
      });
      console.log(data);

      ldb.set(ldbKeys.access_token, data.access_token);
      ldb.set(ldbKeys.user_id, data.user_id);
      navigation.navigate('Tab');
    } catch (e) {
      console.log(e);
      // if (error.code === codes.SIGN_IN_CANCELLED) {
      //   // user cancelled the login flow
      //   Alert.alert('Login process dismissed!');
      // } else if (error.code === codes.IN_PROGRESS) {
      //   // operation (e.g. sign in) is in progress already
      //   Alert.alert('SignIn process running. Hold on.');
      // } else if (error.code === codes.PLAY_SERVICES_NOT_AVAILABLE) {
      //   // play services not available or outdated
      //   Alert.alert('Your play service is outdated!');
      // } else {
      //   // some other error happened
      // }
    }
  };
  return (
    <View className="flex-1 ">
      <TouchableOpacity
        onPress={handleSignInWithGoogle}
        className="my-auto mx-auto bg-green-300 px-5 py-2 rounded-md">
        <Text className=" text-black ">Sign In With Google</Text>
      </TouchableOpacity>
    </View>
  );
}
