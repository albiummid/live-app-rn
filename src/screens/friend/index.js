import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import FriendListScreen from './FriendList';
import FriendRequestsScreen from './FriendRequests';

export default function WalletScreen() {
  const TopTab = createMaterialTopTabNavigator();

  return (
    <TopTab.Navigator>
      <TopTab.Screen name="Friend List" component={FriendListScreen} />
      <TopTab.Screen name="Requests" component={FriendRequestsScreen} />
    </TopTab.Navigator>
  );
}
