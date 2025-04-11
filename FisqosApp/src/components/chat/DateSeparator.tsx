import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

interface DateSeparatorProps {
  date: string;
}

const DateSeparator: React.FC<DateSeparatorProps> = ({ date }) => {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.text}>{date}</Text>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  text: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 10,
  },
});

export default DateSeparator;
