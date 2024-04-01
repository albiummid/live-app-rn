import React from 'react';
import {Alert, Text, TouchableOpacity, View} from 'react-native';
import {approveGoogleSignIn} from '../../api/auth.api';
import {getUserById} from '../../api/user.api';
import {ldbKeys} from '../../constants/keys';
import {codes, getDeviceFCMToken, signInWithGoogle} from '../../libs/firebase';
import {ldb} from '../../libs/ldb';
import {apiOptions} from '../../services/api';

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
      ldb.set(ldbKeys.access_token, data.access_token);
      ldb.set(ldbKeys.user_id, data.user_id);
      const userInfo = await getUserById(data.user_id);
      ldb.set(ldbKeys.user_info, userInfo);
      navigation.navigate('Tab');
    } catch (error) {
      if (error.code === codes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
        Alert.alert('Login process dismissed!');
      } else if (error.code === codes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
        Alert.alert('SignIn process running. Hold on.');
      } else if (error.code === codes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
        Alert.alert('Your play service is outdated!');
      } else {
        // some other error happened
        Alert.alert('Other error happend!');
      }
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
