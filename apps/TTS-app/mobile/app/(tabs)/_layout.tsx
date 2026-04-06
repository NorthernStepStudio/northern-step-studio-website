import { Mic, Library, Info } from 'lucide-react-native';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#00C6FF',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
        tabBarStyle: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.05)',
          height: 85,
          paddingBottom: 25,
        },
        headerStyle: {
          backgroundColor: '#000',
        },
        headerTintColor: '#fff',
        // Disable the static render of the header on web
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Synthesis',
          tabBarIcon: ({ color }) => <Mic color={color} size={28} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <Info
                    size={25}
                    color="#fff"
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => <Library color={color} size={28} />,
        }}
      />
    </Tabs>
  );
}
