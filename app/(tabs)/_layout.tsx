import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme, Platform } from 'react-native';

const BLUE = '#0066FF';
const INACTIVE = '#888';

export default function TabLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: BLUE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: isDark ? '#111827' : '#FFFFFF',
          borderTopColor: isDark ? '#1E2A4A' : '#E0E0E0',
          height: Platform.OS === 'ios' ? 85 : 70,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 8,
          elevation: 20,
          shadowColor: BLUE,
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontFamily: 'SpaceMono',
          fontSize: 10,
          letterSpacing: 1,
          textTransform: 'uppercase',
        },
        headerStyle: {
          backgroundColor: isDark ? '#111827' : '#FFFFFF',
          shadowColor: BLUE,
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        },
        headerTitleStyle: {
          fontFamily: 'SpaceMono',
          fontSize: 20,
          fontWeight: '900',
          color: BLUE,
          letterSpacing: 4,
        },
        headerTintColor: BLUE,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'JARVIS',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="actions"
        options={{
          title: 'ACTIONS',
          tabBarLabel: 'Actions',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flash" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'PROJECTS',
          tabBarLabel: 'Projects',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'SETTINGS',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
