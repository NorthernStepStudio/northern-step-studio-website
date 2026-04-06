import { View, Text, Pressable } from 'react-native';
import { theme } from '../constants/theme';
import { useI18n } from '../i18n';

export default function LessonCard(props: {
    title: string;
    completed: boolean;
    onPress: () => void;
}) {
    const { tr } = useI18n();

    return (
        <Pressable onPress={props.onPress}>
            <View
                style={{
                    padding: 16,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.card,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600', flex: 1 }}>
                    {tr(props.title)}
                </Text>
                <Text style={{ color: props.completed ? theme.colors.success : theme.colors.muted, fontSize: 14, fontWeight: 'bold' }}>
                    {props.completed ? tr('DONE') : '->'}
                </Text>
            </View>
        </Pressable>
    );
}
