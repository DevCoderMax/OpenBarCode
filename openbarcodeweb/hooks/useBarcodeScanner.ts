import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useCameraPermissions, BarcodeScanningResult } from 'expo-camera';

export function useBarcodeScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const handleBarCodeScanned = useCallback((callback: (data: string) => void) => {
    return ({ data }: BarcodeScanningResult) => {
      if (isScanning) {
        setIsScanning(false);
        callback(data);
      }
    };
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

  const startScanning = () => {
    if (permission?.granted) {
      setIsScanning(true);
    } else {
      requestCameraPermission();
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  return {
    isScanning,
    permission,
    startScanning,
    stopScanning,
    requestCameraPermission,
    handleBarCodeScanned,
  };
}