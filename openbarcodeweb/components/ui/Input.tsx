import { TextInput, type TextInputProps, StyleSheet, View } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '../ThemedText';

export type ThemedInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
  label?: string;
};

export function Input({ style, lightColor, darkColor, label, ...otherProps }: ThemedInputProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const borderColor = useThemeColor({ light: lightColor, dark: darkColor }, 'border');

  return (
    <View style={styles.container}>
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}
      <TextInput style={[{ color, borderColor }, styles.input, style]} {...otherProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
});
