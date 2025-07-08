import React, { useState, useCallback } from 'react';
import { View, TextInput, Modal, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import { Button } from '@/components/ui/Button';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

export default function ScanScreen() {
  const [barcode, setBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  useFocusEffect(
    useCallback(() => {
      setIsScanning(false);
      return () => {};
    }, [])
  );

  const handleBarCodeScanned = useCallback(({ data }: BarcodeScanningResult) => {
    if (isScanning) {
      setIsScanning(false);
      setBarcode(data);
      console.log('Código escaneado:', data);
    }
  }, [isScanning]);

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

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
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
          style={styles.scanButton}
        >
          <MaterialIcons name="photo-camera" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isScanning}
        animationType="slide"
        onRequestClose={() => setIsScanning(false)}
        statusBarTranslucent
      >
        <View style={styles.modalContainer}>
          {!permission?.granted ? (
            <View style={styles.permissionContainer}>
              <Text style={styles.permissionText}>
                Precisamos da sua permissão para acessar a câmera.
              </Text>
              <View style={styles.buttonGroup}>
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
              </View>
            </View>
          ) : (
            <View style={styles.cameraContainer}>
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
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  scanButton: {
    backgroundColor: '#2563eb',
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  permissionText: {
    color: 'white',
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
});
