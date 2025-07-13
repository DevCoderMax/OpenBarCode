import React, { useState } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { BarcodeInput } from '@/components/ui/BarcodeInput';
import { ProductForm } from '@/components/ui/ProductForm';
import { BarcodeScanner } from '@/components/ui/BarcodeScanner';
import { useProductScanner } from '@/hooks/useProductScanner';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';

export default function ScanScreen() {
  const [barcode, setBarcode] = useState('');
  const {
    product,
    isLoading,
    isSaving,
    productFound,
    searchProduct,
    saveProduct,
    updateProduct,
    clearProduct,
  } = useProductScanner();
  
  const {
    isScanning,
    permission,
    startScanning,
    stopScanning,
    requestCameraPermission,
    handleBarCodeScanned,
  } = useBarcodeScanner();

  const handleSearch = () => {
    searchProduct(barcode);
  };

  const handleScan = () => {
    startScanning();
  };

  const handleBarcodeScanned = (data: string) => {
    setBarcode(data);
    searchProduct(data);
  };

  const handleSave = async () => {
    await saveProduct();
    setBarcode('');
    clearProduct();
  };

  return (
    <ThemedView style={styles.container}>
      <BarcodeInput
        value={barcode}
        onChangeText={setBarcode}
        onScan={handleScan}
        onSearch={handleSearch}
      />

      {isLoading && <ActivityIndicator size="large" style={styles.loader} />}

      {product && (
        <ProductForm
          product={product}
          onUpdate={updateProduct}
          onSave={handleSave}
          isSaving={isSaving}
          isNewProduct={!productFound}
        />
      )}

      <BarcodeScanner
        visible={isScanning}
        onClose={stopScanning}
        onBarcodeScanned={handleBarcodeScanned}
        hasPermission={permission?.granted || false}
        onRequestPermission={requestCameraPermission}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  loader: {
    marginTop: 20,
  },
});
