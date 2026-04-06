import React from 'react';
import { StyleSheet, View, Text, useWindowDimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, runOnJS } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export const EmotionPad = ({
    onUpdate,
    onGestureStart,
    onGestureEnd,
    initialValence = 0,
    initialArousal = 0
}: {
    onUpdate: (v: number, a: number) => void,
    onGestureStart?: () => void,
    onGestureEnd?: () => void,
    initialValence?: number,
    initialArousal?: number
}) => {
    const { width } = useWindowDimensions();
    const PAD_SIZE = width - 130;
    const safePadSize = Math.max(1, PAD_SIZE);

    const x = useSharedValue(((initialValence + 1) / 2) * safePadSize);
    const y = useSharedValue((1 - (initialArousal + 1) / 2) * safePadSize);
    const isActive = useSharedValue(false);

    React.useEffect(() => {
        if (!isActive.value) {
            const nextX = ((initialValence + 1) / 2) * safePadSize;
            const nextY = (1 - (initialArousal + 1) / 2) * safePadSize;
            if (!isNaN(nextX)) x.value = nextX;
            if (!isNaN(nextY)) y.value = nextY;
        }
    }, [initialValence, initialArousal, safePadSize]);

    const contextX = useSharedValue(0);
    const contextY = useSharedValue(0);

    const gesture = Gesture.Pan()
        .onStart(() => {
            isActive.value = true;
            if (onGestureStart) runOnJS(onGestureStart)();
            contextX.value = x.value;
            contextY.value = y.value;
        })
        .onUpdate((event) => {
            const nextX = Math.min(Math.max(0, event.translationX + contextX.value), safePadSize);
            const nextY = Math.min(Math.max(0, event.translationY + contextY.value), safePadSize);

            if (!isNaN(nextX)) x.value = nextX;
            if (!isNaN(nextY)) y.value = nextY;

            const valence = ((x.value / safePadSize) * 2 - 1).toFixed(2);
            const arousal = (1 - (y.value / safePadSize) * 2).toFixed(2);
            runOnJS(onUpdate)(parseFloat(valence), parseFloat(arousal));
        })
        .onEnd(() => {
            isActive.value = false;
            if (onGestureEnd) runOnJS(onGestureEnd)();
        });

    const cursorStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: isNaN(x.value) ? safePadSize / 2 - 17 : x.value - 17 },
            { translateY: isNaN(y.value) ? safePadSize / 2 - 17 : y.value - 17 }
        ],
    }));

    return (
        <View style={styles.container}>
            <GestureDetector gesture={gesture}>
                <Animated.View style={[styles.pad, { width: PAD_SIZE, height: PAD_SIZE }]}>
                    <View style={[styles.axisX, { top: PAD_SIZE / 2 }]} />
                    <View style={[styles.axisY, { left: PAD_SIZE / 2 }]} />

                    <Text style={[styles.label, styles.labelTop]}>AROUSAL</Text>
                    <Text style={[styles.label, styles.labelBottom]}>CALM</Text>
                    <Text style={[styles.label, styles.labelRight]}>POSITIVE</Text>
                    <Text style={[styles.label, styles.labelLeft]}>NEGATIVE</Text>

                    <Animated.View style={[styles.cursorContainer, cursorStyle]}>
                        <LinearGradient
                            colors={['#00C6FF', '#0072ff']}
                            style={styles.cursor}
                        />
                    </Animated.View>
                </Animated.View>
            </GestureDetector>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: 10,
    },
    pad: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
    },
    cursorContainer: {
        position: 'absolute',
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#00C6FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
        elevation: 15,
    },
    cursor: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#fff',
    },
    axisX: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    axisY: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    label: {
        position: 'absolute',
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    labelTop: { top: 15, alignSelf: 'center' },
    labelBottom: { bottom: 15, alignSelf: 'center' },
    labelRight: { right: 15, top: '50%', transform: [{ translateY: -5 }] },
    labelLeft: { left: 15, top: '50%', transform: [{ translateY: -5 }] },
});
