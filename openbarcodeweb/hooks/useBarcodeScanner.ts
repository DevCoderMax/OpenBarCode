import { useState, useCallback } from 'react';
import { useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useNotification } from './useNotification';

export function useBarcodeScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const { alert } = useNotification();

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
      alert(
        'Permissão necessária',
        'Precisamos da permissão da câmera para escanear códigos de barras.',
        'warning'
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