import { Pressable, type PressableProps, StyleSheet, Text } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedButtonProps = PressableProps & {
  lightColor?: string;
  darkColor?: string;
  title: string;
};

export function Button({ style, lightColor, darkColor, title, ...rest }: ThemedButtonProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'primary');
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'buttonText');

  return (
    <Pressable
      style={(state) => [
        { backgroundColor },
        styles.button,
        state.pressed && styles.pressed,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    >
      <Text style={[{ color }, styles.text]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    elevation: 3,
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
  },
  pressed: {
    opacity: 0.8,
  },
});
