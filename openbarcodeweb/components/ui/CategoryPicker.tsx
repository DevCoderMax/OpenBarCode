import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, View, Pressable, FlatList, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { Input } from './Input';
import { Button } from './Button';
import { Category } from '@/types';
import { API_URL } from '../../constants/Api';
import { useThemeColor } from '@/hooks/useThemeColor';

interface CategoryPickerProps {
  label: string;
  onValueChange: (categories: Category[]) => void;
  selectedCategories: Category[];
}

export function CategoryPicker({ label, onValueChange, selectedCategories }: CategoryPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const borderColor = useThemeColor({}, 'border');
  const itemSeparatorColor = useThemeColor({ light: '#eee', dark: '#333' }, 'border');
  const iconColor = useThemeColor({}, 'icon');

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
      const response = await fetch(`${API_URL}/api/v1/categories/search/?name=${query}`);
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

  function toggleCategory(category: Category) {
    const isSelected = selectedCategories.some(cat => cat.id === category.id);
    
    if (isSelected) {
      // Remove categoria
      const newCategories = selectedCategories.filter(cat => cat.id !== category.id);
      onValueChange(newCategories);
    } else {
      // Adiciona categoria
      const newCategories = [...selectedCategories, category];
      onValueChange(newCategories);
    }
  }

  function removeCategory(categoryId: number) {
    const newCategories = selectedCategories.filter(cat => cat.id !== categoryId);
    onValueChange(newCategories);
  }

  async function handleAddNewCategory() {
    if (!newCategoryName.trim()) {
      Alert.alert('Atenção', 'O nome da categoria não pode ser vazio.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/categories/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategoryName }),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.detail || 'Falha ao criar a categoria.');
      }

      Alert.alert('Sucesso', 'Categoria criada e adicionada!');
      toggleCategory(responseData); // Adiciona a nova categoria
      setNewCategoryName('');

    } catch (error: any) {
      Alert.alert('Erro ao criar categoria', error.message);
    } finally {
      setLoading(false);
    }
  }

  function isCategorySelected(categoryId: number): boolean {
    return selectedCategories.some(cat => cat.id === categoryId);
  }

  const selectedCategoriesText = selectedCategories.length > 0 
    ? selectedCategories.map(cat => cat.name).join(', ')
    : 'Selecione categorias';

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      
      {/* Categorias selecionadas */}
      {selectedCategories.length > 0 && (
        <View style={styles.selectedContainer}>
          {selectedCategories.map(category => (
            <View key={category.id} style={[styles.selectedItem, { borderColor }]}>
              <ThemedText style={styles.selectedText}>{category.name}</ThemedText>
              <Pressable onPress={() => removeCategory(category.id)}>
                <MaterialIcons name="close" size={16} color={iconColor} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <Pressable style={[styles.pickerDisplay, { borderColor }]} onPress={() => setModalVisible(true)}>
        <ThemedText numberOfLines={2}>{selectedCategoriesText}</ThemedText>
        <MaterialIcons name="expand-more" size={20} color={iconColor} />
      </Pressable>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <Input
              placeholder="Pesquisar categoria..."
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
                    onPress={() => toggleCategory(item)}>
                    <View style={styles.itemContent}>
                      <ThemedText>{item.name}</ThemedText>
                      {isCategorySelected(item.id) && (
                        <MaterialIcons name="check" size={20} color="#10b981" />
                      )}
                    </View>
                  </Pressable>
                )}
                ListEmptyComponent={<ThemedText style={styles.emptyText}>Nenhuma categoria encontrada.</ThemedText>}
              />
            )}

            <View style={[styles.addCategoryContainer, { borderTopColor: itemSeparatorColor }]}>
              <Input
                placeholder="Ou adicione uma nova categoria"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
              />
              <Button
                title="Adicionar e Selecionar"
                onPress={handleAddNewCategory}
                disabled={loading || !newCategoryName.trim()}
                style={{ marginTop: 8 }}
              />
            </View>

            <Button title="Fechar" onPress={() => setModalVisible(false)} style={styles.closeButton} />
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
  selectedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  selectedText: {
    fontSize: 14,
  },
  pickerDisplay: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  addCategoryContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#dc3545',
  },
});