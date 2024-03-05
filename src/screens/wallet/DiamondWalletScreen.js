import {View, Text} from 'react-native';
import React from 'react';
import {api, apiOptions} from '../../services/api';
import {getAuth} from '../../libs/appInit';
import {getUserWallet} from '../../api/wallet.api';

export default function DiamondWalletScreen() {
  const [diamondWallet, setDW] = React.useState({});

  React.useEffect(() => {
    getUserWallet().then(res => {
      setDW(res.diamond_wallet);
    });
  }, []);
  console.log(diamondWallet);
  return (
    <View>
      <Text>Current Diamonds:{diamondWallet.current_diamonds ?? 0}</Text>
      <Text>
        Current VIP Diamonds:{diamondWallet.current_vip_diamonds ?? 0}
      </Text>
    </View>
  );
}
