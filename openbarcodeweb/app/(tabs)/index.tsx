import React, { useState, useCallback } from 'react';
import {
  TextInput,
  Modal,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Button } from '@/components/ui/Button';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Input } from '@/components/ui/Input';
import { ThemedSwitch } from '@/components/ui/ThemedSwitch';
import { CheckboxGroup } from '@/components/ui/Checkbox';
import { SearchablePicker } from '@/components/ui/SearchablePicker';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { API_URL } from '../../constants/Api';
import { parseImageUrls, stringifyImageUrls } from '@/utils/imageUtils';
import { Product } from '@/models/Product';

const measureTypeItems = ['l', 'ml', 'kg', 'g', 'un'].map(type => ({ label: type.toUpperCase(), value: type }));

export default function ScanScreen() {
  const [barcode, setBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [productFound, setProductFound] = useState(false);
  const [isFetchingExternalData, setIsFetchingExternalData] = useState(false);
  
  // Convert images string to array for the ImageUpload component
  const imagesArray = parseImageUrls(product?.images || null);

  useFocusEffect(
    useCallback(() => {
      // Limpa o estado quando a tela perde o foco
      return () => {
        setProduct(null);
        setBarcode('');
        setProductFound(false);
      };
    }, [])
  );

  const handleSearch = async (code: string) => {
    if (!code) {
      Alert.alert('Atenção', 'Por favor, digite ou escaneie um código de barras.');
      return;
    }

    setIsLoading(true);
    setProduct(null);

    try {
      // A rota na API é /api/v1/products/search/?barcode=...
      const response = await fetch(`${API_URL}/api/v1/products/search/?barcode=${code}`);
      
      if (!response.ok) {
        throw new Error('Falha ao buscar o produto.');
      }

      const data: Product[] = await response.json();

      if (data.length > 0) {
        setProduct(data[0]);
        setProductFound(true);
        Alert.alert('Sucesso', 'Produto encontrado e pronto para edição.');
      } else {
        setProduct({
          name: '',
          barcode: code,
          status: true,
          description: '',
          images: '',
          measure_type: 'un',
          measure_value: 0,
          qtt: 1,
        });
        setProductFound(false);
        Alert.alert('Informação', 'Produto não encontrado. Preencha os dados para adicioná-lo.');
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Ocorreu um erro ao buscar o produto.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBarCodeScanned = useCallback(({ data }: BarcodeScanningResult) => {
    if (isScanning) {
      setIsScanning(false);
      setBarcode(data);
      handleSearch(data); // Chama a busca automaticamente
    }
  }, [isScanning, handleSearch]);

  const handleSave = async () => {
    if (!product) return;

    setIsSaving(true);
    try {
      const url = productFound
        ? `${API_URL}/api/v1/products/${product.id}`
        : `${API_URL}/api/v1/products/`;

      const method = productFound ? 'PUT' : 'POST';

      const productData: any = {
        ...product,
        measure_value: product.measure_value ? parseFloat(String(product.measure_value).replace(',', '.')) : undefined,
        qtt: product.qtt ? parseInt(String(product.qtt), 10) : undefined,
      };

      // Remove a chave 'id' para a criação de um novo produto
      if (!productFound) {
        delete productData.id;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falha ao salvar o produto');
      }

      Alert.alert('Sucesso', `Produto ${productFound ? 'atualizado' : 'criado'} com sucesso!`);
      setProduct(null); // Limpa o formulário
      setBarcode('');

    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const requestCameraPermission = async () => {
    const { granted } = await requestPermission();
    if (granted) {
      setIsScanning(true);
    } else {
      Alert.alert(
        'Permissão necessária',
        'Precisamos da permissão da câmera para escanear códigos de barras.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleFetchExternalProductData = async () => {
    if (!product?.barcode) {
      Alert.alert('Erro', 'Código de barras não encontrado.');
      return;
    }

    setIsFetchingExternalData(true);
    try {
      // Aqui você pode usar uma API externa como Open Food Facts, UPC Database, etc.
      // Exemplo usando Open Food Facts (gratuita)
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${product.barcode}.json`);
      
      if (!response.ok) {
        throw new Error('Falha ao buscar dados externos');
      }

      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        const productData = data.product;
        
        // Preencher automaticamente os campos com os dados encontrados
        setProduct({
          ...product,
          name: productData.product_name || product.name,
          description: productData.generic_name || productData.product_name || product.description,
          brand_id: product.brand_id,
          brand: productData.brands ? { id: 0, name: productData.brands } : product.brand,
          measure_type: product.measure_type,
          measure_value: product.measure_value,
          qtt: product.qtt,
          status: product.status,
          images: product.images,
        });

        Alert.alert('Sucesso', 'Dados do produto carregados automaticamente!');
      } else {
        Alert.alert('Informação', 'Nenhum dado encontrado para este código de barras.');
      }
    } catch (error: any) {
      Alert.alert('Erro', 'Falha ao buscar dados externos. Tente novamente.');
      console.error('Error fetching external data:', error);
    } finally {
      setIsFetchingExternalData(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite o código de barras"
          value={barcode}
          onChangeText={setBarcode}
          keyboardType="number-pad"
          placeholderTextColor="#999"
        />
        <TouchableOpacity 
          onPress={requestCameraPermission}
          style={styles.iconButton}
        >
          <MaterialIcons name="photo-camera" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => handleSearch(barcode)}
          style={styles.iconButton}
        >
          <MaterialIcons name="search" size={24} color="white" />
        </TouchableOpacity>
      </ThemedView>

      {isLoading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

      {product && (
        <ScrollView style={styles.formContainer}>
          <ThemedText type="title" style={styles.title}>
            {productFound ? 'Editar Produto' : 'Adicionar Novo Produto'}
          </ThemedText>

          {/* Botão para buscar dados externos - só aparece para produtos não cadastrados */}
          {!productFound && product?.barcode && (
            <Button
              title={isFetchingExternalData ? '🔍 Buscando dados...' : '🔍 Buscar dados do produto'}
              onPress={handleFetchExternalProductData}
              disabled={isFetchingExternalData}
              style={styles.externalDataButton}
            />
          )}

          <Input
            label="Nome do Produto"
            value={product.name}
            onChangeText={(text) => setProduct({ ...product, name: text })}
          />
          <Input
            label="Descrição"
            value={product.description || ''}
            onChangeText={(text) => setProduct({ ...product, description: text })}
            multiline
          />
          <Input
            label="Código de Barras"
            value={product.barcode || ''}
            editable={false} // Não editável após a busca
          />
          <ImageUpload
            label="Product Images"
            images={imagesArray}
            onImagesChange={(images) => setProduct({ ...product, images: stringifyImageUrls(images) })}
            maxImages={5}
          />
          <Input
            label="Valor da Medida"
            value={String(product.measure_value || '')}
            onChangeText={(text) => setProduct({ ...product, measure_value: parseFloat(text.replace(/[^0-9.,]/g, '')) })}
            keyboardType="numeric"
          />
          <CheckboxGroup
            label="Tipo de Medida"
            options={measureTypeItems}
            selectedValue={product.measure_type || 'un'}
            onValueChange={(value) => setProduct({ ...product, measure_type: value as string })}
          />
          <Input
            label="Quantidade"
            value={String(product.qtt || '')}
            onChangeText={(text) => setProduct({ ...product, qtt: parseInt(text.replace(/[^0-9]/g, ''), 10) || 0 })}
            keyboardType="numeric"
          />
          <SearchablePicker
            label="Marca"
            selectedLabel={product.brand ? product.brand.name : ''}
            onValueChange={(brand) => {
              setProduct({ ...product, brand_id: brand.id, brand: brand });
            }}
          />
          <ThemedSwitch
            label="Status (Ativo)"
            value={product.status}
            onValueChange={(value) => setProduct({ ...product, status: value })}
          />

          <Button
            title={isSaving ? 'Salvando...' : 'Salvar Alterações'}
            onPress={handleSave}
            disabled={isSaving}
            style={{ marginTop: 24 }}
          />
        </ScrollView>
      )}

      <Modal
        visible={isScanning}
        animationType="slide"
        onRequestClose={() => setIsScanning(false)}
        statusBarTranslucent
      >
        <ThemedView style={styles.modalContainer}>
          {!permission?.granted ? (
            <ThemedView style={styles.permissionContainer}>
              <ThemedText style={styles.permissionText}>
                Precisamos da sua permissão para acessar a câmera.
              </ThemedText>
              <ThemedView style={styles.buttonGroup}>
                <Button 
                  title="Permitir" 
                  onPress={requestCameraPermission}
                  style={styles.allowButton}
                />
                <Button 
                  title="Cancelar" 
                  onPress={() => setIsScanning(false)}
                  style={styles.cancelButton}
                />
              </ThemedView>
            </ThemedView>
          ) : (
            <ThemedView style={styles.cameraContainer}>
              <CameraView
                style={styles.camera}
                facing="back"
                barcodeScannerSettings={{
                  barcodeTypes: ['ean13', 'ean8', 'code128', 'code39', 'code93', 'upc_a', 'upc_e', 'qr'],
                }}
                onBarcodeScanned={isScanning ? handleBarCodeScanned : undefined}
              />
              <TouchableOpacity 
                onPress={() => setIsScanning(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={28} color="white" />
              </TouchableOpacity>
            </ThemedView>
          )}
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    fontSize: 16,
  },
  iconButton: {
    backgroundColor: '#2563eb',
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonGroup: {
    width: '80%',
  },
  allowButton: {
    backgroundColor: '#2563eb',
    marginBottom: 12,
    height: 50,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    height: 50,
    borderRadius: 8,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  formContainer: {
    marginTop: 20,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  externalDataButton: {
    backgroundColor: '#10b981',
    marginBottom: 16,
    height: 50,
    borderRadius: 8,
  },
});
