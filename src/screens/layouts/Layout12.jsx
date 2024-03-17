import { Text, View, StyleSheet, ImageBackground, TextInput, Image, ScrollView } from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import MatIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import React, { Component } from 'react';



function Layout12() {
    return (
        <View style={styles.Container}>
            
            <View style={styles.contentWrapper}>
                <IonIcon style={styles.closeIconWrapper} name="close" color="#ffffff" size={25} />
                <View style={styles.Header}>
                    <TextInput style={styles.goLiveTitle} defaultValue='' placeholderTextColor="#ffffff" placeholder='Add a title to chat'/>                  
                    
                </View>

                <View style={styles.userWrapper}>
                        <View style={styles.userItem2}>
                            <View style={styles.userItem2InnerWrapper}>
                                <Image source={require('../../assets/images/userImage.jpg')} style={styles.userItem2Inner1Image}>
                                </Image>
                                <View style={styles.userItem2Inner2}>
                                <MatIcon style={styles.closeIconWrapper} name="sofa-outline" color="#f9f9f9" size={18} />
                                </View>
                                <View style={styles.userItem2Inner3}>
                                <MatIcon style={styles.closeIconWrapper} name="sofa-outline" color="#f9f9f9" size={18} />
                                </View>
                                <View style={styles.userItem2Inner4}>
                                <MatIcon style={styles.closeIconWrapper} name="sofa-outline" color="#f9f9f9" size={18} />
                                </View>
                            </View>
                        </View>
                        <View style={styles.userItem2}>
                            <View style={styles.userItem2InnerWrapper}>
                            <View style={styles.userItem2Inner2}>
                                <MatIcon style={styles.closeIconWrapper} name="sofa-outline" color="#f9f9f9" size={18} />
                                </View>
                                <View style={styles.userItem2Inner2}>
                                <MatIcon style={styles.closeIconWrapper} name="sofa-outline" color="#f9f9f9" size={18} />
                                </View>
                                <View style={styles.userItem2Inner3}>
                                <MatIcon style={styles.closeIconWrapper} name="sofa-outline" color="#f9f9f9" size={18} />
                                </View>
                                <View style={styles.userItem2Inner4}>
                                <MatIcon style={styles.closeIconWrapper} name="sofa-outline" color="#f9f9f9" size={18} />
                                </View>
                            </View>
                        </View>
                        <View style={styles.userItem2}>
                            <View style={styles.userItem2InnerWrapper}>
                                <View style={styles.userItem2Inner1}>
                                <MatIcon style={styles.closeIconWrapper} name="sofa-outline" color="#f9f9f9" size={18} />
                                </View>
                                <View style={styles.userItem2Inner2}>
                                <MatIcon style={styles.closeIconWrapper} name="sofa-outline" color="#f9f9f9" size={18} />
                                </View>
                                <View style={styles.userItem2Inner3}>
                                <MatIcon style={styles.closeIconWrapper} name="sofa-outline" color="#f9f9f9" size={18} />
                                </View>
                                <View style={styles.userItem2Inner4}>
                                <MatIcon style={styles.closeIconWrapper} name="sofa-outline" color="#f9f9f9" size={18} />
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.peopleNumbers}>
                        <View style={styles.peopleNumberWrapper}><IonIcon name='people' color={'white'} size={24}/><Text style={styles.peopleNumberText}>4</Text></View>
                        <View style={styles.peopleNumberWrapper}><IonIcon name='people' color={'white'} size={24}/><Text style={styles.peopleNumberText}>6</Text></View>
                        <View style={styles.peopleNumberWrapper}><IonIcon name='people' color={'white'} size={24}/><Text style={styles.peopleNumberText}>9</Text></View>
                        <View style={styles.activePeople}><IonIcon name='people' color={'white'} size={20}/><Text style={styles.peopleNumberText}>12</Text></View>
                    </View>

                <View style={styles.Footer}>
                    <Text style={styles.goLiveBtn}>Go LIVE</Text>
                </View>
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    goLive: {
        // height:'100%',
        padding:10,
        backgroundColor:'red'
    },
    Container:{
        height:'100%',
        // padding:5,
        backgroundColor:'skyblue'
    },
    Header:{
        height:80,
        backgroundColor:'#00000060',
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        borderRadius:12,
        marginHorizontal:10
    },
    goLiveTitle:{
        width:'80%',
        color:'white',
        fontSize:18,
    },
    goLiveBtn:{
        backgroundColor:'#2bc48a',
        width:150,
        paddingVertical:10,
        borderRadius:35,
        textAlign:'center',
        color:'white',
        fontWeight:700,
        marginBottom:10
    },
    Footer:{
        display:'flex',
        justifyContent:'center',
        width:'100%',
        flexDirection:'row',
    },
    contentWrapper:{
        display:'flex',
        flexDirection:'column',
        justifyContent: 'space-between',
        height:'100%'
    },
    userWrapper:{
        display:'flex',
        flex:12,
        flexDirection:'column',
        backgroundColor:'red',
        marginVertical:20
    },
    userItem1:{
        flex:8,
        backgroundColor:'green'
    },
    userItem2:{
        flex:4,
    },
   
    closeIconWrapper:{
        textAlign:'right',
        paddingRight:5,
        paddingTop:5
    },
    userItem2InnerWrapper:{
        display:'flex',
        flexDirection:'row',
        flex:12,
    },
    userItem2Inner1:{
        flex:4,
        backgroundColor:'#4949ff',
        justifyContent:'center',
        alignItems:'center',
        borderRightColor:'#cccccc',
        borderRightWidth:1,
        borderTopColor:'#cccccc',
        borderTopWidth:1,
        height:'100%'
    },
    userItem2Inner1Image:{
        flex:4,
        backgroundColor:'#4949ff',
        justifyContent:'center',
        alignItems:'center',
        borderTopColor:'#cccccc',
        borderTopWidth:1,
        height:'100%'
    },
    userItem2Inner2:{
        flex:4,
        backgroundColor:'#4949ff',
        justifyContent:'center',
        alignItems:'center',
        borderRightColor:'#cccccc',
        borderRightWidth:1,
        borderTopColor:'#cccccc',
        borderTopWidth:1,
    },
    userItem2Inner3:{
        flex:4,
        backgroundColor:'#4949ff',
        justifyContent:'center',
        alignItems:'center',
        borderTopColor:'#cccccc',
        borderTopWidth:1
    },
    userItem2Inner4:{
        flex:4,
        backgroundColor:'#4949ff',
        justifyContent:'center',
        alignItems:'center',
        borderLeftColor:'#cccccc',
        borderLeftWidth:1,
        borderTopColor:'#cccccc',
        borderTopWidth:1,
    },
    userItem1InnerWrapper:{
        display:'flex',
        flex:12,
        flexDirection:'row',
        backgroundColor:'yellow'
    },
    userItem1Inner1:{
        flex:8,
        backgroundColor:'red',
        height:'100%',
    },
    userItem1Inner2:{
        flex:4,
        backgroundColor:'gray',
    },
    userItem1Inner2Wrapper:{
        display:'flex',
        flexDirection:'column',
        flex:12,
    },
    userItem1Inner2WrapperItem1:{
        flex:6,
        backgroundColor:'#4949ff',
        justifyContent:'center',
        alignItems:'center',
        borderBottomColor:'#cccccc',
        borderBottomWidth:1,
        borderLeftColor:'#cccccc',
        borderLeftWidth:1
    },
    userItem1Inner2WrapperItem2:{
        flex:6,
        backgroundColor:'#4949ff',
        justifyContent:'center',
        alignItems:'center',
        borderLeftColor:'#cccccc',
        borderLeftWidth:1
    },
    peopleNumberText:{
        color:'white'
    },
    activePeople:{
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-evenly',
        height:30,
        width:60,
        alignItems:'center',
        backgroundColor:'#ffffff50',
        borderRadius:25,
        marginHorizontal:5,
    },
    peopleNumberWrapper:{
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-evenly',
        height:30,
        width:60,
        alignItems:'center',
        marginHorizontal:2,
    },
    peopleNumbers:{
        display:'flex',
        justifyContent:'center',
        flexDirection:'row',
        marginBottom:8
    }

})
export default Layout12