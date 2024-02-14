import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';

export default function Button({children}) {
  return (
    <TouchableOpacity>
      <Text>{children}</Text>
    </TouchableOpacity>
  );
}
