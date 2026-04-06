import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NextStepCard } from '../../components/NextStepCard';
import { computeNextStep, NextStep } from '../../utils/nextStepEngine';
import { Screen } from '../../components/Screen';
import { theme } from '../../constants/theme';
import { useNotifications } from '../../components/NotificationContext';
import { useVelocityNavigate } from '../../hooks/useVelocityNavigate';
import { getUserResidency, ResidencyInfo } from '../../storage/residency';
import Animated, { FadeInDown, useAnimatedStyle, withRepeat, withTiming, useSharedValue } from 'react-native-reanimated';
import { useI18n } from '../../i18n';

const TRUTH_NUDGES = [
  { title: "CORE FOCUS", message: "During your Residency, focus 100% on growth. Yield is a late-game specialization.", type: "INFO" },
  { title: "MARKET NOISE", message: "Don't let the headlines distract you from your Core plan.", type: "INFO" },
  { title: "ELITE TRANSITION", message: "Reached your Freedom Number? It's time to bridge into Income Harvesting.", type: "SUCCESS" },
  { title: "NOOB TAX", message: "Chasing income before you have wealth is the ultimate NooB Tax.", type: "DANGER" },
  { title: "FEE WARNING", message: "High fees steal your future. Keep your Core baseline efficient.", type: "DANGER" },
] as const;

const MARKET_REALITY_CHECKS = [
  "The market is red. Don't check your balance. Go for a walk. Discipline > Panic.",
  "Boring is good. If you're bored, you're investing correctly. Don't mess with it.",
  "Your neighbor's 'hot tip' is garbage. Stick to the plan or prepare to pay the 'NooB Tax'.",
  "Market green today? Resist the urge to feel like a genius. Stay humble, keep buying.",
  "Inflation is eating your cash. Standing still is getting poorer. Keep compounding.",
  "The news is noise designed to make you trade. Ignore the noise. Follow the process.",
  "Risk is what's left after you think you've thought of everything. Expect the unexpected.",
  "Wall Street wants your fees. We want your success. Keep costs low.",
  "A 10% drop is the 'Price of Admission'. Pay it with a smile and buy the sale.",
  "Real wealth takes decades, not days. If you're here to 'get rich quick' by gambling, delete the app. Strategic Income is a specialty, not a shortcut.",
  "Checking your portfolio 10 times a day doesn't make it go up. It just makes you anxious.",
  "The market is a machine that transfers money from the impatient to the patient. Which are you?",
  "If your strategy depends on a single stock 'going to the moon', you don't have a strategy. You have a prayer.",
  "Stop looking for the 'next big thing'. You already missed it. Buy the current boring thing instead.",
  "Wealth is what you don't see. It's the money you didn't spend on a car you can't afford.",
  "Your brain is wired to sabotage your wealth. Recognizing it is half the battle. Controlling it is the other half.",
  "The Elite Specialization path is for harvesting wealth, not making it. If you're still building, stay in the Core Residency.",
  "Investing is 10% math and 90% not being an emotional wreck."
];

const USELESS_TIPS = [
  "Drink water. It's cheaper than juice and you're already broke.",
  "Looking both ways before crossing the road is a better investment than most crypto.",
  "Don't eat yellow snow. It's free, but the ROI is terrible.",
  "Charging your phone overnight is a good habit. Unlike day trading.",
  "If you're reading this, you're not making money. Put the phone down.",
  "Tying your shoelaces prevents 100% of trips. Can't say the same for your stock picks.",
  "A 7-minute workout is better than a 7-minute panic about the S&P 500.",
  "Blinking keeps your eyes moist. Useful for when you're staring at a red chart.",
  "Success is 1% inspiration and 99% not being a NooB.",
  "Sleep is free. Use it to avoid making late-night impulse trades.",
  "Eating at home is a 100% gain over eating out. Plus, nobody sees you crying.",
  "A clean room is free dopamine. Much safer than leverage.",
  "Sunscreen protects your skin. Reading the manual protects your Wallet. Use both.",
  "If you find a penny, pick it up. That's a better return than your last meme stock.",
  "Flossing takes 2 minutes. Panic-checking your P/L takes 2 hours. Guess which one helps your health?",
  "Walking to the store is free exercise. Driving is burning money.",
  "Don't touch hot stoves. Don't touch 'hot' stocks. Both will burn you.",
  "Rain is just clouds crying. Red days are just NooBS crying. Stay dry.",
  "A library card is infinite knowledge for zero dollars. Use it before you buy a 'course' from a teenager.",
  "Chewing your food 20 times helps digestion. Thinking 20 times helps your portfolio.",
  "Oxygen is free. Taking a deep breath before hitting 'Buy' is also free. Highly recommended.",
  "A 5-year-old doesn't care about the S&P 500. Be more like a 5-year-old today.",
  "Brushing your teeth twice a day is compound interest for your smile. Don't default on it.",
  "The sun will rise regardless of your account balance. Relax.",
  "Reading the ingredients is good for your gut. Reading the fine print is good for your bank account.",
  "If you can't find your keys, look in the last place you'd expect. If you can't find your money, look at your trading history.",
  "Gravity works 100% of the time. The market works 50% of the time. Trust gravity.",
  "A cold shower is a great way to wake up. A margin call is a better one. Avoid both.",
  "Buying a coffee everyday is $1,500 a year. That's a lot of VTI. Drink the office sludge.",
  "If you're bored, read a book. If you're greedy, read a history book.",
  "Trees take years to grow. Your wealth takes decades. Stop shouting at the sapling.",
  "The best time to plant a tree was 20 years ago. The best time to stop being a NooB is right now.",
  "A used car gets you to the same place as a new one. One just comes with a crushing soul-debt.",
  "Don't stare at the sun. Don't stare at 1-minute charts. Both cause permanent damage.",
  "Losing your remote is annoying. Losing your life savings because of a tweet is worse.",
  "A healthy breakfast is a great start. A solid emergency fund is a better finish.",
  "Wear socks with sandals if you want, but never trade with your heart. One is a fashion crime, the other is financial.",
  "If a 'pro' is yelling on TV, he's probably selling something. Mute the TV. Buy index funds.",
  "Patience is a virtue. It's also the only way you'll ever get rich. Funny how that works.",
  "You can't buy happiness, but you can buy freedom. Freedom is just boring wealth with a better name."
];


import { NoobsLogo } from '../../components/NoobsLogo';

export default function Home() {
  const router = useRouter();
  const { screenRef, navigate } = useVelocityNavigate();
  const { tr } = useI18n();
  const { showNudge, history } = useNotifications();
  const [nextStep, setNextStep] = useState<NextStep | null>(null);
  const [realityCheck, setRealityCheck] = useState<string>(MARKET_REALITY_CHECKS[0]);
  const [uselessTip, setUselessTip] = useState<string | null>(null);
  const [shownTipIndices, setShownTipIndices] = useState<number[]>([]);
  const [residency, setResidency] = useState<ResidencyInfo | null>(null);

  const showUselessTip = () => {
    // If all tips shown, reset the pool
    let pool = USELESS_TIPS.map((_, i) => i).filter(i => !shownTipIndices.includes(i));
    if (pool.length === 0) {
      pool = USELESS_TIPS.map((_, i) => i);
      setShownTipIndices([]);
    }

    const randomIndex = pool[Math.floor(Math.random() * pool.length)];
    setUselessTip(USELESS_TIPS[randomIndex]);
    setShownTipIndices(prev => [...prev, randomIndex]);
  };

  const load = useCallback(() => {
    computeNextStep().then(step => setNextStep(step)).catch(console.error);
    getUserResidency().then(setResidency).catch(console.error);

    // Rotate Market Reality
    const newReality = MARKET_REALITY_CHECKS[Math.floor(Math.random() * MARKET_REALITY_CHECKS.length)];
    setRealityCheck(newReality);

    // Trigger random truth nudge (25% chance to show on home land)
    if (Math.random() > 0.75) {
      const randomNudge = TRUTH_NUDGES[Math.floor(Math.random() * TRUTH_NUDGES.length)];
      showNudge({
        ...randomNudge,
        type: randomNudge.type as any
      });
    }
  }, [showNudge]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Auto-rotate Market Reality tips every 15 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      const newReality = MARKET_REALITY_CHECKS[Math.floor(Math.random() * MARKET_REALITY_CHECKS.length)];
      setRealityCheck(newReality);
    }, 15000); // 15 seconds for snappier feedback

    return () => clearInterval(interval);
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withRepeat(withTiming(1.02, { duration: 2000 }), -1, true) }],
    shadowColor: nextStep?.kind === 'stability' ? theme.colors.danger : theme.colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: withRepeat(withTiming(0.3, { duration: 2000 }), -1, true),
    shadowRadius: 15,
  }));

  return (

    <Screen
      ref={screenRef}
      safeTop={true}
      headerLeft={
        <View style={{ width: 250, marginLeft: -10, marginTop: -6 }}>
          <Image
            source={require('../../assets/branding/noobs_logo_provided.png')}
            style={{ width: 250, height: 105, resizeMode: 'cover' }}
          />
          <View style={{ width: 250, flexDirection: 'row', justifyContent: 'space-between', marginTop: -20 }}>
            {['INVESTING', 'FOR', 'REAL', 'PEOPLE.'].map((word, i) => (
              <Text key={i} style={{ color: theme.colors.accent, fontSize: 15, fontWeight: '900' }}>{word}</Text>
            ))}
          </View>
        </View>
      }
    >
      <View style={{ height: 16 }} />
      {residency && (
        <Pressable
          onPress={() => navigate('/(tabs)/discovery')}
          style={{
            backgroundColor: residency.color + '20',
            padding: 12,
            borderRadius: 20,
            borderWidth: 1.5,
            borderColor: residency.color,
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 80
          }}
        >
          <MaterialCommunityIcons name={residency.icon} size={24} color={residency.color} />
          <Text style={{ color: residency.color, fontSize: 9, fontWeight: '900', marginTop: 4, textTransform: 'uppercase' }}>{residency.name.split(' ')[0]}</Text>
        </Pressable>
      )}

      {/* Residency Progress HUD */}
      {
        residency && residency.nextStageThreshold && (
          <Pressable
            onPress={() => navigate('/(tabs)/discovery')}
            style={{
              backgroundColor: theme.colors.card,
              padding: 18,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: theme.colors.border,
              marginBottom: 32,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 2
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View>
                <Text style={{ color: theme.colors.faint, fontSize: 10, fontWeight: '900', letterSpacing: 1 }}>{tr("PATH PROGRESS")}</Text>
                <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '900' }}>{tr("To")} {residency.stage === 'NOOB_GROUND' ? tr('Core Residency') : tr('Income Harvesting')}</Text>
              </View>
              <Text style={{ color: theme.colors.accent, fontSize: 18, fontWeight: '900' }}>{Math.round((residency.progressToNext || 0) * 100)}%</Text>
            </View>
            <View style={{ height: 8, backgroundColor: theme.colors.bg, borderRadius: 4, overflow: 'hidden' }}>
              <View style={{ height: '100%', width: `${(residency.progressToNext || 0) * 100}%`, backgroundColor: residency.color }} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 }}>
              <MaterialCommunityIcons name="shield-check-outline" size={14} color={residency.color} />
              <Text style={{ color: theme.colors.muted, fontSize: 11, fontWeight: '700' }}>{tr("Requirement:")} {residency.criteria.split('.')[0]}</Text>
            </View>
          </Pressable>
        )
      }

      <View style={{
        backgroundColor: theme.colors.card,
        padding: 24,
        borderRadius: theme.radius.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 32
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <View style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: theme.colors.accent,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <MaterialCommunityIcons name="lightning-bolt" size={20} color={theme.colors.buttonText} />
          </View>
          <Text style={{ color: theme.colors.text, fontWeight: '900', fontSize: 22 }}>{tr("Mission")}</Text>
        </View>
        <Text style={{ color: theme.colors.muted, fontSize: 17, lineHeight: 26, fontWeight: '700' }}>
          {tr("Discipline beats intelligence. Stop checking prices. Follow the path. Build boring wealth.")}
        </Text>
      </View>

      <View style={{ marginBottom: 32 }}>
        <Text style={{ color: theme.colors.text, fontWeight: '900', fontSize: 22, marginBottom: 16 }}>{tr("Current Focus")}</Text>
        {nextStep ? (
          <Animated.View
            entering={FadeInDown.delay(200)}
            style={pulseStyle}
          >

            <NextStepCard
              step={nextStep}
              onPress={() => navigate(nextStep.route)}
            />
          </Animated.View>
        ) : (

          <View style={{ padding: 32, borderRadius: theme.radius.card, backgroundColor: theme.colors.card, borderStyle: 'dashed', borderWidth: 1, borderColor: theme.colors.border }}>
            <Text style={{ color: theme.colors.muted, textAlign: 'center', fontWeight: '600' }}>{tr("Calculating next move...")}</Text>
          </View>
        )}
      </View>

      <View style={{
        padding: 24,
        borderRadius: theme.radius.card,
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 32
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <MaterialCommunityIcons name="eye-outline" size={16} color={theme.colors.accent} />
          <Text style={{ color: theme.colors.accent, fontWeight: "900", textTransform: 'uppercase', fontSize: 13 }}>
            {tr("Market Reality")}
          </Text>
        </View>
        <Text style={{ color: theme.colors.text, fontSize: 17, lineHeight: 26, fontWeight: '700', fontStyle: 'italic' }}>
          "{realityCheck}"
        </Text>
      </View>

      <View style={{
        padding: 24,
        borderRadius: theme.radius.card,
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 32
      }}>
        <Text style={{ color: theme.colors.accent, fontWeight: "900", textTransform: 'uppercase', fontSize: 13, marginBottom: 8 }}>
          {tr("The NooBS Way")}
        </Text>
        <Text style={{ color: theme.colors.text, fontSize: 16, lineHeight: 22 }}>
          {tr('We do not do "hot tips." We do ')}<Text style={{ fontWeight: '900' }}>{tr("Process.")}</Text>{tr(" Learn the rules, set your plan, practice with paper money, and then execute for real. It is boring. It is slow. It works.")}
        </Text>
      </View>

      <View style={{ marginBottom: 32 }}>
        <Text style={{ color: theme.colors.text, fontWeight: '900', fontSize: 22, marginBottom: 16 }}>{tr("The Path")}</Text>

        <View style={{ gap: 12 }}>
          <Pressable
            onPress={() => {
              console.log("[DEBUG] Learn button pressed");
              navigate('/(tabs)/learn');
            }}
            style={({ pressed }) => ({
              flexDirection: 'row',
              padding: 20,
              borderRadius: 24,
              backgroundColor: theme.colors.softCard,
              alignItems: 'center',
              gap: 16,
              borderWidth: 1,
              borderColor: theme.colors.border,
              opacity: pressed ? 0.8 : 1
            })}
          >
            <MaterialCommunityIcons name="book-open-variant" size={28} color={theme.colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 18 }}>{tr("Learn")}</Text>
              <Text style={{ color: theme.colors.muted, fontSize: 14, fontWeight: '600' }}>{tr("Build your brain power.")}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.muted} />
          </Pressable>

          <Pressable
            onPress={() => navigate('/(tabs)/plan')}
            style={({ pressed }) => ({
              flexDirection: 'row',
              padding: 20,
              borderRadius: 24,
              backgroundColor: theme.colors.softCard,
              alignItems: 'center',
              gap: 16,
              borderWidth: 1,
              borderColor: theme.colors.border,
              opacity: pressed ? 0.8 : 1
            })}
          >
            <MaterialCommunityIcons name="calendar-check" size={28} color={theme.colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 18 }}>{tr("Plan")}</Text>
              <Text style={{ color: theme.colors.muted, fontSize: 14, fontWeight: '600' }}>{tr("Automate your strategy.")}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.muted} />
          </Pressable>

          <Pressable
            onPress={() => navigate('/(tabs)/portfolio')}
            style={({ pressed }) => ({
              flexDirection: 'row',
              padding: 20,
              borderRadius: 24,
              backgroundColor: theme.colors.softCard,
              alignItems: 'center',
              gap: 16,
              borderWidth: 1,
              borderColor: theme.colors.border,
              opacity: pressed ? 0.8 : 1
            })}
          >
            <MaterialCommunityIcons name="chart-box" size={28} color={theme.colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 18 }}>{tr("Portfolio")}</Text>
              <Text style={{ color: theme.colors.muted, fontSize: 14, fontWeight: '600' }}>{tr("Track your empire.")}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.muted} />
          </Pressable>

          <Pressable
            onPress={() => navigate('/glossary')}
            style={({ pressed }) => ({
              flexDirection: 'row',
              padding: 20,
              borderRadius: 24,
              backgroundColor: theme.colors.softCard,
              alignItems: 'center',
              gap: 16,
              borderWidth: 1,
              borderColor: theme.colors.border,
              opacity: pressed ? 0.8 : 1
            })}
          >
            <MaterialCommunityIcons name="book-alphabet" size={28} color={theme.colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 18 }}>{tr("Encyclopedia")}</Text>
              <Text style={{ color: theme.colors.muted, fontSize: 14, fontWeight: '600' }}>{tr("Translate the jargon.")}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.muted} />
          </Pressable>
        </View>
      </View>

      <View style={{
        padding: 24,
        borderRadius: 24,
        backgroundColor: theme.colors.accent + '10',
        borderWidth: 1,
        borderColor: theme.colors.accent + '20',
        alignItems: 'center',
        marginBottom: 32
      }}>
        <Text style={{ color: theme.colors.accent, fontSize: 14, fontWeight: '700', textAlign: 'center', fontStyle: 'italic', lineHeight: 20, marginBottom: 12 }}>
          "The investor’s chief problem—and even his worst enemy—is likely to be himself."
        </Text>

        <Pressable
          onPress={showUselessTip}
          style={({ pressed }) => ({
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 12,
            backgroundColor: theme.colors.accent,
            opacity: pressed ? 0.8 : 1
          })}
        >
          <Text style={{ color: theme.colors.buttonText, fontWeight: '900', fontSize: 13 }}>GIVE ME A TIP</Text>
        </Pressable>

        {uselessTip && (
          <View style={{ marginTop: 16, padding: 12, backgroundColor: theme.colors.card, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
            <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '600', textAlign: 'center' }}>
              💡 {uselessTip}
            </Text>
          </View>
        )}
      </View>

      <View style={{ marginTop: 24, padding: 20, borderRadius: 20, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border }}>
        <Text style={{ color: theme.colors.muted, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 }}>{tr("Educational Disclaimer")}</Text>
        <Text style={{ color: theme.colors.muted, fontSize: 13, lineHeight: 18, fontWeight: '600' }}>
          {tr("NooBS Investing is an educational simulation. No real money is involved. This is not professional financial advice.")}
        </Text>
      </View>

      <View style={{ height: 40 }} />

    </Screen >
  );
}
