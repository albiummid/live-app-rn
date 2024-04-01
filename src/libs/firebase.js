import auth from '@react-native-firebase/auth';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import dynamicLinks from '@react-native-firebase/dynamic-links';
import messaging from '@react-native-firebase/messaging';
import {useEffect, useState} from 'react';
import {Alert} from 'react-native';
export const codes = statusCodes;
export const signInWithGoogle = async () => {
  // Configure signInPackage
  GoogleSignin.configure({
    // the client id from client_type:3
    webClientId:
      '560166412888-ddhgqs9mpo9u587b241t7268j5nm39vr.apps.googleusercontent.com',
  });

  await GoogleSignin.hasPlayServices();
  const {idToken} = await GoogleSignin.signIn();

  const googleCredential = auth.GoogleAuthProvider.credential(idToken);

  return await auth().signInWithCredential(googleCredential);
};

export const signOut = async () => {
  console.log(auth().currentUser);
  return await auth()
    .signOut()
    .then(async () => {
      console.log('User signed out!');
    });
};

// export const signInWithFacebook = async () => {
//   // Attempt login with permissions
//   const result = await LoginManager.logInWithPermissions([
//     'public_profile',
//     'email',
//   ]);

//   if (result.isCancelled) {
//     throw 'User cancelled the login process';
//   }

//   // Once signed in, get the users AccessToken
//   const data = await AccessToken.getCurrentAccessToken();

//   if (!data) {
//     throw 'Something went wrong obtaining access token';
//   }

//   // Create a Firebase credential with the AccessToken
//   const facebookCredential = auth.FacebookAuthProvider.credential(
//     data.accessToken,
//   );

//   // Sign-in the user with the credential
//   return auth().signInWithCredential(facebookCredential);
// };

export const useFirebaseAuth = () => {
  // Set an initializing state whilst Firebase connects
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Handle user state changes
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  return {
    user,
    isAuthenticated,
  };
};

export const handleDynamicLinksInForeground = () => {
  // call it in App.js's useEffect's inside of cleanup function
  dynamicLinks().onLink(link => {
    console.log('DYNAMIC_LINK_IN_FOREGROUND_MODE:_', link);
  });
};

export const handleDynamicLinksInBackgroundOrQuitMode = () => {
  // call it on useEffect in App.js
  dynamicLinks()
    .getInitialLink()
    .then(link => {
      console.log('DYNAMIC_LINK_IN_BACKGROUND_OR_QUIT_MODE:_', link);
    });
};

export async function buildLink(linkURL) {
  const link = await dynamicLinks().buildLink({
    link: linkURL,
    // domainUriPrefix is created in your Firebase console
    domainUriPrefix: 'https://pptrknews.page.link',
    // optional setup which updates Firebase analytics campaign
    // "banner". This also needs setting up before hand
    // analytics: {
    //   campaign: 'banner',
    // },
  });

  return link;
}

export const getDeviceFCMToken = async () => {
  await messaging().registerDeviceForRemoteMessages();
  const token = await messaging().getToken();
  return token;
};

export const registerForegroundMessageListener = () =>
  messaging().onMessage(async remoteMessage => {
    Alert.alert(
      'A new FCM message arrived!',
      JSON.stringify(remoteMessage, null, 2),
    );
  });

// Register background handler // put it in before appRegistry in index.js
export const registerBackgroundMessageListener = () =>
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log(
      'Message handled in the background!',
      JSON.stringify(remoteMessage, null, 2),
    );
  });
// Register killState handler // put it in before appRegistry in index.js
export const registerKillStateMessageListener = () =>
  messaging().getInitialNotification(async remoteMessage => {
    console.log(
      'Message handled in the Kill state!',
      JSON.stringify(remoteMessage, null, 2),
    );
  });
