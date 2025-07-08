import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, View, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { Input } from './Input';
import { Button } from './Button';
import { Brand } from '@/types';
import { API_URL } from '../../constants/Api';
import { useThemeColor } from '@/hooks/useThemeColor';

interface SearchablePickerProps {
  label: string;
  onValueChange: (brand: Brand) => void;
  selectedLabel: string | null;
}

export function SearchablePicker({ label, onValueChange, selectedLabel }: SearchablePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);

  const borderColor = useThemeColor({}, 'border');
  const itemSeparatorColor = useThemeColor({ light: '#eee', dark: '#333' }, 'border');

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  async function performSearch(query: string) {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/brands/search/?name=${query}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error(error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(brand: Brand) {
    onValueChange(brand);
    setModalVisible(false);
    setSearchQuery('');
    setSearchResults([]);
  }

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <Pressable style={[styles.pickerDisplay, { borderColor }]} onPress={() => setModalVisible(true)}>
        <ThemedText>{selectedLabel || 'Selecione uma marca'}</ThemedText>
      </Pressable>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <Input
              placeholder="Pesquisar marca..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {loading ? (
              <ActivityIndicator />
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <Pressable
                    style={[styles.item, { borderBottomColor: itemSeparatorColor }]}
                    onPress={() => handleSelect(item)}>
                    <ThemedText>{item.name}</ThemedText>
                  </Pressable>
                )}
                ListEmptyComponent={<ThemedText style={styles.emptyText}>Nenhuma marca encontrada.</ThemedText>}
              />
            )}
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
    maxHeight: '80%',
    borderRadius: 10,
    padding: 20,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
