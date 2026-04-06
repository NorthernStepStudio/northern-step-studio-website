import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';
import { emitScrollToTop } from '../../utils/scrollEvents';
import { useI18n } from '../../i18n';

const TABS = [
  { name: 'index', titleKey: 'tabs.home' as const, icon: 'home-variant' as const },
  { name: 'learn', titleKey: 'tabs.learn' as const, icon: 'book-open-variant' as const },
  { name: 'plan', titleKey: 'tabs.plan' as const, icon: 'calendar-check' as const },
  { name: 'portfolio', titleKey: 'tabs.portfolio' as const, icon: 'chart-line-variant' as const },
  { name: 'discovery', titleKey: 'tabs.discovery' as const, icon: 'earth' as const },
];

// Custom tab bar with scroll-to-top before navigation
function ScrollToTopTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

  const handleTabPress = (routeName: string, isFocused: boolean) => {
    if (!isFocused) {
      // Emit global scroll-to-top event
      emitScrollToTop();

      // Emit navigation event
      navigation.emit({
        type: 'tabPress',
        target: routeName,
        canPreventDefault: true,
      });

      // Delay navigation to let scroll animation complete
      setTimeout(() => {
        navigation.navigate(routeName);
      }, 200);
    }
  };

  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: theme.colors.bg,
      borderTopWidth: 1,
      borderTopColor: '#1C1C1E',
      paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
      paddingTop: 8,
      height: 70 + (insets.bottom > 0 ? insets.bottom - 12 : 0),
    }}>
      {state.routes.map((route: any, index: number) => {
        const tab = TABS.find(t => t.name === route.name);
        if (!tab) return null;

        const isFocused = state.index === index;
        const color = isFocused ? theme.colors.accent : theme.colors.faint;

        return (
          <Pressable
            key={route.key}
            onPress={() => handleTabPress(route.name, isFocused)}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <MaterialCommunityIcons name={tab.icon} size={30} color={color} />
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              style={{
                color,
                fontWeight: '900',
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: -0.1
              }}
            >
              {t(tab.titleKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <ScrollToTopTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="learn" />
      <Tabs.Screen name="plan" />
      <Tabs.Screen name="portfolio" />
      <Tabs.Screen name="discovery" />
    </Tabs>
  );
}
