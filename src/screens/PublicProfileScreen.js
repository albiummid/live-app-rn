import {View, Text, Alert} from 'react-native';
import React, {useEffect, useState} from 'react';
import {getUserById} from '../api/user.api';
import {Avatar, Button} from 'react-native-paper';
import useAuth from '../hooks/useAuth';
import {
  checkIsFollowing,
  doFollow,
  doUnFollow,
  getFollowCount,
} from '../api/follow.api';
import {
  doUnfriend,
  getFriendCount,
  getFriendshipStatus,
  sendFriendRequest,
} from '../api/friend.api';

export default function PublicProfileScreen({navigation, route}) {
  const [userDetails, setUserDetails] = useState(null);
  const [loadStates, setLoadStates] = useState({
    friend: false,
    follow: false,
    page: true,
  });
  const {userId} = useAuth();
  const profileUserId = route.params._id;
  const ownProfile = userId === profileUserId;
  const [friendCount, setFriendCount] = useState(0);
  const [followCount, setFollowCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState(
    'Not friend' || 'Pending',
    'Accepted',
  );
  const checkFollowing = () => {
    checkIsFollowing(profileUserId, userId).then(d => {
      setIsFollowing(d);
    });
  };
  const checkFriendship = () => {
    getFriendshipStatus(profileUserId, userId).then(d => {
      if (d == null) {
        setFriendshipStatus('Not friend');
      } else {
        setFriendshipStatus(d.status);
      }
    });
  };

  console.log(friendshipStatus);

  const countFollow = () => {
    getFollowCount(profileUserId).then(d => {
      setFollowCount(d);
      console.log(d);
    });
  };

  const countFriend = () => {
    getFriendCount(profileUserId).then(d => {
      setFriendCount(d);
    });
  };
  useEffect(() => {
    getUserById(route.params._id)
      .then(d => {
        setUserDetails(d);
      })
      .finally(() => setLoadStates(prv => ({...prv, page: false})));

    checkFollowing();
    checkFriendship();
    countFollow();
    countFriend();
  }, []);
  if (loadStates.page) return <Text>LOadIng</Text>;
  return (
    <View className="flex-1 mx-auto p-10 space-y-2">
      <View className="mx-auto">
        <Avatar.Image source={{uri: userDetails.photo}} size={120} />
        <Text className="text-center mt-3 text-lg">{userDetails.name}</Text>
      </View>
      {!ownProfile && (
        <View className="flex-row  mx-auto space-x-2">
          <View>
            {friendshipStatus == 'Accepted' ? (
              <Button
                rippleColor={'white'}
                onPress={() => {
                  Alert.alert(
                    `Unfriend ${userDetails.name}`,
                    'Do you realy want to unfriend this person?',
                    [
                      {
                        text: 'No',
                        style: 'cancel',
                      },
                      {
                        text: 'Yes',
                        onPress: () => {
                          doUnfriend(profileUserId, userId).then(res => {
                            setFriendshipStatus('Not friend');
                            countFriend();
                          });
                        },
                      },
                    ],
                    {
                      cancelable: true,
                      onDismiss: () =>
                        Alert.alert(
                          'This alert was dismissed by tapping outside of the alert dialog.',
                        ),
                    },
                  );
                }}
                loading={loadStates.friend}
                mode="contained">
                Friend
              </Button>
            ) : friendshipStatus == 'Pending' ? (
              <Button
                onPress={() => {
                  console.log('');
                }}
                loading={loadStates.friend}
                mode="contained">
                Request Sent
              </Button>
            ) : (
              <Button
                onPress={() => {
                  sendFriendRequest(userId, profileUserId).then(r => {
                    setFriendshipStatus(r.status);
                  });
                }}
                loading={loadStates.friend}
                mode="contained">
                Send Friend Request
              </Button>
            )}
          </View>

          <View>
            {isFollowing ? (
              <Button
                rippleColor={'white'}
                buttonColor="orange"
                onPress={() => {
                  Alert.alert(
                    'Unfollow',
                    'Do you realy want to unfollow this person?',
                    [
                      {
                        text: 'No',
                        style: 'cancel',
                      },
                      {
                        text: 'Yes',
                        onPress: () => {
                          doUnFollow(profileUserId, userId).then(res => {
                            setIsFollowing(false);
                            countFollow();
                          });
                        },
                      },
                    ],
                    {
                      cancelable: true,
                      onDismiss: () =>
                        Alert.alert(
                          'This alert was dismissed by tapping outside of the alert dialog.',
                        ),
                    },
                  );
                }}
                loading={loadStates.follow}
                mode="contained">
                Following
              </Button>
            ) : (
              <Button
                rippleColor={'white'}
                buttonColor="blue"
                onPress={() => {
                  doFollow(profileUserId, userId).then(res => {
                    setIsFollowing(true);
                    countFollow();
                  });
                }}
                loading={loadStates.follow}
                mode="contained">
                Follow
              </Button>
            )}
          </View>
        </View>
      )}

      <View className="w-1/2 mx-auto flex-row space-x-10 py-5">
        <View className="">
          <Text className="text-lg text-center leading-5 ">{friendCount}</Text>
          <Text className="text-lg">Friends</Text>
        </View>
        <View className="border border-gray-300 h-full " />
        <View className="">
          <Text className="text-lg text-center leading-5 ">{followCount}</Text>
          <Text className="text-lg">Followers</Text>
        </View>
      </View>
    </View>
  );
}
