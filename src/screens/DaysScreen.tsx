import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ListRenderItem } from 'react-native';
import { router } from 'expo-router';

type WorkoutItem = {
  id: string;
  name: string;
};

type DayItem = {
  id: string;
  day: string;
  workouts: WorkoutItem[];
};

const mockData: DayItem[] = [
  { id: '1', day: 'Day 1', workouts: [{ id: '1', name: 'Workout A' }] },
  { id: '2', day: 'Day 2', workouts: [
    { id: '2', name: 'Workout B' },
    { id: '3', name: 'Workout C' },
  ] },
];

const DaysScreen = () => {
  const renderItem: ListRenderItem<DayItem> = ({ item }) => {
    if (item.workouts.length === 1) {
      // Single workout, show directly
      return (
        <TouchableOpacity
          onPress={() => router.push('/workouts')}
        >
          <View className="p-4 border-b border-gray-300">
            <Text className="text-lg font-bold">{item.day}</Text>
            <Text className="text-sm text-gray-500">{item.workouts[0].name}</Text>
          </View>
        </TouchableOpacity>
      );
    } else {
      // Multiple workouts, show as child items
      return (
        <View className="p-4 border-b border-gray-300">
          <Text className="text-lg font-bold">{item.day}</Text>
          {item.workouts.map((workout) => (
            <TouchableOpacity
              key={workout.id}
              onPress={() => router.push('/workouts')}
            >
              <View className="pl-4 py-2">
                <Text className="text-sm text-gray-700">{workout.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      );
    }
  };

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={mockData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
};

export default DaysScreen;