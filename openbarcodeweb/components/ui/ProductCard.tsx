import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Product } from '@/types';
import { ThemedText } from '@/components/ThemedText';
import { getFirstImage, getThumbnailUrl } from '@/utils/imageUtils';
import { ThemedView } from '@/components/ThemedView';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/product/${product.id}`);
  };

  const firstImage = getFirstImage(product.images);
  const thumbUrl = firstImage ? getThumbnailUrl(firstImage, 100, 100, 60) : undefined;

  return (
    <TouchableOpacity onPress={handlePress}>
      <ThemedView style={styles.card}>
        {firstImage ? (
          <Image
            source={{ uri: thumbUrl }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage]} />
        )}
        <View style={styles.infoContainer}>
          <ThemedText type="subtitle">{product.name}</ThemedText>
          <ThemedText>{product.brand?.name || 'No brand'}</ThemedText>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  placeholderImage: {
    backgroundColor: '#eee',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});
