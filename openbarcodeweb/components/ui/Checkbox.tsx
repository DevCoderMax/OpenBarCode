import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';

export type CheckboxOption = {
  label: string;
  value: string;
};

interface CheckboxProps {
  label: string;
  value: boolean;
  onValueChange: (newValue: boolean) => void;
}

export const Checkbox = ({ label, value, onValueChange }: CheckboxProps) => {
  const color = useThemeColor({ light: '#000', dark: '#fff' }, 'text');
  const checkboxBaseColor = useThemeColor({ light: '#ccc', dark: '#555' }, 'icon');
  const checkboxCheckedColor = useThemeColor({ light: '#007AFF', dark: '#0A84FF' }, 'tint');

  return (
    <TouchableOpacity style={styles.checkboxContainer} onPress={() => onValueChange(!value)} activeOpacity={0.7}>
      <View style={[styles.checkbox, { borderColor: value ? checkboxCheckedColor : checkboxBaseColor }, value && { backgroundColor: checkboxCheckedColor }]}>
        {value && <Ionicons name="checkmark" size={16} color="#fff" />}
      </View>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
};

interface CheckboxGroupProps {
  options: CheckboxOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  label?: string;
}

export const CheckboxGroup = ({ options, selectedValue, onValueChange, label }: CheckboxGroupProps) => {
  const color = useThemeColor({ light: '#000', dark: '#fff' }, 'text');

  return (
    <View style={styles.groupContainer}>
      {label && <Text style={[styles.groupLabel, { color }]}>{label}</Text>}
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={styles.optionButton}
            onPress={() => onValueChange(option.value)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, { borderColor: selectedValue === option.value ? useThemeColor({ light: '#007AFF', dark: '#0A84FF' }, 'tint') : useThemeColor({ light: '#ccc', dark: '#555' }, 'icon') }, selectedValue === option.value && { backgroundColor: useThemeColor({ light: '#007AFF', dark: '#0A84FF' }, 'tint') }]}>
              {selectedValue === option.value && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={[styles.label, { color }]}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  groupContainer: {
    marginBottom: 16,
  },
  groupLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  label: {
    fontSize: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
});
