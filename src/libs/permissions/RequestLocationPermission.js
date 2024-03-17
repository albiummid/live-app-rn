import {PermissionsAndroid} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export default async function requestLocationPermission() {
  try {
    console.log('Requesting Location Permission');
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'This app needs access to your location.',
        buttonPositive: 'OK',
        buttonNegative: 'Cancel',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Location permission granted');
    } else {
      console.log('Location permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
}

const checkLocationPermission = async () => {
  try {
    const fineLocationPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (fineLocationPermission === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    } else {
      const coarseLocationPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      );

      if (coarseLocationPermission === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else {
        const permissionRequest = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (permissionRequest === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else {
          const coarsePermissionRequest = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          );

          if (coarsePermissionRequest === PermissionsAndroid.RESULTS.GRANTED) {
            return true;
          } else {
            return false;
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};

const getCurrentLocation = async () => {
  try {
    const position = await new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          resolve(position);
        },
        error => {
          reject(error);
        },
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
      );
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch (error) {
    throw new Error(`Error getting current location: ${error.message}`);
  }
};
