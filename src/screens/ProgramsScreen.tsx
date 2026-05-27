import React from 'react';
import { View, Text, Button } from 'react-native';
import { router } from 'expo-router';

const ProgramsScreen = () => {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-bold">Programs</Text>
      <Button title="Go to Days" onPress={() => router.push('/days')} />
    </View>
  );
};

export default ProgramsScreen;