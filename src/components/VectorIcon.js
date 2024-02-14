// For CLI App
import {Image, TouchableOpacity} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Foundation from 'react-native-vector-icons/Foundation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

// FOR EXPO APP
// import AntDesign from "@expo/vector-icons/AntDesign";
// import Entypo from "@expo/vector-icons/Entypo";
// import EvilIcons from "@expo/vector-icons/EvilIcons";
// import Feather from "@expo/vector-icons/Feather";
// import FontAwesome from "@expo/vector-icons/FontAwesome";
// import Foundation from "@expo/vector-icons/Foundation";
// import Ionicons from "@expo/vector-icons/Ionicons";
// import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
// import MaterialIcons from "@expo/vector-icons/MaterialIcons";
// import Octicons from "@expo/vector-icons/Octicons";
// import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";

export const Icons = {
  MaterialCommunityIcons,
  MaterialIcons,
  Ionicons,
  Feather,
  FontAwesome,
  AntDesign,
  Entypo,
  SimpleLineIcons,
  Octicons,
  Foundation,
  EvilIcons,
};

const Icon = ({
  type,
  name,
  color,
  size = 24,
  style = {},
  source,
  onPress = () => {},
  disabled,
  ...rest
}) => {
  const fontSize = 24;
  const Tag = type;
  return (
    <TouchableOpacity disabled={disabled} onPress={onPress} {...rest}>
      <>
        {source ? (
          <Image source={source} style={[{height: size, width: size}, style]} />
        ) : (
          <>
            {type && name && (
              <Tag
                name={name}
                size={size || fontSize}
                color={color}
                style={[style]}
              />
            )}
          </>
        )}
      </>
    </TouchableOpacity>
  );
};

export default Icon;
