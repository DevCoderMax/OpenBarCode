import React, { useState } from 'react';
import { StyleSheet, View, Modal, Pressable, FlatList } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedView } from '../ThemedView';
import { Button } from './Button';

type PickerItem = {
  label: string;
  value: string | number;
};

interface ThemedPickerProps {
  label: string;
  items: PickerItem[];
  selectedValue: string | number | null;
  onValueChange: (value: string | number) => void;
}

export function ThemedPicker({ label, items, selectedValue, onValueChange }: ThemedPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const borderColor = useThemeColor({}, 'border');
  const itemSeparatorColor = useThemeColor({ light: '#eee', dark: '#333' }, 'border');

  const selectedLabel = items.find(item => item.value === selectedValue)?.label || `Selecione`;

  function handleSelect(value: string | number) {
    onValueChange(value);
    setModalVisible(false);
  }

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <Pressable style={[styles.pickerDisplay, { borderColor }]} onPress={() => setModalVisible(true)}>
        <ThemedText>{selectedLabel}</ThemedText>
      </Pressable>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <FlatList
              data={items}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.item, { borderBottomColor: itemSeparatorColor }]}
                  onPress={() => handleSelect(item.value)}>
                  <ThemedText style={styles.itemText}>{item.label}</ThemedText>
                </Pressable>
              )}
            />
            <Button title="Fechar" onPress={() => setModalVisible(false)} />
          </ThemedView>
        </View>
      </Modal>
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
  pickerDisplay: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '60%',
    borderRadius: 10,
    padding: 20,
  },
  item: {
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  itemText: {
    textAlign: 'center',
    fontSize: 18,
  }
});
