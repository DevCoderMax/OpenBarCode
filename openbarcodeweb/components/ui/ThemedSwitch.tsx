import { Switch, type SwitchProps, StyleSheet, View } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '../ThemedText';

export type ThemedSwitchProps = SwitchProps & {
  lightColor?: string;
  darkColor?: string;
  label?: string;
};

export function ThemedSwitch({ style, lightColor, darkColor, label, ...otherProps }: ThemedSwitchProps) {
  const thumbColor = useThemeColor({ light: lightColor, dark: darkColor }, 'primary');

  return (
    <View style={styles.container}>
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}
      <Switch
        trackColor={{ false: '#767577', true: '#81b0ff' }}
        thumbColor={thumbColor}
        ios_backgroundColor="#3e3e3e"
        style={style}
        {...otherProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
});
