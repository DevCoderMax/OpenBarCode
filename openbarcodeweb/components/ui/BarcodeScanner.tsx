import React from 'react';
import { Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { CameraView } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { Button } from './Button';

interface BarcodeScannerProps {
  visible: boolean;
  onClose: () => void;
  onBarcodeScanned: (data: string) => void;
  hasPermission: boolean;
  onRequestPermission: () => void;
}

export function BarcodeScanner({ 
  visible, 
  onClose, 
  onBarcodeScanned, 
  hasPermission, 
  onRequestPermission 
}: BarcodeScannerProps) {
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    onBarcodeScanned(data);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <ThemedView style={styles.modalContainer}>
        {!hasPermission ? (
          <ThemedView style={styles.permissionContainer}>
            <ThemedText style={styles.permissionText}>
              Precisamos da sua permissão para acessar a câmera.
            </ThemedText>
            <ThemedView style={styles.buttonGroup}>
              <Button 
                title="Permitir" 
                onPress={onRequestPermission}
                style={styles.allowButton}
              />
              <Button 
                title="Cancelar" 
                onPress={onClose}
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
              onBarcodeScanned={handleBarCodeScanned}
            />
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={28} color="white" />
            </TouchableOpacity>
          </ThemedView>
        )}
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
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