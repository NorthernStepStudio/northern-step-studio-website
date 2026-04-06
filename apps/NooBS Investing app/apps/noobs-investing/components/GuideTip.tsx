import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { BlurView } from 'expo-blur';
import { AutoTranslate } from './AutoTranslate';

export function GuideTip({ title, content }: { title: string; content: React.ReactNode }) {
    const [visible, setVisible] = useState(false);

    return (
        <AutoTranslate>
        <View>
            <Pressable
                onPress={() => setVisible(true)}
                style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                    backgroundColor: theme.colors.accent + '20',
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    justifyContent: 'center',
                    alignItems: 'center'
                })}
            >
                <MaterialCommunityIcons name="help" size={12} color={theme.colors.accent} />
            </Pressable>

            <Modal
                transparent
                visible={visible}
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <View style={styles.centeredView}>
                    <BlurView intensity={20} style={StyleSheet.absoluteFill} />
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setVisible(false)} />

                    <View style={styles.modalView}>
                        <View style={styles.header}>
                            <View style={styles.iconCircle}>
                                <MaterialCommunityIcons name="school" size={24} color={theme.colors.accent} />
                            </View>
                            <Text style={styles.modalTitle}>{title}</Text>
                        </View>

                        <Text style={styles.modalText}>{content}</Text>

                        <Pressable
                            style={styles.button}
                            onPress={() => setVisible(false)}
                        >
                            <Text style={styles.textStyle}>GOT IT</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
        </AutoTranslate>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 24
    },
    modalView: {
        width: '100%',
        backgroundColor: theme.colors.card,
        borderRadius: 24,
        padding: 24,
        alignItems: 'stretch',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        borderWidth: 1,
        borderColor: theme.colors.border
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.accent + '20',
        justifyContent: 'center',
        alignItems: 'center'
    },
    button: {
        borderRadius: 16,
        padding: 16,
        elevation: 2,
        backgroundColor: theme.colors.accent,
        marginTop: 24
    },
    textStyle: {
        color: theme.colors.buttonText,
        fontWeight: "900",
        textAlign: "center",
        fontSize: 16
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "900",
        color: theme.colors.text
    },
    modalText: {
        marginBottom: 15,
        fontSize: 16,
        lineHeight: 24,
        color: theme.colors.text,
        fontWeight: '500'
    }
});
