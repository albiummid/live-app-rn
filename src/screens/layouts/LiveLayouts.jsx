import React from 'react';
import {Image, StyleSheet, Text, TextInput, View} from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import MatIcon from 'react-native-vector-icons/MaterialCommunityIcons';



function LiveLayouts() {
  return (
    <View style={styles.Container}>
      <View style={styles.contentWrapper}>
        <IonIcon
          style={styles.closeIconWrapper}
          name="close"
          color="#ffffff"
          size={25}
        />
        <View style={styles.Header}>
          <TextInput
            style={styles.goLiveTitle}
            defaultValue=""
            placeholderTextColor="#ffffff"
            placeholder="Add a title to chat"
          />
        </View>

        <View style={styles.userWrapper}>
          <Image
            source={require('../assets/images/userImage.jpg')}
            style={styles.hostBox}></Image>
          <View style={styles.viewerBox}>
            <View style={styles.innerViewerBox}>
              <View style={styles.innerBoxItem}>
                <MatIcon
                  style={styles.closeIconWrapper}
                  name="sofa-outline"
                  color="#f9f9f9"
                  size={18}
                />
              </View>
              <View style={styles.innerBoxItem}>
                <MatIcon
                  style={styles.closeIconWrapper}
                  name="sofa-outline"
                  color="#f9f9f9"
                  size={18}
                />
              </View>
              <View style={styles.innerBoxItem}>
                <MatIcon
                  style={styles.closeIconWrapper}
                  name="sofa-outline"
                  color="#f9f9f9"
                  size={18}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.peopleNumbers}>
          <View style={styles.activePeople}>
            <IonIcon name="people" color={'white'} size={24} />
            <Text style={styles.peopleNumberText}>4</Text>
          </View>
          <View style={styles.peopleNumberWrapper}>
            <IonIcon name="people" color={'white'} size={24} />
            <Text style={styles.peopleNumberText}>6</Text>
          </View>
          <View style={styles.peopleNumberWrapper}>
            <IonIcon name="people" color={'white'} size={24} />
            <Text style={styles.peopleNumberText}>9</Text>
          </View>
          <View style={styles.peopleNumberWrapper}>
            <IonIcon name="people" color={'white'} size={20} />
            <Text style={styles.peopleNumberText}>12</Text>
          </View>
        </View>

        <View style={styles.Footer}>
          <Text style={styles.goLiveBtn}>Go LIVE</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  goLive: {
    // height:'100%',
    padding: 10,
    backgroundColor: 'red',
  },
  Container: {
    height: '100%',
    // padding:5,
    backgroundColor: 'skyblue',
  },
  Header: {
    height: 80,
    backgroundColor: '#00000060',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 10,
  },
  goLiveTitle: {
    width: '80%',
    color: 'white',
    fontSize: 18,
  },
  goLiveBtn: {
    backgroundColor: '#2bc48a',
    width: 150,
    paddingVertical: 10,
    borderRadius: 35,
    textAlign: 'center',
    color: 'white',
    fontWeight: 700,
    marginBottom: 10,
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
  userWrapper: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    marginVertical: 60,
  },
  hostBox: {
    flex: 0.8,
    backgroundColor: 'red',
    height: '100%',
  },
  viewerBox: {
    flex: 0.2,
    backgroundColor: 'green',
  },
  innerViewerBox: {
    display: 'flex',
    flex: 4,
    flexDirection: 'column',
  },
  innerBoxItem: {
    flex: 2,
    height: '100%',
    width: '100%',
    borderColor: '#cccccc',
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    backgroundColor: '#4949ff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIconWrapper: {
    textAlign: 'right',
    paddingRight: 5,
    paddingTop: 5,
  },
  peopleNumberText: {
    color: 'white',
  },
  activePeople: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    height: 30,
    width: 60,
    alignItems: 'center',
    backgroundColor: '#ffffff50',
    borderRadius: 25,
    marginHorizontal: 5,
  },
  peopleNumberWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    height: 30,
    width: 60,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  peopleNumbers: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
});
export default LiveLayouts;
