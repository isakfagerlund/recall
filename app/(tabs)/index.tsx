import { Text, View } from '@/components/Themed';
import { router } from 'expo-router';
import { createStyles } from '@/theme/styles';
import { Pressable, StyleSheet } from 'react-native';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import InlineAudioRecorder from '@/components/InlineAudioRecorder';

export default function TabOneScreen() {
  return (
    <View style={createStyles.flexCenter}>
      <Text style={createStyles.textTitle}>Home page</Text>
      <Pressable style={styles.button} onPress={() => router.push('/modal')}>
        <Text style={createStyles.buttonText}>Open</Text>
      </Pressable>
      <InlineAudioRecorder />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
});
