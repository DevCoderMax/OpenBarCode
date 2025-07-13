import React, { useState } from 'react';
import { StyleSheet, View, Pressable, FlatList, Modal } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Button } from './Button';

export type DropdownItem<T = string | number> = {
  label: string;
  value: T;
  disabled?: boolean;
};

interface DropdownProps<T = string | number> {
  label?: string;
  items: DropdownItem<T>[];
  selectedValue: T | null;
  onValueChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  maxHeight?: number;
  inline?: boolean;
}

export function Dropdown<T = string | number>({
  label,
  items,
  selectedValue,
  onValueChange,
  placeholder = 'Selecione uma opção',
  disabled = false,
  maxHeight = 300,
  inline = false,
}: DropdownProps<T>) {
  const [modalVisible, setModalVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'background');
  const disabledColor = useThemeColor({ light: '#ccc', dark: '#555' }, 'text');
  const itemSeparatorColor = useThemeColor({ light: '#eee', dark: '#333' }, 'border');

  const selectedLabel = items.find(item => item.value === selectedValue)?.label || placeholder;

  function handleSelect(value: T) {
    onValueChange(value);
    if (inline) {
      setIsOpen(false);
    } else {
      setModalVisible(false);
    }
  }

  function toggleDropdown() {
    if (!disabled) {
      if (inline) {
        setIsOpen(!isOpen);
      } else {
        setModalVisible(true);
      }
    }
  }

  return (
    <View style={[styles.container, inline && styles.relativeContainer]}>
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}
      <Pressable
        style={[
          styles.dropdownDisplay,
          { borderColor, backgroundColor },
          disabled && styles.disabled,
        ]}
        onPress={toggleDropdown}
        disabled={disabled}>
        <ThemedText style={[styles.displayText, disabled && { color: disabledColor }]}>
          {selectedLabel}
        </ThemedText>
        <ThemedText style={[styles.arrow, disabled && { color: disabledColor }]}>
          {inline ? (isOpen ? '▲' : '▼') : '▼'}
        </ThemedText>
      </Pressable>

      {/* Inline dropdown list */}
      {inline && isOpen && (
        <ThemedView style={[styles.inlineDropdown, { borderColor, maxHeight }]}>
          <FlatList
            data={items}
            keyExtractor={(item, index) => `${item.value}-${index}`}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.item,
                  { borderBottomColor: itemSeparatorColor },
                  item.disabled && styles.itemDisabled,
                ]}
                onPress={() => handleSelect(item.value)}
                disabled={item.disabled}>
                <ThemedText
                  style={[
                    styles.itemText,
                    item.disabled && { color: disabledColor },
                    item.value === selectedValue && styles.selectedItemText,
                  ]}>
                  {item.label}
                </ThemedText>
              </Pressable>
            )}
            showsVerticalScrollIndicator={true}
          />
        </ThemedView>
      )}

      {/* Modal dropdown */}
      {!inline && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <ThemedView style={[styles.modalContent, { maxHeight }]}>
              <FlatList
                data={items}
                keyExtractor={(item, index) => `${item.value}-${index}`}
                renderItem={({ item }) => (
                  <Pressable
                    style={[
                      styles.item,
                      { borderBottomColor: itemSeparatorColor },
                      item.disabled && styles.itemDisabled,
                    ]}
                    onPress={() => handleSelect(item.value)}
                    disabled={item.disabled}>
                    <ThemedText
                      style={[
                        styles.itemText,
                        item.disabled && { color: disabledColor },
                        item.value === selectedValue && styles.selectedItemText,
                      ]}>
                      {item.label}
                    </ThemedText>
                  </Pressable>
                )}
                showsVerticalScrollIndicator={true}
              />
              <Button
                title="Fechar"
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              />
            </ThemedView>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  relativeContainer: {
    position: 'relative',
    zIndex: 1,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownDisplay: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  disabled: {
    opacity: 0.5,
  },
  displayText: {
    flex: 1,
    fontSize: 16,
  },
  arrow: {
    fontSize: 12,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    borderRadius: 10,
    padding: 20,
  },
  item: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  itemDisabled: {
    opacity: 0.5,
  },
  itemText: {
    fontSize: 16,
  },
  selectedItemText: {
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 16,
  },
  inlineDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderTopWidth: 0,
    borderRadius: 8,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginTop: -1,
    zIndex: 1000,
    elevation: 5,
  },
});