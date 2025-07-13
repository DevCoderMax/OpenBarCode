import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { getThumbnailUrl } from '@/utils/imageUtils';

interface ImageCarouselProps {
  images: string[];
  height?: number;
  showIndicators?: boolean;
  useThumbnails?: boolean;
}

export function ImageCarousel({ 
  images, 
  height = 200, 
  showIndicators = true,
  useThumbnails = true
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const { width: screenWidth } = Dimensions.get('window');
  
  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const index = Math.round(contentOffset.x / screenWidth);
    setCurrentIndex(index);
  };

  if (!images || images.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <View style={[styles.placeholder, { height }]}>
          <MaterialIcons name="image" size={48} color="#ccc" />
          <ThemedText style={styles.placeholderText}>No images</ThemedText>
        </View>
      </View>
    );
  }

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    setCurrentIndex(newIndex);
    scrollViewRef.current?.scrollTo({ x: newIndex * screenWidth, animated: true });
  };

  const handleNext = () => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    scrollViewRef.current?.scrollTo({ x: newIndex * screenWidth, animated: true });
  };

  // Calcular tamanho do thumbnail baseado na altura do carrossel
  const getThumbnailSize = () => {
    if (height <= 150) return { w: 200, h: 150, quality: 70 };
    if (height <= 250) return { w: 300, h: 250, quality: 75 };
    return { w: 400, h: 300, quality: 80 };
  };

  const { w, h, quality } = getThumbnailSize();

  return (
    <View style={[styles.container, { height }]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={{ height }}
      >
        {images.map((imageUrl, index) => {
          const imageSource = useThumbnails 
            ? getThumbnailUrl(imageUrl, w, h, quality)
            : imageUrl;
          
          return (
            <Image
              key={index}
              source={{ uri: imageSource }}
              style={[styles.image, { height, width: screenWidth }]}
              contentFit="cover"
              priority={index <= 2 ? 'high' : 'normal'}
            />
          );
        })}
      </ScrollView>
      
      {images.length > 1 && (
        <>
          <TouchableOpacity
            style={[styles.navButton, styles.prevButton]}
            onPress={handlePrevious}
          >
            <MaterialIcons name="chevron-left" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.navButton, styles.nextButton]}
            onPress={handleNext}
          >
            <MaterialIcons name="chevron-right" size={24} color="white" />
          </TouchableOpacity>
        </>
      )}

      {showIndicators && images.length > 1 && (
        <View style={styles.indicators}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentIndex && styles.activeIndicator,
              ]}
            />
          ))}
        </View>
      )}

          {images.length > 1 && (
        <View style={styles.counter}>
          <ThemedText style={styles.counterText}>
            {currentIndex + 1} / {images.length}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
  },
  placeholder: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    marginTop: 8,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prevButton: {
    left: 10,
  },
  nextButton: {
    right: 10,
  },
  indicators: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: 'white',
  },
  counter: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 