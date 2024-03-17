import {View, Text} from 'react-native';
import React from 'react';
import {api, apiOptions} from '../../services/api';
import {getAuth} from '../../libs/appInit';
import {getUserId} from '../../constants/values';
import {getUserWallet} from '../../api/wallet.api';

export default function BeanWalletScreen() {
  const [beanWallet, setBW] = React.useState({});

  React.useEffect(() => {
    getUserWallet().then(res => {
      setBW(res.bean_wallet);
    });
  }, []);
  console.log(beanWallet);
  return (
    <View>
      <Text>Current Beans : {beanWallet?.current_beans ?? 0}</Text>
    </View>
  );
}
